import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminAuth(req, "partners", "approve");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Partner bulunamadı" }, { status: 404 });

  const partner = await prisma.partner.update({
    where: { id },
    data: { status: "ACTIVE", is_verified: true },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "APPROVE",
    resource: "Partner",
    resourceId: id,
    oldValue: { status: existing.status },
    newValue: { status: partner.status },
    req,
  });

  return NextResponse.json({ message: "Partner başarıyla onaylandı", partner });
}
