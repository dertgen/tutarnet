import { prisma } from "@/lib/db/prisma";
import {
    FeedParserFactory,
    ParsedFeedItem,
} from "@/lib/parsers/feed-parser";
import Decimal from "decimal.js";

export interface SyncResult {
    success: boolean;
    totalItems: number;
    newItems: number;
    updatedItems: number;
    failedItems: number;
    errors: string[];
}

export class FeedSyncService {
    /**
     * Feed'i çek, parse et ve senkronize et
     */
    async syncFeed(feedId: string): Promise<SyncResult> {
        const errors: string[] = [];
        let totalItems = 0;
        let newItems = 0;
        let updatedItems = 0;
        let failedItems = 0;

        try {
            const feed = await prisma.feed.findUnique({
                where: { id: feedId },
                include: { partner: true },
            });

            if (!feed || !feed.is_active || !feed.feed_url) {
                throw new Error("Geçersiz veya aktif olmayan feed");
            }

            const syncLog = await prisma.feedSyncLog.create({
                data: {
                    feed_id: feedId,
                    status: "pending",
                    started_at: new Date(),
                },
            });

            const response = await fetch(feed.feed_url, {
                headers: {
                    "User-Agent": "TUTAR.NET Feed Bot/1.0",
                    Accept: "application/xml, text/xml, text/csv, */*",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP Hatası: ${response.status}`);
            }

            const content = await response.text();
            const format = feed.feed_format || "google_shopping_xml";
            const parser = FeedParserFactory.createParser(format);
            const parseResult = await parser.parse(content);

            totalItems = parseResult.items.length;
            
            // Performans için batch işleme (N+1 problemini azaltmak için)
            // Not: Tam bulk insert/update için Prisma'nın sınırlamaları nedeniyle 
            // her item için hala işlem yapılıyor ancak transaction içinde gruplanabilir.
            // Gerçek bir üretim ortamında burada 'upsert' veya ham SQL kullanılabilir.
            
            for (const item of parseResult.items) {
                try {
                    const result = await this.processFeedItem(
                        feedId,
                        feed.partner_id,
                        item
                    );

                    if (result === "new") newItems++;
                    else if (result === "updated") updatedItems++;
                } catch (error) {
                    failedItems++;
                    if (errors.length < 50) {
                        errors.push(`Ürün ${item.external_id}: ${error instanceof Error ? error.message : "Hata"}`);
                    }
                }
            }

            await prisma.feed.update({
                where: { id: feedId },
                data: {
                    last_fetch: new Date(),
                    last_sync_count: totalItems,
                    fetch_status: errors.length > 0 ? "partial" : "success",
                    error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
                },
            });

            await prisma.feedSyncLog.update({
                where: { id: syncLog.id },
                data: {
                    status: errors.length > 0 ? "partial" : "success",
                    items_total: totalItems,
                    items_new: newItems,
                    items_updated: updatedItems,
                    items_failed: failedItems,
                    error_message: errors.length > 0 ? errors.slice(0, 10).join("; ") : null,
                    completed_at: new Date(),
                },
            });

            return { success: errors.length === 0, totalItems, newItems, updatedItems, failedItems, errors };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
            await prisma.feed.update({
                where: { id: feedId },
                data: { fetch_status: "error", error_message: errorMessage, last_fetch: new Date() },
            });
            return { success: false, totalItems, newItems, updatedItems, failedItems: totalItems, errors: [errorMessage] };
        }
    }

    private async processFeedItem(
        feedId: string,
        partnerId: string,
        item: ParsedFeedItem
    ): Promise<"new" | "updated" | "skipped"> {
        const existingFeedItem = await prisma.feedItem.findUnique({
            where: { feed_id_external_id: { feed_id: feedId, external_id: item.external_id } },
        });

        let productId = existingFeedItem?.product_id || await this.findOrCreateProduct(partnerId, item);

        const feedItemData = {
            feed_id: feedId,
            external_id: item.external_id,
            product_name: item.product_name,
            description: item.description,
            product_url: item.product_url,
            image_url: item.image_url,
            additional_images: item.additional_images,
            price: item.price.toString(),
            sale_price: item.sale_price ? item.sale_price.toString() : null,
            currency: item.currency,
            availability: item.availability,
            condition: item.condition,
            brand: item.brand,
            gtin: item.gtin,
            mpn: item.mpn,
            sync_status: productId ? "matched" : "unmatched",
            product_id: productId,
            last_updated: new Date(),
        };

        if (existingFeedItem) {
            await prisma.feedItem.update({ where: { id: existingFeedItem.id }, data: feedItemData });
        } else {
            await prisma.feedItem.create({ data: feedItemData as any });
        }

        if (productId) {
            await this.updateOrCreatePrice(partnerId, productId, item);
            return existingFeedItem ? "updated" : "new";
        }

        return "skipped";
    }

    private async findOrCreateProduct(partnerId: string, item: ParsedFeedItem): Promise<string | null> {
        // 1. GTIN/Barkod ile eşleştir
        if (item.gtin) {
            const p = await prisma.product.findFirst({ where: { barcode: item.gtin } });
            if (p) return p.id;
        }

        // 2. MPN + Brand ile eşleştir
        if (item.mpn && item.brand) {
            const p = await prisma.product.findFirst({ where: { model: item.mpn, brand: item.brand } });
            if (p) return p.id;
        }

        // 3. İsim ile eşleştir
        const pName = await prisma.product.findFirst({
            where: { name: { equals: item.product_name, mode: "insensitive" } },
        });
        if (pName) return pName.id;

        // 4. Yeni ürün oluştur
        try {
            const slug = this.generateSlug(item.product_name);
            const existingProduct = await prisma.product.findUnique({ where: { slug } });
            const finalSlug = existingProduct ? `${slug}-${Math.random().toString(36).substring(2, 7)}` : slug;

            const newProduct = await prisma.product.create({
                data: {
                    name: item.product_name,
                    slug: finalSlug,
                    brand: item.brand,
                    model: item.mpn,
                    description: item.description,
                    images: item.image_url ? [item.image_url, ...item.additional_images] : [],
                    barcode: item.gtin,
                    partner: { connect: { id: partnerId } },
                },
            });
            return newProduct.id;
        } catch (error) {
            return null;
        }
    }

    private async updateOrCreatePrice(partnerId: string, productId: string, item: ParsedFeedItem): Promise<void> {
        const existingPrice = await prisma.price.findUnique({
            where: { product_id_partner_id: { product_id: productId, partner_id: partnerId } },
        });

        const priceValue = new Decimal(item.price.toString());
        const priceData = {
            product_id: productId,
            partner_id: partnerId,
            price: priceValue,
            original_price: item.sale_price ? new Decimal(item.sale_price.toString()) : null,
            currency: item.currency,
            url: item.product_url,
            in_stock: item.availability === "in_stock",
            last_checked: new Date(),
        };

        if (existingPrice) {
            if (existingPrice.price.toString() !== priceValue.toString()) {
                await prisma.priceHistory.create({
                    data: { product_id: productId, partner_id: partnerId, price: existingPrice.price },
                });
            }
            await prisma.price.update({ where: { id: existingPrice.id }, data: priceData });
        } else {
            await prisma.price.create({ data: priceData });
        }
    }

    private generateSlug(name: string): string {
        const trMap: Record<string, string> = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
        };
        let slug = name.split('').map(c => trMap[c] || c).join('');
        return slug
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
            .substring(0, 100);
    }
}
