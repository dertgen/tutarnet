import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/partners/[id] - Partner detayı
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                services: {
                    where: { is_active: true },
                    include: {
                        category: {
                            select: { name: true, slug: true },
                        },
                        variations: {
                            where: { is_active: true },
                        },
                    },
                },
                working_hours: true,
                staff: {
                    where: { is_active: true },
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                        bio: true,
                    },
                },
                media: {
                    take: 10,
                    orderBy: { created_at: "desc" },
                },
                _count: {
                    select: {
                        reviews: true,
                        services: true,
                    },
                },
            },
        });

        if (!partner) {
            return NextResponse.json(
                { error: "Partner bulunamadı" },
                { status: 404 }
            );
        }

        // Görüntüleme sayısını artır
        await prisma.partner.update({
            where: { id },
            data: { view_count: { increment: 1 } },
        });

        return NextResponse.json({ partner });
    } catch (error) {
        console.error("Partner detayı alınamadı:", error);
        return NextResponse.json(
            { error: "Partner detayı alınamadı" },
            { status: 500 }
        );
    }
}

// PUT /api/partners/[id] - Partner güncelleme
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const partner = await prisma.partner.update({
            where: { id },
            data: {
                ...body,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ partner });
    } catch (error) {
        console.error("Partner güncellenemedi:", error);
        return NextResponse.json(
            { error: "Partner güncellenemedi" },
            { status: 500 }
        );
    }
}