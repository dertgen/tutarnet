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
        { error: "Veritabanı bağlantısı kurulamadı" },
        { status: 503 }
      ),
    };
  }

  if (!staff) {
    const userRole = (user.user_metadata?.role as string | undefined) ?? "";
    const isAdmin = userRole === "admin" || user.email?.endsWith("@tutar.net");

    if (!isAdmin) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Yetki reddedildi" }, { status: 403 }),
      };
    }

    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      staff = await prisma.adminStaff.create({
        data: {
          user_id: user.id,
          role: "SUPER_ADMIN",
          display_name: dbUser?.name ?? user.email?.split("@")[0] ?? "Admin",
          is_active: true,
        },
        include: { permissions: true },
      });
    } catch {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Admin kaydı oluşturulamadı" },
          { status: 500 }
        ),
      };
    }
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
