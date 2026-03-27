import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createServerSupabaseClient } from "@/lib/db/supabase";

export async function GET(): Promise<NextResponse> {
  try {
    const count = await prisma.adminStaff.count();
    return NextResponse.json({ setupRequired: count === 0 });
  } catch {
    return NextResponse.json({ setupRequired: true });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminCount = await prisma.adminStaff.count();
  if (adminCount > 0) {
    return NextResponse.json({ error: "Kurulum zaten tamamlanmış" }, { status: 403 });
  }

  const token =
    req.cookies.get("sb-access-token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    null;

  if (!token) {
    return NextResponse.json({ error: "Oturum açılmamış" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const displayName: string = body.displayName ?? user.email ?? "Süper Admin";

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { id: user.id, email: user.email ?? "", name: displayName },
      });
    }

    const staff = await prisma.adminStaff.create({
      data: {
        user_id: user.id,
        role: "SUPER_ADMIN",
        display_name: displayName,
        is_active: true,
      },
    });

    return NextResponse.json({ ok: true, staff }, { status: 201 });
  } catch (err) {
    console.error("Kurulum hatası:", err);
    return NextResponse.json({ error: "Kurulum başarısız" }, { status: 500 });
  }
}
