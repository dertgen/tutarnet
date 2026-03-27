import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 300;

export async function GET(): Promise<NextResponse> {
  try {
    const [partnerCount, productCount, categoryCount] = await Promise.all([
      prisma.partner.count({ where: { status: "ACTIVE" } }),
      prisma.product.count(),
      prisma.category.count({ where: { parent_id: null } }),
    ]);

    return NextResponse.json({ partners: partnerCount, products: productCount, categories: categoryCount });
  } catch {
    return NextResponse.json({ partners: 0, products: 0, categories: 0 });
  }
}
