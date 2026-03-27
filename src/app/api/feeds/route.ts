import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { FeedSyncService } from "@/lib/services/feed-sync";

// GET /api/feeds - Feed listesini getir
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get("store_id");

        const feeds = await prisma.feed.findMany({
            where: storeId ? { partner_id: storeId } : undefined,
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json({ feeds });
    } catch (error) {
        console.error("Feed listesi alınamadı:", error);
        return NextResponse.json(
            { error: "Feed listesi alınamadı" },
            { status: 500 }
        );
    }
}

// POST /api/feeds - Yeni feed oluştur
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            partner_id,
            feed_url,
            feed_format = "google_shopping_xml",
            sync_frequency = "daily",
        } = body;

        // Validasyon
        if (!partner_id || !feed_url) {
            return NextResponse.json(
                { error: "Mağaza ID ve feed URL zorunludur" },
                { status: 400 }
            );
        }

        // URL formatı kontrolü
        try {
            new URL(feed_url);
        } catch {
            return NextResponse.json(
                { error: "Geçersiz URL formatı" },
                { status: 400 }
            );
        }

        // Aynı URL'de feed var mı kontrol et
        const existingFeed = await prisma.feed.findFirst({
            where: {
                partner_id,
                feed_url,
            },
        });

        if (existingFeed) {
            return NextResponse.json(
                { error: "Bu feed URL zaten eklenmiş" },
                { status: 409 }
            );
        }

        // Feed'i oluştur
        const feed = await prisma.feed.create({
            data: {
                partner_id,
                feed_url,
                feed_format,
                sync_frequency,
                fetch_status: "pending",
            },
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return NextResponse.json({ feed }, { status: 201 });
    } catch (error) {
        console.error("Feed oluşturulamadı:", error);
        return NextResponse.json(
            { error: "Feed oluşturulamadı" },
            { status: 500 }
        );
    }
}