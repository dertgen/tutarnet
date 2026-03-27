import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createServerSupabaseClient } from "@/lib/db/supabase";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[ıİ]/g, "i")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { user_id, email, contact_name, store_name, phone, website, tax_number, infrastructure, xml_link, package_type } = body;

  if (!user_id || !email || !store_name) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.id !== user_id) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  try {
    const baseSlug = toSlug(store_name);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.partner.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.upsert({
        where: { id: user_id },
        update: { name: contact_name ?? null },
        create: { id: user_id, email, name: contact_name ?? null },
      });

      const partner = await tx.partner.create({
        data: {
          user_id: dbUser.id,
          name: store_name,
          slug,
          type: "E_COMMERCE",
          sector: "E_COMMERCE",
          status: "PENDING",
          phone: phone ?? null,
          website: website ?? null,
          email: email,
          tax_number: tax_number ?? null,
          package_type: package_type ?? "FREE",
          subscription_status: "TRIAL",
        },
      });

      return partner;
    });

    return NextResponse.json({ partner: result }, { status: 201 });
  } catch (err) {
    console.error("Partner kaydı oluşturulamadı:", err);
    return NextResponse.json({ error: "Partner kaydı oluşturulamadı" }, { status: 500 });
  }
}
