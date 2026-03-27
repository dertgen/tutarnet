import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { UpdatePermissionsBody } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "staff", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const permissions = await prisma.permission.findMany({ where: { staff_id: id } });
  return NextResponse.json({ permissions });
}

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "staff", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as UpdatePermissionsBody;

  await prisma.$transaction(async (tx) => {
    await tx.permission.deleteMany({ where: { staff_id: id } });
    if (body.permissions.length > 0) {
      await tx.permission.createMany({
        data: body.permissions.map((p) => ({ ...p, staff_id: id })),
      });
    }
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "Permission",
    resourceId: id,
    newValue: { permissions: body.permissions } as Record<string, unknown>,
    req,
  });

  return NextResponse.json({ success: true });
}
