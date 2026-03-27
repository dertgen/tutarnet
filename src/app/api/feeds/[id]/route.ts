import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/feeds/[id] - Feed detayını getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const feed = await prisma.feed.findUnique({
            where: { id },
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
        });

        if (!feed) {
            return NextResponse.json(
                { error: "Feed bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({ feed });
    } catch (error) {
        console.error("Feed detayı alınamadı:", error);
        return NextResponse.json(
            { error: "Feed detayı alınamadı" },
            { status: 500 }
        );
    }
}

// PUT /api/feeds/[id] - Feed güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { feed_url, feed_format, sync_frequency, is_active } = body;

        // Feed'in varlığını kontrol et
        const existingFeed = await prisma.feed.findUnique({
            where: { id },
        });

        if (!existingFeed) {
            return NextResponse.json(
                { error: "Feed bulunamadı" },
                { status: 404 }
            );
        }

        // URL geçerliliğini kontrol et
        if (feed_url) {
            try {
                new URL(feed_url);
            } catch {
                return NextResponse.json(
                    { error: "Geçersiz URL formatı" },
                    { status: 400 }
                );
            }
        }

        // Feed'i güncelle
        const feed = await prisma.feed.update({
            where: { id },
            data: {
                ...(feed_url && { feed_url }),
                ...(feed_format && { feed_format }),
                ...(sync_frequency && { sync_frequency }),
                ...(is_active !== undefined && { is_active }),
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

        return NextResponse.json({ feed });
    } catch (error) {
        console.error("Feed güncellenemedi:", error);
        return NextResponse.json(
            { error: "Feed güncellenemedi" },
            { status: 500 }
        );
    }
}

// DELETE /api/feeds/[id] - Feed sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Feed'in varlığını kontrol et
        const existingFeed = await prisma.feed.findUnique({
            where: { id },
        });

        if (!existingFeed) {
            return NextResponse.json(
                { error: "Feed bulunamadı" },
                { status: 404 }
            );
        }

        // Feed'i sil (ilişkili FeedItem'lar cascade ile silinir)
        await prisma.feed.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Feed başarıyla silindi" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Feed silinemedi:", error);
        return NextResponse.json(
            { error: "Feed silinemedi" },
            { status: 500 }
        );
    }
}