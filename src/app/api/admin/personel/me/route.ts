import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import type { MeResponse } from "@/types/admin";

export async function GET(req: NextRequest): Promise<NextResponse<MeResponse>> {
  const guard = await requireAdminAuth(req);
  if (!guard.ok) return NextResponse.json({ staff: null });

  return NextResponse.json({
    staff: {
      id: guard.staff.id,
      display_name: guard.staff.display_name,
      role: guard.staff.role,
      avatar_url: guard.staff.avatar_url,
    },
  });
}
