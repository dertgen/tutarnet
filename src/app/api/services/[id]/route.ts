import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/services/[id] - Hizmet detayı
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                category: true,
                partner: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo_url: true,
                        description: true,
                        phone: true,
                        email: true,
                        address: true,
                        city: true,
                        district: true,
                        latitude: true,
                        longitude: true,
                        rating_average: true,
                        review_count: true,
                        working_hours: true,
                    },
                },
                variations: {
                    where: { is_active: true },
                    orderBy: { price: "asc" },
                },
                staff: {
                    include: {
                        staff: {
                            select: {
                                id: true,
                                name: true,
                                avatar_url: true,
                                bio: true,
                            },
                        },
                    },
                },
                reviews: {
                    take: 5,
                    orderBy: { created_at: "desc" },
                    include: {
                        author: {
                            select: {
                                name: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                        appointments: true,
                    },
                },
            },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Hizmet bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({ service });
    } catch (error) {
        console.error("Hizmet detayı alınamadı:", error);
        return NextResponse.json(
            { error: "Hizmet detayı alınamadı" },
            { status: 500 }
        );
    }
}

// PUT /api/services/[id] - Hizmet güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const service = await prisma.service.update({
            where: { id },
            data: {
                ...body,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ service });
    } catch (error) {
        console.error("Hizmet güncellenemedi:", error);
        return NextResponse.json(
            { error: "Hizmet güncellenemedi" },
            { status: 500 }
        );
    }
}

// DELETE /api/services/[id] - Hizmet sil (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const service = await prisma.service.update({
            where: { id },
            data: {
                is_active: false,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({
            message: "Hizmet başarıyla silindi",
            service
        });
    } catch (error) {
        console.error("Hizmet silinemedi:", error);
        return NextResponse.json(
            { error: "Hizmet silinemedi" },
            { status: 500 }
        );
    }
}