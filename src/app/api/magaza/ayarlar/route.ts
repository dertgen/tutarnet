import { NextRequest, NextResponse } from "next/server";
import { requirePartnerSession } from "@/lib/partner/session";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const result = await requirePartnerSession(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { session } = result;

  const body: {
    name?: string;
    website?: string;
    description?: string;
    phone?: string;
    tax_number?: string;
    city?: string;
    district?: string;
    address?: string;
  } = await req.json();

  const updated = await prisma.partner.update({
    where: { id: session.partnerId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.website !== undefined && { website: body.website }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.tax_number !== undefined && { tax_number: body.tax_number }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.district !== undefined && { district: body.district }),
      ...(body.address !== undefined && { address: body.address }),
    },
    select: {
      id: true,
      name: true,
      website: true,
      description: true,
      phone: true,
      tax_number: true,
      city: true,
      district: true,
      address: true,
    },
  });

  return NextResponse.json({ partner: updated });
}
