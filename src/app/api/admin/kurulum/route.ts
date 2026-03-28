import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createServerSupabaseClient } from "@/lib/db/supabase";

export async function GET(): Promise<NextResponse> {
  try {
    const superAdminCount = await prisma.adminStaff.count({ where: { role: "SUPER_ADMIN" } });
    return NextResponse.json({ setupRequired: superAdminCount === 0 });
  } catch {
    return NextResponse.json({ setupRequired: true });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const setupKey = req.nextUrl.searchParams.get("key");
  const expectedSetupKey = process.env.ADMIN_SETUP_KEY;

  if (!expectedSetupKey) {
    console.error("ADMIN_SETUP_KEY ortam değişkeni tanımlanmamış.");
    return NextResponse.json({ error: "Sunucu yapılandırma hatası." }, { status: 500 });
  }

  if (!setupKey || setupKey !== expectedSetupKey) {
    return NextResponse.json({ error: "Geçersiz kurulum anahtarı." }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Oturum açılmamış veya geçersiz oturum." }, { status: 401 });
  }

  try {
    // Zaten bir SUPER_ADMIN var mı kontrol et
    const existingSuperAdmin = await prisma.adminStaff.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingSuperAdmin) {
      return NextResponse.json({ error: "Sistemde zaten bir SUPER_ADMIN mevcut." }, { status: 403 });
    }

    // Kullanıcıyı SUPER_ADMIN olarak güncelle veya oluştur
    const staff = await prisma.adminStaff.upsert({
      where: { user_id: user.id },
      update: { role: "SUPER_ADMIN", is_active: true, last_login: new Date() },
      create: {
        user_id: user.id,
        role: "SUPER_ADMIN",
        display_name: user.user_metadata?.name || user.email?.split("@")[0] || "Admin",
        is_active: true,
        last_login: new Date(),
      },
    });

    return NextResponse.json({ message: `Kullanıcı ${staff.display_name} SUPER_ADMIN olarak ayarlandı.` });
  } catch (error) {
    console.error("Admin kurulum hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin." }, { status: 500 });
  }
}
