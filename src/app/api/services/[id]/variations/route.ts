import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// POST /api/services/[id]/variations - Yeni varyasyon ekle
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, price, duration } = body;

        if (!name || !price || !duration) {
            return NextResponse.json(
                { error: "Zorunlu alanlar eksik" },
                { status: 400 }
            );
        }

        const variation = await prisma.serviceVariation.create({
            data: {
                service_id: id,
                name,
                price: parseFloat(price),
                duration: parseInt(duration),
            },
        });

        return NextResponse.json({ variation }, { status: 201 });
    } catch (error) {
        console.error("Varyasyon oluşturulamadı:", error);
        return NextResponse.json(
            { error: "Varyasyon oluşturulamadı" },
            { status: 500 }
        );
    }
}