import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { StaffListResponse, CreateStaffBody } from "@/types/admin";

export async function GET(req: NextRequest): Promise<NextResponse<StaffListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "staff", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const staff = await prisma.adminStaff.findMany({
    orderBy: { created_at: "asc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { permissions: true, audit_logs: true, resolved_reports: true } },
    },
  });

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "staff", "write");
  if (!guard.ok) return guard.response;

  const body = (await req.json()) as CreateStaffBody;
  if (!body.user_id || !body.role || !body.display_name) {
    return NextResponse.json({ error: "user_id, rol ve görünen ad zorunludur" }, { status: 400 });
  }

  const userExists = await prisma.user.findUnique({ where: { id: body.user_id } });
  if (!userExists) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const alreadyStaff = await prisma.adminStaff.findUnique({ where: { user_id: body.user_id } });
  if (alreadyStaff) {
    return NextResponse.json({ error: "Bu kullanıcı zaten personel olarak eklenmiş" }, { status: 409 });
  }

  const newStaff = await prisma.$transaction(async (tx) => {
    const created = await tx.adminStaff.create({
      data: { user_id: body.user_id, role: body.role, display_name: body.display_name },
    });
    await tx.user.update({ where: { id: body.user_id }, data: { is_admin: true } });
    if (body.permissions && body.permissions.length > 0) {
      await tx.permission.createMany({
        data: body.permissions.map((p) => ({ ...p, staff_id: created.id })),
      });
    }
    return created;
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "CREATE",
    resource: "AdminStaff",
    resourceId: newStaff.id,
    newValue: { role: newStaff.role, user_id: newStaff.user_id },
    req,
  });

  return NextResponse.json(newStaff, { status: 201 });
}
