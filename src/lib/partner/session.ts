import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { prisma } from "@/lib/db/prisma";

export interface PartnerSession {
  userId: string;
  partnerId: string;
  partnerName: string;
  partnerSlug: string;
  partnerType: string;
  status: string;
}

export type PartnerSessionResult =
  | { ok: true; session: PartnerSession }
  | { ok: false; status: number; error: string };

export async function requirePartnerSession(
  req: NextRequest
): Promise<PartnerSessionResult> {
  const token =
    req.cookies.get("sb-access-token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    null;

  if (!token) {
    return { ok: false, status: 401, error: "Oturum açılmamış" };
  }

  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { ok: false, status: 401, error: "Geçersiz oturum" };
  }

  try {
    const partner = await prisma.partner.findFirst({
      where: { user_id: user.id },
      select: { id: true, name: true, slug: true, type: true, status: true },
    });

    if (!partner) {
      return { ok: false, status: 403, error: "Bu hesaba bağlı partner kaydı bulunamadı" };
    }

    return {
      ok: true,
      session: {
        userId: user.id,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerSlug: partner.slug,
        partnerType: partner.type,
        status: partner.status,
      },
    };
  } catch {
    return { ok: false, status: 503, error: "Veritabanı bağlantısı kurulamadı" };
  }
}
