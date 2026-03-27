import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// GET /api/services - Hizmet listesi (filtreli)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Filtreler
        const category = searchParams.get("category");
        const partner_id = searchParams.get("partner_id");
        const city = searchParams.get("city");
        const district = searchParams.get("district");
        const min_price = searchParams.get("min_price");
        const max_price = searchParams.get("max_price");
        const search = searchParams.get("search");

        // Sayfalama
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: Prisma.ServiceWhereInput = {
            is_active: true,
            partner: {
                status: "ACTIVE",
            },
        };

        if (category) {
            where.category = {
                slug: category,
            };
        }

        if (partner_id) {
            where.partner_id = partner_id;
        }

        if (city) {
            where.partner = { ...(where.partner as Prisma.PartnerWhereInput), city };
        }

        if (district) {
            where.partner = { ...(where.partner as Prisma.PartnerWhereInput), district };
        }

        if (min_price || max_price) {
            where.OR = [
                {
                    price_min: {
                        gte: min_price ? parseFloat(min_price) : undefined,
                        lte: max_price ? parseFloat(max_price) : undefined,
                    },
                },
                {
                    price_max: {
                        gte: min_price ? parseFloat(min_price) : undefined,
                        lte: max_price ? parseFloat(max_price) : undefined,
                    },
                },
            ];
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    category: {
                        select: { name: true, slug: true },
                    },
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logo_url: true,
                            city: true,
                            district: true,
                            rating_average: true,
                            review_count: true,
                        },
                    },
                    variations: {
                        where: { is_active: true },
                        orderBy: { price: "asc" },
                    },
                    _count: {
                        select: {
                            reviews: true,
                        },
                    },
                },
                orderBy: [
                    { partner: { rating_average: "desc" } },
                    { created_at: "desc" },
                ],
                skip,
                take: limit,
            }),
            prisma.service.count({ where }),
        ]);

        return NextResponse.json({
            services,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Hizmet listesi alınamadı:", error);
        return NextResponse.json(
            { error: "Hizmet listesi alınamadı" },
            { status: 500 }
        );
    }
}

// POST /api/services - Yeni hizmet ekle (Partner paneli)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            partner_id,
            name,
            description,
            duration,
            price_min,
            price_max,
            category_id,
            buffer_time,
            max_booking,
        } = body;

        // Validasyon
        if (!partner_id || !name || !duration || !category_id) {
            return NextResponse.json(
                { error: "Zorunlu alanlar eksik" },
                { status: 400 }
            );
        }

        const service = await prisma.service.create({
            data: {
                partner_id,
                name,
                description,
                duration: parseInt(duration),
                price_min: price_min ? parseFloat(price_min) : null,
                price_max: price_max ? parseFloat(price_max) : null,
                category_id,
                buffer_time: buffer_time ? parseInt(buffer_time) : 0,
                max_booking: max_booking ? parseInt(max_booking) : 1,
            },
            include: {
                category: {
                    select: { name: true, slug: true },
                },
            },
        });

        return NextResponse.json({ service }, { status: 201 });
    } catch (error) {
        console.error("Hizmet oluşturulamadı:", error);
        return NextResponse.json(
            { error: "Hizmet oluşturulamadı" },
            { status: 500 }
        );
    }
}