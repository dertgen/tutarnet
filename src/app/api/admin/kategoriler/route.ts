import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { CategoriesListResponse, CreateCategoryBody } from "@/types/admin";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: NextRequest): Promise<NextResponse<CategoriesListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "categories", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const parentId = searchParams.get("parent_id");

  const categories = await prisma.category.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(type ? { type } : {}),
      ...(parentId === "null" ? { parent_id: null } : parentId ? { parent_id: parentId } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, services: true, children: true } },
    },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "categories", "write");
  if (!guard.ok) return guard.response;

  const body = (await req.json()) as CreateCategoryBody;
  if (!body.name || !body.type) {
    return NextResponse.json({ error: "Ad ve tür zorunludur" }, { status: 400 });
  }

  const slug = body.slug ?? toSlug(body.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug,
      type: body.type,
      icon: body.icon,
      description: body.description,
      parent_id: body.parent_id,
      typical_duration: body.typical_duration,
      price_range_min: body.price_range_min,
      price_range_max: body.price_range_max,
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "CREATE",
    resource: "Category",
    resourceId: category.id,
    newValue: { name: category.name, slug: category.slug, type: category.type },
    req,
  });

  return NextResponse.json(category, { status: 201 });
}
