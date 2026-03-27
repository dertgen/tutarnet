import { NextRequest, NextResponse } from "next/server";
import { requirePartnerSession } from "@/lib/partner/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const result = await requirePartnerSession(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { session } = result;

  try {
    const partner = await prisma.partner.findUnique({
      where: { id: session.partnerId },
      select: {
        click_count: true,
        view_count: true,
        updated_at: true,
        _count: { select: { products: true, services: true, appointments: true } },
      },
    });

    if (!partner) {
      return NextResponse.json({ totalClicks: 0, totalViews: 0, activeProducts: 0, activeServices: 0, totalAppointments: 0, lastSync: null });
    }

    return NextResponse.json({
      totalClicks: partner.click_count,
      totalViews: partner.view_count,
      activeProducts: partner._count.products,
      activeServices: partner._count.services,
      totalAppointments: partner._count.appointments,
      lastSync: partner.updated_at,
    });
  } catch {
    return NextResponse.json({ totalClicks: 0, totalViews: 0, activeProducts: 0, activeServices: 0, totalAppointments: 0, lastSync: null });
  }
}
