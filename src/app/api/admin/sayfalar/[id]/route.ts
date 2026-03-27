import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { UpdatePageBody } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "pages", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "pages", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as UpdatePageBody;

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });

  const updated = await prisma.page.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.template !== undefined ? { template: body.template } : {}),
      ...(body.seo_title !== undefined ? { seo_title: body.seo_title } : {}),
      ...(body.seo_desc !== undefined ? { seo_desc: body.seo_desc } : {}),
      ...(body.og_image !== undefined ? { og_image: body.og_image } : {}),
      ...(body.status === "PUBLISHED" && !existing.published_at
        ? { published_at: new Date() }
        : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "Page",
    resourceId: id,
    oldValue: { title: existing.title, status: existing.status },
    newValue: { title: updated.title, status: updated.status },
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "pages", "delete");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });

  await prisma.page.delete({ where: { id } });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "DELETE",
    resource: "Page",
    resourceId: id,
    oldValue: { title: existing.title, slug: existing.slug },
    req,
  });

  return NextResponse.json({ success: true });
}
