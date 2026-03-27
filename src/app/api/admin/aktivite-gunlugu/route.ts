import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import type { AuditLogResponse } from "@/types/admin";

export async function GET(req: NextRequest): Promise<NextResponse<AuditLogResponse | { error: string }>> {
  const guard = await requireAdminAuth(req, "audit", "read");
  if (!guard.ok) return guard.response as NextResponse<{ error: string }>;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));
  const staffId = searchParams.get("staff_id") ?? "";
  const resource = searchParams.get("resource") ?? "";
  const action = searchParams.get("action") ?? "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {
    ...(staffId ? { staff_id: staffId } : {}),
    ...(resource ? { resource } : {}),
    ...(action ? { action } : {}),
    ...(from || to
      ? {
          created_at: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        staff: { select: { display_name: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page });
}
