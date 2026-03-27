import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { UpdateStaffBody } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "staff", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const staff = await prisma.adminStaff.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      permissions: true,
      _count: { select: { audit_logs: true, resolved_reports: true } },
    },
  });

  if (!staff) return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 });
  return NextResponse.json(staff);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "staff", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as UpdateStaffBody;

  const existing = await prisma.adminStaff.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 });

  const updated = await prisma.adminStaff.update({
    where: { id },
    data: {
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
      ...(body.display_name !== undefined ? { display_name: body.display_name } : {}),
      ...(body.avatar_url !== undefined ? { avatar_url: body.avatar_url } : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "AdminStaff",
    resourceId: id,
    oldValue: { role: existing.role, is_active: existing.is_active },
    newValue: { role: updated.role, is_active: updated.is_active },
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "staff", "delete");
  if (!guard.ok) return guard.response;

  if (guard.staff.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yalnızca SUPER_ADMIN personel silebilir" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.adminStaff.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Personel bulunamadı" }, { status: 404 });

  if (existing.id === guard.staff.id) {
    return NextResponse.json({ error: "Kendinizi silemezsiniz" }, { status: 409 });
  }

  const superAdminCount = await prisma.adminStaff.count({ where: { role: "SUPER_ADMIN", is_active: true } });
  if (existing.role === "SUPER_ADMIN" && superAdminCount <= 1) {
    return NextResponse.json({ error: "Son SUPER_ADMIN silinemez" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.permission.deleteMany({ where: { staff_id: id } });
    await tx.adminStaff.delete({ where: { id } });
    await tx.user.update({ where: { id: existing.user_id }, data: { is_admin: false } });
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "DELETE",
    resource: "AdminStaff",
    resourceId: id,
    oldValue: { role: existing.role },
    req,
  });

  return NextResponse.json({ success: true });
}
