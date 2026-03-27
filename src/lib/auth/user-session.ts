import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { prisma } from "@/lib/db/prisma";

export interface UserSession {
  userId: string;
  email: string;
  name: string | null;
}

export type UserSessionResult =
  | { ok: true; session: UserSession }
  | { ok: false; status: number; error: string };

export async function requireUserSession(
  req: NextRequest
): Promise<UserSessionResult> {
  const token =
    req.cookies.get("sb-access-token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    null;

  if (!token) {
    return { ok: false, status: 401, error: "Oturum açılmamış" };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { ok: false, status: 401, error: "Geçersiz oturum" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true },
    });

    if (dbUser) {
      return {
        ok: true,
        session: { userId: dbUser.id, email: dbUser.email, name: dbUser.name },
      };
    }
  } catch {
    // DB bağlantısı kurulamıyor; Supabase Auth verisiyle devam et
  }

  return {
    ok: true,
    session: {
      userId: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? null,
    },
  };
}
