import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import type { BannersListResponse, BannerItem, CreateBannerBody } from "@/types/admin";
import { $Enums } from "@prisma/client";

export async function GET(req: NextRequest): Promise<NextResponse<BannersListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "banners", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const placement = searchParams.get("placement");
  const isActive = searchParams.get("is_active");

  const banners = await prisma.banner.findMany({
    where: {
      ...(placement ? { placement: placement as $Enums.BannerPlacement } : {}),
      ...(isActive !== null ? { is_active: isActive === "true" } : {}),
    },
    orderBy: [{ placement: "asc" }, { priority: "desc" }],
  });

  return NextResponse.json({ banners: banners as unknown as BannerItem[] });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "banners", "write");
  if (!guard.ok) return guard.response;

  const body = (await req.json()) as CreateBannerBody;
  if (!body.title) return NextResponse.json({ error: "Başlık zorunludur" }, { status: 400 });

  const banner = await prisma.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle,
      image_url: body.image_url,
      link_url: body.link_url,
      link_text: body.link_text,
      placement: body.placement ?? "HOME",
      priority: body.priority ?? 0,
      start_at: body.start_at ? new Date(body.start_at) : undefined,
      end_at: body.end_at ? new Date(body.end_at) : undefined,
      target_blank: body.target_blank ?? false,
      created_by: guard.staff.id,
    },
  });

  await writeAuditLog({
    staffId: guard.staff.id,
    action: "CREATE",
    resource: "Banner",
    resourceId: banner.id,
    newValue: { title: banner.title, placement: banner.placement },
    req,
  });

  return NextResponse.json(banner, { status: 201 });
}
