import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import type { UsersListResponse } from "@/types/admin";

export async function GET(req: NextRequest): Promise<NextResponse<UsersListResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "users", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10));
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";

  const where = {
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role === "admin" ? { is_admin: true } : {}),
    ...(role === "partner" ? { partner: { isNot: null } } : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar_url: true,
        is_admin: true,
        created_at: true,
        updated_at: true,
        partner: { select: { id: true, name: true, status: true } },
        admin_staff: { select: { role: true } },
        _count: { select: { appointments: true, reviews: true, filed_reports: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, page_size: limit } as unknown as UsersListResponse);
}
