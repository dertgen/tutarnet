import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { UpdateReportBody } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "reports", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reported_by: { select: { id: true, name: true, email: true } },
      resolved_by: { select: { display_name: true, role: true } },
    },
  });

  if (!report) return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "reports", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as UpdateReportBody;

  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });

  const isResolved = body.status === "RESOLVED" || body.status === "DISMISSED";

  const updated = await prisma.report.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.severity !== undefined ? { severity: body.severity } : {}),
      ...(body.resolution_note !== undefined ? { resolution_note: body.resolution_note } : {}),
      ...(isResolved
        ? { resolved_by_id: guard.staff.id, resolved_at: new Date() }
        : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "Report",
    resourceId: id,
    oldValue: { status: existing.status, severity: existing.severity },
    newValue: { status: updated.status, severity: updated.severity },
    req,
  });

  return NextResponse.json(updated);
}
