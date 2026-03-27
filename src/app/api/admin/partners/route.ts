import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import type { PartnersAdminListResponse } from "@/types/admin";

export async function GET(req: NextRequest): Promise<NextResponse<PartnersAdminListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "partners", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10));

  const where: Prisma.PartnerWhereInput = {
    ...(status && status !== "ALL" ? { status: status as "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [partners, total, pending, active, suspended, rejected] = await prisma.$transaction([
    prisma.partner.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { products: true, services: true, appointments: true, reviews: true } },
      },
    }),
    prisma.partner.count({ where }),
    prisma.partner.count({ where: { status: "PENDING" } }),
    prisma.partner.count({ where: { status: "ACTIVE" } }),
    prisma.partner.count({ where: { status: "SUSPENDED" } }),
    prisma.partner.count({ where: { status: "REJECTED" } }),
  ]);

  return NextResponse.json({
    partners: partners.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      sector: p.sector,
      status: p.status,
      city: p.city,
      district: p.district,
      subscription_status: p.subscription_status,
      package_type: p.package_type,
      rating_average: Number(p.rating_average),
      review_count: p.review_count,
      created_at: p.created_at,
      user: p.user,
      _count: p._count,
    })),
    total,
    page,
    page_size: limit,
    counts: { PENDING: pending, ACTIVE: active, SUSPENDED: suspended, REJECTED: rejected },
  });
}
