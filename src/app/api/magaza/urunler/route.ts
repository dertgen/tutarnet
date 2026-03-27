import { NextRequest, NextResponse } from "next/server";
import { requirePartnerSession } from "@/lib/partner/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const result = await requirePartnerSession(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { session } = result;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("sayfa") ?? "1", 10) || 1);
  const q = searchParams.get("q")?.trim() ?? "";
  const take = 20;
  const skip = (page - 1) * take;

  const where = {
    partner_id: session.partnerId,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { brand: { contains: q, mode: "insensitive" as const } },
        { barcode: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  try {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { updated_at: "desc" },
        take,
        skip,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          images: true,
          barcode: true,
          created_at: true,
          updated_at: true,
          category: { select: { name: true } },
          prices: {
            orderBy: { updated_at: "desc" },
            take: 1,
            select: { price: true, currency: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { total, page, take, totalPages: Math.ceil(total / take) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: "Ürünler alınamadı: " + message }, { status: 500 });
  }
}
