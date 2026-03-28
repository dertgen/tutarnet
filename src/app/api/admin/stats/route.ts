import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import type { StatsResponse } from "@/types/admin";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 dakika önbellekleme (Next.js seviyesinde)

export async function GET(req: NextRequest): Promise<NextResponse<StatsResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "analytics", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  try {
    // Performans için transaction yerine paralel Promise kullanımı (DB yükünü dağıtır)
    const [
      totalPartners,
      pendingPartners,
      activePartners,
      suspendedPartners,
      ecommercePartners,
      servicePartners,
      totalUsers,
      newUsersThisMonth,
      totalProducts,
      totalServices,
      totalAppointments,
      openReports,
      recentPartners,
      pendingReports,
      partnerTrendRaw,
      userTrendRaw,
    ] = await Promise.all([
      prisma.partner.count(),
      prisma.partner.count({ where: { status: "PENDING" } }),
      prisma.partner.count({ where: { status: "ACTIVE" } }),
      prisma.partner.count({ where: { status: "SUSPENDED" } }),
      prisma.partner.count({ where: { type: "E_COMMERCE" } }),
      prisma.partner.count({ where: { type: "SERVICE" } }),
      prisma.user.count(),
      prisma.user.count({ where: { created_at: { gte: thisMonthStart } } }),
      prisma.product.count(),
      prisma.service.count(),
      prisma.appointment.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.partner.findMany({
        take: 6,
        orderBy: { created_at: "desc" },
        include: {
          user: { select: { email: true, name: true } },
          _count: { select: { products: true, services: true, reviews: true } },
        },
      }),
      prisma.report.findMany({
        where: { status: "PENDING" },
        take: 3,
        orderBy: { created_at: "desc" },
        select: { id: true, type: true, reason: true, severity: true, target_label: true, created_at: true },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(created_at)::text AS date, COUNT(*)::bigint AS count
        FROM "Partner"
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(created_at)::text AS date, COUNT(*)::bigint AS count
        FROM "User"
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,
    ]);

    return NextResponse.json({
      kpis: {
        total_partners: totalPartners,
        pending_partners: pendingPartners,
        active_partners: activePartners,
        suspended_partners: suspendedPartners,
        total_users: totalUsers,
        new_users_this_month: newUsersThisMonth,
        total_products: totalProducts,
        total_services: totalServices,
        total_appointments: totalAppointments,
        open_reports: openReports,
        ecommerce_partners: ecommercePartners,
        service_partners: servicePartners,
      },
      partner_trend: partnerTrendRaw.map((r) => ({ date: r.date, count: Number(r.count) })),
      user_trend: userTrendRaw.map((r) => ({ date: r.date, count: Number(r.count) })),
      recent_partners: recentPartners.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        sector: p.sector,
        status: p.status,
        city: p.city,
        created_at: p.created_at,
        user: p.user,
        _count: p._count,
      })),
      pending_reports: pendingReports.map((r: any) => ({
        id: r.id,
        type: r.type,
        reason: r.reason,
        severity: r.severity,
        target_label: r.target_label,
        created_at: r.created_at,
      })),
    } as any);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "İstatistikler yüklenirken bir hata oluştu." }, { status: 500 });
  }
}
