import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

// GET /api/partners - Partner listesi (filtreli)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Filtreler
        const type = searchParams.get("type");
        const sector = searchParams.get("sector");
        const city = searchParams.get("city");
        const district = searchParams.get("district");
        const status = searchParams.get("status") || "ACTIVE";
        const search = searchParams.get("search");

        // Sayfalama
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: Prisma.PartnerWhereInput = {
            status: status as Prisma.EnumPartnerStatusFilter | undefined,
        };

        if (type) where.type = type as Prisma.EnumPartnerTypeFilter;
        if (sector) where.sector = sector as Prisma.EnumServiceSectorFilter;
        if (city) where.city = city;
        if (district) where.district = district;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const [partners, total] = await Promise.all([
            prisma.partner.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo_url: true,
                    type: true,
                    sector: true,
                    city: true,
                    district: true,
                    rating_average: true,
                    review_count: true,
                    _count: {
                        select: {
                            services: true,
                            products: true,
                        },
                    },
                },
                orderBy: [
                    { rating_average: "desc" },
                    { review_count: "desc" },
                ],
                skip,
                take: limit,
            }),
            prisma.partner.count({ where }),
        ]);

        return NextResponse.json({
            partners,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Partner listesi alınamadı:", error);
        return NextResponse.json(
            { error: "Partner listesi alınamadı" },
            { status: 500 }
        );
    }
}

// POST /api/partners - Yeni partner başvurusu
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            email,
            password,
            name,
            partner_name,
            type,
            sector,
            phone,
            partner_email,
            website,
            address,
            city,
            district,
            neighborhood,
            description,
        } = body;

        // Validasyon
        if (!email || !password || !partner_name || !type || !sector) {
            return NextResponse.json(
                { error: "Zorunlu alanlar eksik" },
                { status: 400 }
            );
        }

        // Email kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Bu email adresi zaten kullanımda" },
                { status: 409 }
            );
        }

        // Slug oluştur
        const baseSlug = partner_name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 100);

        let slug = baseSlug;
        let counter = 1;

        while (await prisma.partner.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Şifre hashle
        const passwordHash = await bcrypt.hash(password, 10);

        // Trial bitiş tarihi (1 yıl sonra)
        const trialEndsAt = new Date();
        trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 1);

        // Transaction ile kullanıcı ve partner oluştur
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    name: name || partner_name,
                    password_hash: passwordHash,
                },
            });

            const partner = await tx.partner.create({
                data: {
                    user_id: user.id,
                    type,
                    sector,
                    name: partner_name,
                    slug,
                    phone,
                    email: partner_email || email,
                    website,
                    address,
                    city,
                    district,
                    neighborhood,
                    description,
                    trial_ends_at: trialEndsAt,
                    status: "PENDING",
                },
            });

            return { user, partner };
        });

        return NextResponse.json(
            {
                message: "Başvurunuz alındı. Onay süreci tamamlandığında bilgilendirileceksiniz.",
                partner: {
                    id: result.partner.id,
                    name: result.partner.name,
                    slug: result.partner.slug,
                    status: result.partner.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Partner kaydı oluşturulamadı:", error);
        return NextResponse.json(
            { error: "Partner kaydı oluşturulamadı" },
            { status: 500 }
        );
    }
}