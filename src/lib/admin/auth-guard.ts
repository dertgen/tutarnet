import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { can } from "./permissions";
import type { AdminRole } from "@/types/admin";

type AdminStaff = {
  id: string;
  user_id: string;
  role: AdminRole;
  is_active: boolean;
  display_name: string;
  avatar_url: string | null;
  last_login: Date | null;
};

type Permission = {
  resource: string;
  action: string;
  granted: boolean;
  [key: string]: unknown;
};

export type AuthedStaff = AdminStaff & { permissions: Permission[] };

type GuardResult =
  | { ok: true; staff: AuthedStaff }
  | { ok: false; response: NextResponse };

export async function requireAdminAuth(
  req: NextRequest,
  resource?: string,
  action?: string
): Promise<GuardResult> {
  const supabase = createServerSupabaseClient();
  const token =
    req.cookies.get("sb-access-token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Oturum açılmamış" }, { status: 401 }),
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 }),
    };
  }

  let staff: (AdminStaff & { permissions: Permission[] }) | null = null;

  try {
    staff = await prisma.adminStaff.findUnique({
      where: { user_id: user.id },
      include: { permissions: true },
    });
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin." },
        { status: 503 }
      ),
    };
  }

  if (!staff) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Yetki reddedildi. Admin kaydı bulunamadı." }, { status: 403 }),
    };
  }

  if (!staff.is_active) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Hesap devre dışı" }, { status: 403 }),
    };
  }

  if (resource && action) {
    const staffWithRole = { role: staff.role as AdminRole, permissions: staff.permissions };
    if (!can(staffWithRole, resource, action)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: `Bu işlem için '${resource}:${action}' yetkisi gerekli` },
          { status: 403 }
        ),
      };
    }
  }

  try {
    await prisma.adminStaff.update({
      where: { id: staff.id },
      data: { last_login: new Date() },
    });
  } catch {
    // last_login güncellemesi başarısız olsa da devam et
  }

  return { ok: true, staff };
}
