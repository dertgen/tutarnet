import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/categories - Kategori listesi
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "service"; // "product" | "service"

        const categories = await prisma.category.findMany({
            where: {
                type,
                parent_id: null, // Ana kategoriler
            },
            include: {
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true,
                    },
                },
                _count: {
                    select: {
                        ...(type === "service" ? { services: true } : {}),
                        ...(type === "product" ? { products: true } : {}),
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error("Kategori listesi alınamadı:", error);
        return NextResponse.json(
            { error: "Kategori listesi alınamadı" },
            { status: 500 }
        );
    }
}