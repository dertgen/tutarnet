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
            // Feed bilgilerini al
            const feed = await prisma.feed.findUnique({
                where: { id: feedId },
                include: { partner: true },
            });

            if (!feed) {
                throw new Error("Feed bulunamadı");
            }

            if (!feed.is_active) {
                throw new Error("Feed aktif değil");
            }

            if (!feed.feed_url) {
                throw new Error("Feed URL tanımlanmamış");
            }

            // Senkronizasyon logu oluştur
            const syncLog = await prisma.feedSyncLog.create({
                data: {
                    feed_id: feedId,
                    status: "pending",
                    started_at: new Date(),
                },
            });

            // Feed'i çek
            const response = await fetch(feed.feed_url, {
                headers: {
                    "User-Agent": "TUTAR.NET Feed Bot/1.0",
                    Accept: "application/xml, text/xml, text/csv, */*",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP Hatası: ${response.status} ${response.statusText}`
                );
            }

            const contentType = response.headers.get("content-type") || "";
            let content = await response.text();

            // Content-Type'a göre format belirle
            let format = feed.feed_format || "google_shopping_xml";
            if (
                contentType.includes("csv") ||
                feed.feed_url.endsWith(".csv")
            ) {
                format = "google_shopping_csv";
            } else if (
                contentType.includes("tab-separated") ||
                feed.feed_url.endsWith(".tsv")
            ) {
                format = "google_shopping_tsv";
            }

            // Parse et
            const parser = FeedParserFactory.createParser(format);
            const parseResult = await parser.parse(content);

            totalItems = parseResult.items.length;
            errors.push(...parseResult.errors);

            // Her ürünü işle
            for (const item of parseResult.items) {
                try {
                    const result = await this.processFeedItem(
                        feedId,
                        feed.partner_id,
                        item
                    );

                    if (result === "new") {
                        newItems++;
                    } else if (result === "updated") {
                        updatedItems++;
                    }
                } catch (error) {
                    failedItems++;
                    errors.push(
                        `Ürün ${item.external_id}: ${error instanceof Error ? error.message : "Bilinmeyen hata"
                        }`
                    );
                }
            }

            // Feed'i güncelle
            await prisma.feed.update({
                where: { id: feedId },
                data: {
                    last_fetch: new Date(),
                    last_sync_count: totalItems,
                    fetch_status: errors.length > 0 ? "partial" : "success",
                    error_message:
                        errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
                },
            });

            // Sync log'u güncelle
            await prisma.feedSyncLog.update({
                where: { id: syncLog.id },
                data: {
                    status: errors.length > 0 ? "partial" : "success",
                    items_total: totalItems,
                    items_new: newItems,
                    items_updated: updatedItems,
                    items_failed: failedItems,
                    error_message:
                        errors.length > 0 ? errors.slice(0, 10).join("; ") : null,
                    completed_at: new Date(),
                },
            });

            return {
                success: errors.length === 0,
                totalItems,
                newItems,
                updatedItems,
                failedItems,
                errors,
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Bilinmeyen hata";

            // Feed hata durumunu güncelle
            await prisma.feed.update({
                where: { id: feedId },
                data: {
                    fetch_status: "error",
                    error_message: errorMessage,
                    last_fetch: new Date(),
                },
            });

            return {
                success: false,
                totalItems,
                newItems,
                updatedItems,
                failedItems: totalItems,
                errors: [errorMessage, ...errors],
            };
        }
    }

    /**
     * Tek bir feed item'ını işle
     */
    private async processFeedItem(
        feedId: string,
        partnerId: string,
        item: ParsedFeedItem
    ): Promise<"new" | "updated" | "skipped"> {
        // Önce mevcut feed item'ını kontrol et
        const existingFeedItem = await prisma.feedItem.findUnique({
            where: {
                feed_id_external_id: {
                    feed_id: feedId,
                    external_id: item.external_id,
                },
            },
            include: { product: true },
        });

        // Ürün eşleştirme yap
        let productId: string | null = null;

        if (existingFeedItem?.product_id) {
            // Daha önce eşleştirilmiş
            productId = existingFeedItem.product_id;
        } else {
            // İlk kez işleniyor veya tekrar eşleştirme yap
            productId = await this.findOrCreateProduct(partnerId, item);
        }

        // FeedItem'ı güncelle veya oluştur
        const feedItemData: any = {
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
            google_category_id: item.google_category_id,
            product_type: item.product_type,
            shipping_weight: item.shipping_weight,
            attributes: item.attributes,
            sync_status: productId ? "matched" : "unmatched",
            product_id: productId,
            last_updated: new Date(),
        };

        if (existingFeedItem) {
            await prisma.feedItem.update({
                where: { id: existingFeedItem.id },
                data: feedItemData,
            });
        } else {
            await prisma.feedItem.create({
                data: feedItemData,
            });
        }

        // Eğer ürün bulunduysa veya oluşturulduysa, Price kaydını güncelle
        if (productId) {
            await this.updateOrCreatePrice(partnerId, productId, item);
            return existingFeedItem ? "updated" : "new";
        }

        return "skipped";
    }

    /**
     * Ürün eşleştirme veya yeni ürün oluşturma
     */
    private async findOrCreateProduct(
        partnerId: string,
        item: ParsedFeedItem
    ): Promise<string | null> {
        if (item.gtin) {
            const productByBarcode = await prisma.product.findFirst({
                where: { barcode: item.gtin },
            });
            if (productByBarcode) {
                return productByBarcode.id;
            }
        }

        // 2. MPN + Brand kombinasyonu ile eşleştir
        if (item.mpn && item.brand) {
            const productByMpnBrand = await prisma.product.findFirst({
                where: {
                    model: item.mpn,
                    brand: item.brand,
                },
            });
            if (productByMpnBrand) {
                return productByMpnBrand.id;
            }
        }

        // 3. İsim benzerliği ile eşleştir (basit versiyon)
        const productByName = await prisma.product.findFirst({
            where: {
                name: {
                    equals: item.product_name,
                    mode: "insensitive",
                },
            },
        });
        if (productByName) {
            return productByName.id;
        }

        // 4. Yeni ürün oluştur
        try {
            const slug = this.generateSlug(item.product_name);

            // Slug benzersizliğini kontrol et
            const existingSlug = await prisma.product.findUnique({
                where: { slug },
            });

            const finalSlug = existingSlug
                ? `${slug}-${Date.now()}`
                : slug;

            const newProduct = await prisma.product.create({
                data: {
                    name: item.product_name,
                    slug: finalSlug,
                    brand: item.brand,
                    model: item.mpn,
                    description: item.description,
                    images: item.image_url
                        ? [item.image_url, ...item.additional_images]
                        : [],
                    barcode: item.gtin,
                    specs: item.attributes ? (item.attributes as any) : undefined,
                    partner: {
                        connect: { id: partnerId },
                    },
                },
            });

            return newProduct.id;
        } catch (error) {
            console.error("Ürün oluşturma hatası:", error);
            return null;
        }
    }

    /**
     * Price kaydını güncelle veya oluştur
     */
    private async updateOrCreatePrice(
        partnerId: string,
        productId: string,
        item: ParsedFeedItem
    ): Promise<void> {
        const existingPrice = await prisma.price.findUnique({
            where: {
                product_id_partner_id: {
                    product_id: productId,
                    partner_id: partnerId,
                },
            },
        });

        const priceValue = new Decimal(item.price.toString());
        const salePriceValue = item.sale_price ? new Decimal(item.sale_price.toString()) : null;

        const priceData: any = {
            product_id: productId,
            partner_id: partnerId,
            price: priceValue,
            original_price: salePriceValue,
            currency: item.currency,
            url: item.product_url,
            in_stock: item.availability === "in_stock",
            last_checked: new Date(),
        };

        if (existingPrice) {
            // Fiyat değişmişse history kaydet
            if (existingPrice.price.toString() !== priceValue.toString()) {
                await prisma.priceHistory.create({
                    data: {
                        product_id: productId,
                        partner_id: partnerId,
                        price: existingPrice.price,
                        recorded_at: new Date(),
                    },
                });
            }

            await prisma.price.update({
                where: { id: existingPrice.id },
                data: priceData,
            });
        } else {
            await prisma.price.create({
                data: priceData,
            });
        }
    }

    /**
     * Slug oluştur
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 100);
    }
}
