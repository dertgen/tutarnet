import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { UpdateCategoryBody } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(_req, "categories", "read");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true, services: true } },
    },
  });

  if (!category) return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "categories", "write");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as UpdateCategoryBody;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.icon !== undefined ? { icon: body.icon } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.parent_id !== undefined ? { parent_id: body.parent_id } : {}),
      ...(body.typical_duration !== undefined ? { typical_duration: body.typical_duration } : {}),
      ...(body.price_range_min !== undefined ? { price_range_min: body.price_range_min } : {}),
      ...(body.price_range_max !== undefined ? { price_range_max: body.price_range_max } : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "UPDATE",
    resource: "Category",
    resourceId: id,
    oldValue: { name: existing.name, slug: existing.slug },
    newValue: { name: updated.name, slug: updated.slug },
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdminAuth(req, "categories", "delete");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, services: true, children: true } } },
  });

  if (!category) return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });

  const total = category._count.products + category._count.services + category._count.children;
  if (total > 0) {
    return NextResponse.json(
      { error: "Bu kategoriye bağlı kayıtlar var. Önce ilişkileri kaldırın." },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "DELETE",
    resource: "Category",
    resourceId: id,
    oldValue: { name: category.name, slug: category.slug },
    req,
  });

  return NextResponse.json({ success: true });
}
