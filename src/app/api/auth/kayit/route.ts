import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createServerSupabaseClient } from "@/lib/db/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user_id, email, name } = await req.json();

  if (!user_id || !email) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ?? "";

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.id !== user_id) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id: user_id } });
    if (existing) {
      return NextResponse.json({ user: existing });
    }

    const newUser = await prisma.user.create({
      data: {
        id: user_id,
        email,
        name: name ?? null,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("Kullanıcı kaydı oluşturulamadı:", err);
    return NextResponse.json({ error: "Kayıt oluşturulamadı" }, { status: 500 });
  }
}
