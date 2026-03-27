import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { PagesListResponse, CreatePageBody, PageStatus } from "@/types/admin";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: NextRequest): Promise<NextResponse<PagesListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "pages", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";

  const pages = await prisma.page.findMany({
    where: status ? { status: status as PageStatus } : {},
    orderBy: { updated_at: "desc" },
    select: {
      id: true, title: true, slug: true, excerpt: true, status: true,
      template: true, seo_title: true, published_at: true, created_at: true, updated_at: true,
    },
  });

  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "pages", "write");
  if (!guard.ok) return guard.response;

  const body = (await req.json()) as CreatePageBody;
  if (!body.title || !body.content) {
    return NextResponse.json({ error: "Başlık ve içerik zorunludur" }, { status: 400 });
  }

  const slug = body.slug ?? toSlug(body.title);
  const slugExists = await prisma.page.findUnique({ where: { slug } });
  if (slugExists) return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 409 });

  const page = await prisma.page.create({
    data: {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt,
      status: body.status ?? "DRAFT",
      template: body.template ?? "default",
      seo_title: body.seo_title,
      seo_desc: body.seo_desc,
      og_image: body.og_image,
      created_by: guard.staff.id,
      ...(body.status === "PUBLISHED" ? { published_at: new Date() } : {}),
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "CREATE",
    resource: "Page",
    resourceId: page.id,
    newValue: { title: page.title, slug: page.slug, status: page.status },
    req,
  });

  return NextResponse.json(page, { status: 201 });
}
