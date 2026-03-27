import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/auth-guard";
import { writeAuditLog } from "@/lib/admin/audit";
import { loadAllSettings, saveSettings, invalidateSettingsCache, ENV_DEFAULTS, JSON_SETTING_KEYS } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

/* ─────────────────────────────────────────────────────────────
   GET /api/admin/site-ayarlari
   Tüm ayarları döner: DB değerleri + env defaults birleştirilir.
   Her anahtar için { value, source } formatında döner.
───────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req);
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.siteSetting.findMany();
    const dbMap: Record<string, string> = {};
    for (const row of rows) dbMap[row.key] = row.value;

    const result: Record<string, { value: string; source: "db" | "env" | "default" }> = {};

    for (const [key, envDefault] of Object.entries(ENV_DEFAULTS)) {
      if (dbMap[key] !== undefined) {
        result[key] = { value: dbMap[key], source: "db" };
      } else {
        const isEnvSourced = isEnvKey(key);
        result[key] = {
          value: envDefault,
          source: isEnvSourced && envDefault !== "" ? "env" : "default",
        };
      }
    }

    for (const [key, value] of Object.entries(dbMap)) {
      if (!result[key]) {
        result[key] = { value, source: "db" };
      }
    }

    return NextResponse.json({ settings: result });
  } catch (err) {
    console.error("[GET /api/admin/site-ayarlari]", err);
    return NextResponse.json({ error: "Ayarlar yüklenemedi" }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────────────────────
   POST /api/admin/site-ayarlari
   Body: { settings: [{ key, value }] }
   Ayarları DB'ye kaydeder, cache'i temizler.
───────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "site_settings", "write");
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const entries: { key: string; value: string }[] = body.settings ?? [];

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const invalid = entries.find(
      (e) => typeof e.key !== "string" || typeof e.value !== "string"
    );
    if (invalid) {
      return NextResponse.json({ error: "Her girdi { key, value } formatında olmalı" }, { status: 400 });
    }

    // JSON formatinda olmasi gereken key'leri dogrula
    for (const { key, value } of entries) {
      if (JSON_SETTING_KEYS.has(key) && value.trim() !== "") {
        try {
          JSON.parse(value);
        } catch {
          return NextResponse.json(
            { error: `Geçersiz JSON formatı: ${key}` },
            { status: 400 }
          );
        }
      }
    }

    const oldValues: Record<string, string> = {};
    for (const { key } of entries) {
      const row = await prisma.siteSetting.findUnique({ where: { key } });
      oldValues[key] = row?.value ?? ENV_DEFAULTS[key] ?? "";
    }

    await saveSettings(entries);

    // Public sayfalarin ISR cache'ini temizle
    revalidatePath("/");
    revalidatePath("/", "layout");

    const newValues: Record<string, string> = {};
    for (const { key, value } of entries) newValues[key] = value;

    await writeAuditLog({
      staffId: guard.staff.id,
      action: "UPDATE",
      resource: "site_settings",
      resourceId: "global",
      oldValue: oldValues,
      newValue: newValues,
      req,
    });

    return NextResponse.json({ saved: entries.length });
  } catch (err) {
    console.error("[POST /api/admin/site-ayarlari]", err);
    return NextResponse.json({ error: "Ayarlar kaydedilemedi" }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────────────────────
   DELETE /api/admin/site-ayarlari
   Belirli anahtarları sıfırlar (DB kaydını siler, env/default'a döner)
   Body: { keys: string[] }
───────────────────────────────────────────────────────────── */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const guard = await requireAdminAuth(req, "site_settings", "write");
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const keys: string[] = body.keys ?? [];

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "Geçersiz anahtar listesi" }, { status: 400 });
    }

    await prisma.siteSetting.deleteMany({ where: { key: { in: keys } } });
    invalidateSettingsCache();

    await writeAuditLog({
      staffId: guard.staff.id,
      action: "RESET",
      resource: "site_settings",
      resourceId: "global",
      metadata: { reset_keys: keys },
      req,
    });

    return NextResponse.json({ reset: keys.length });
  } catch (err) {
    console.error("[DELETE /api/admin/site-ayarlari]", err);
    return NextResponse.json({ error: "Sıfırlama başarısız" }, { status: 500 });
  }
}

/* ─── Yardımcı: Bu key'in env'den gelip gelmediğini kontrol et ─ */
const ENV_SOURCED_KEYS = new Set([
  "site_url", "smtp_host", "smtp_port", "smtp_user", "smtp_password",
  "smtp_from_email", "smtp_from_name", "stripe_public_key", "stripe_secret_key",
  "ga4_id", "gtm_id", "meta_pixel_id", "openai_api_key", "sentry_dsn",
  "redis_url", "cdn_url", "s3_bucket", "s3_region", "s3_access_key",
  "s3_secret_key", "storage_provider", "cache_provider", "debug_mode",
]);

function isEnvKey(key: string): boolean {
  return ENV_SOURCED_KEYS.has(key);
}
