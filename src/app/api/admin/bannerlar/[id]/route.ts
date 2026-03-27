import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { UpdateBannerBody } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "banners", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ error: "Banner bulunamadı" }, { status: 404 });
  return NextResponse.json(banner);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "banners", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as UpdateBannerBody;

  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Banner bulunamadı" }, { status: 404 });

  const updated = await prisma.banner.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.image_url !== undefined ? { image_url: body.image_url } : {}),
      ...(body.link_url !== undefined ? { link_url: body.link_url } : {}),
      ...(body.link_text !== undefined ? { link_text: body.link_text } : {}),
      ...(body.placement !== undefined ? { placement: body.placement } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
      ...(body.start_at !== undefined ? { start_at: new Date(body.start_at) } : {}),
      ...(body.end_at !== undefined ? { end_at: new Date(body.end_at) } : {}),
      ...(body.target_blank !== undefined ? { target_blank: body.target_blank } : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "Banner",
    resourceId: id,
    oldValue: { title: existing.title, is_active: existing.is_active },
    newValue: { title: updated.title, is_active: updated.is_active },
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "banners", "delete");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Banner bulunamadı" }, { status: 404 });

  await prisma.banner.delete({ where: { id } });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "DELETE",
    resource: "Banner",
    resourceId: id,
    oldValue: { title: existing.title },
    req,
  });

  return NextResponse.json({ success: true });
}
