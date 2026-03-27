import { NextRequest, NextResponse } from "next/server";
import { requirePartnerSession } from "@/lib/partner/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const result = await requirePartnerSession(req);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { session } = result;

  const partner = await prisma.partner.findUnique({
    where: { id: session.partnerId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      sector: true,
      status: true,
      city: true,
      district: true,
      phone: true,
      website: true,
      rating_average: true,
      review_count: true,
      subscription_status: true,
      package_type: true,
      created_at: true,
      _count: {
        select: {
          products: true,
          services: true,
          appointments: true,
          reviews: true,
          feeds: true,
        },
      },
    },
  });

  if (!partner) {
    return NextResponse.json({ error: "Partner bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ partner });
}
