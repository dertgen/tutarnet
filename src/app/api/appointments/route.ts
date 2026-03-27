import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// GET /api/appointments - Randevu listesi (kullanıcı veya partner için)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customer_id = searchParams.get("customer_id");
        const partner_id = searchParams.get("partner_id");
        const status = searchParams.get("status");

        const where: Prisma.AppointmentWhereInput = {};

        if (customer_id) where.customer_id = customer_id;
        if (partner_id) where.partner_id = partner_id;
        if (status) where.status = status as Prisma.EnumAppointmentStatusFilter;

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                service: {
                    select: {
                        name: true,
                        duration: true,
                    },
                },
                partner: {
                    select: {
                        name: true,
                        logo_url: true,
                        phone: true,
                    },
                },
                customer: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
                staff: {
                    select: {
                        name: true,
                        avatar_url: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({ appointments });
    } catch (error) {
        console.error("Randevu listesi alınamadı:", error);
        return NextResponse.json(
            { error: "Randevu listesi alınamadı" },
            { status: 500 }
        );
    }
}

// POST /api/appointments - Yeni randevu oluştur
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            customer_id,
            partner_id,
            service_id,
            staff_id,
            date,
            start_time,
            variation_id,
            notes,
        } = body;

        // Validasyon
        if (!customer_id || !partner_id || !service_id || !date || !start_time) {
            return NextResponse.json(
                { error: "Zorunlu alanlar eksik" },
                { status: 400 }
            );
        }

        // Hizmet bilgilerini al
        const service = await prisma.service.findUnique({
            where: { id: service_id },
            include: { variations: true },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Hizmet bulunamadı" },
                { status: 404 }
            );
        }

        // Süre ve fiyat hesapla
        let duration = service.duration;
        let price = service.price_min;

        if (variation_id) {
            const variation = service.variations.find((v) => v.id === variation_id);
            if (variation) {
                duration = variation.duration;
                price = variation.price;
            }
        }

        // Bitiş saati hesapla
        const [hours, minutes] = start_time.split(":").map(Number);
        const endDate = new Date(date);
        endDate.setHours(hours, minutes + duration);
        const end_time = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

        // Çakışma kontrolü
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                partner_id,
                staff_id: staff_id || undefined,
                date: new Date(date),
                status: { not: "CANCELLED" },
                OR: [
                    {
                        AND: [
                            { start_time: { lte: start_time } },
                            { end_time: { gt: start_time } },
                        ],
                    },
                    {
                        AND: [
                            { start_time: { lt: end_time } },
                            { end_time: { gte: end_time } },
                        ],
                    },
                ],
            },
        });

        if (existingAppointment) {
            return NextResponse.json(
                { error: "Bu saat diliminde başka bir randevu var" },
                { status: 409 }
            );
        }

        // Randevu oluştur
        const appointment = await prisma.appointment.create({
            data: {
                customer_id,
                partner_id,
                service_id,
                staff_id,
                date: new Date(date),
                start_time,
                end_time,
                price,
                notes,
            },
            include: {
                service: {
                    select: { name: true },
                },
                partner: {
                    select: { name: true, phone: true },
                },
            },
        });

        return NextResponse.json({ appointment }, { status: 201 });
    } catch (error) {
        console.error("Randevu oluşturulamadı:", error);
        return NextResponse.json(
            { error: "Randevu oluşturulamadı" },
            { status: 500 }
        );
    }
}