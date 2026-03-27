import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "users", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar_url: true,
      is_admin: true,
      created_at: true,
      updated_at: true,
      partner: { select: { id: true, name: true, status: true, type: true, city: true } },
      admin_staff: { select: { role: true, is_active: true, created_at: true } },
      _count: { select: { appointments: true, reviews: true, filed_reports: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "users", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as { name?: string; is_admin?: boolean; phone?: string };

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.is_admin !== undefined ? { is_admin: body.is_admin } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "User",
    resourceId: id,
    oldValue: { name: existing.name, is_admin: existing.is_admin, phone: existing.phone },
    newValue: { name: updated.name, is_admin: updated.is_admin, phone: updated.phone },
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "users", "delete");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await prisma.user.findUnique({
    where: { id },
    include: { partner: true },
  }) as ({ partner: { id: string } | null; admin_staff?: { id: string } | null } & Awaited<ReturnType<typeof prisma.user.findUnique>>) | null;
  if (!existing) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    if (existing.partner) {
      await tx.partner.update({
        where: { id: existing.partner.id },
        data: { status: "SUSPENDED" },
      });
    }
    if (existing.admin_staff) {
      await (tx as unknown as { adminStaff: { update: (args: object) => Promise<unknown> } }).adminStaff.update({
        where: { id: existing.admin_staff.id },
        data: { is_active: false },
      });
    }
    await tx.user.update({ where: { id }, data: { is_admin: false } });
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "DELETE",
    resource: "User",
    resourceId: id,
    req,
  });

  return NextResponse.json({ success: true });
}
