import { prisma } from "@/lib/db/prisma";

/**
 * Tüm ayarlar için env-tabanlı varsayılan değerler.
 * DB'de kayıt yoksa bu değerler kullanılır.
 * Hassas değerler (API key, parola) burada maskelenerek döner.
 */
export const ENV_DEFAULTS: Record<string, string> = {
  site_name:            "tutar.net",
  site_tagline:         "Fiyat Karşılaştırma",
  site_url:             process.env.NEXT_PUBLIC_APP_URL ?? "https://tutar.net",
  admin_email:          process.env.ADMIN_EMAIL ?? "",
  support_email:        process.env.SUPPORT_EMAIL ?? "destek@tutar.net",

  logo_url:             process.env.NEXT_PUBLIC_LOGO_URL ?? "",
  favicon_url:          process.env.NEXT_PUBLIC_FAVICON_URL ?? "/favicon.ico",

  default_language:     "tr",
  timezone:             "Europe/Istanbul",
  currency:             "TRY",
  currency_position:    "before",
  date_format:          "DD.MM.YYYY",

  maintenance_mode:     "false",
  registration_open:    "true",
  coming_soon:          "false",

  default_theme:        "light",
  allow_theme_toggle:   "true",
  color_primary:        "#6366f1",
  color_secondary:      "#8b5cf6",
  color_accent:         "#06b6d4",
  color_success:        "#22c55e",
  color_warning:        "#f59e0b",
  color_danger:         "#ef4444",

  font_heading:         "Inter",
  font_body:            "Inter",
  base_font_size:       "16",

  layout_type:          "fullwidth",
  max_width:            "1280",
  sticky_header:        "true",
  show_breadcrumbs:     "true",

  registration_enabled: "true",
  email_verification:   "true",
  auto_approve_users:   "true",
  terms_required:       "true",

  google_login:         "false",
  facebook_login:       "false",
  github_login:         "false",

  min_password_length:  "8",
  require_uppercase:    "true",
  require_lowercase:    "true",
  require_number:       "true",
  require_special_char: "false",
  password_expiry_days: "0",

  "2fa_enabled":        "false",
  session_timeout:      "60",
  remember_me_days:     "30",
  max_sessions:         "5",
  single_session:       "false",

  max_login_attempts:   "5",
  lockout_duration:     "15",
  captcha_enabled:      "false",
  captcha_provider:     "recaptcha_v2",

  smtp_host:            process.env.SMTP_HOST ?? "",
  smtp_port:            process.env.SMTP_PORT ?? "587",
  smtp_secure:          process.env.SMTP_SECURE ?? "tls",
  smtp_user:            process.env.SMTP_USER ?? "",
  smtp_password:        process.env.SMTP_PASSWORD ? "••••••••" : "",
  smtp_from_name:       process.env.SMTP_FROM_NAME ?? "tutar.net",
  smtp_from_email:      process.env.SMTP_FROM_EMAIL ?? "",
  smtp_provider:        "custom",

  email_welcome:        "true",
  email_verification_notif: "true",
  email_password_reset: "true",
  email_new_partner:    "true",
  email_partner_approved:"true",
  email_new_report:     "true",
  email_daily_summary:  "false",

  push_enabled:         "false",
  sms_enabled:          "false",
  sms_provider:         "twilio",

  payment_stripe:       "false",
  stripe_public_key:    process.env.NEXT_PUBLIC_STRIPE_KEY ?? "",
  stripe_secret_key:    process.env.STRIPE_SECRET_KEY ? "••••••••" : "",
  payment_iyzico:       "false",
  payment_cod:          "true",
  payment_bank_transfer:"true",

  free_shipping_threshold: "200",
  default_shipping_cost:   "30",

  tax_enabled:          "true",
  default_tax_rate:     "18",
  prices_include_tax:   "true",

  products_per_page:    "24",
  allow_reviews:        "true",
  review_moderation:    "true",

  ga4_id:               process.env.NEXT_PUBLIC_GA4_ID ?? "",
  gtm_id:               process.env.NEXT_PUBLIC_GTM_ID ?? "",
  meta_pixel_id:        process.env.NEXT_PUBLIC_META_PIXEL ?? "",

  sitemap_enabled:      "true",
  sitemap_frequency:    "weekly",
  robots_txt:           "User-agent: *\nAllow: /\nSitemap: " + (process.env.NEXT_PUBLIC_APP_URL ?? "https://tutar.net") + "/sitemap.xml",

  og_enabled:           "true",
  twitter_card:         "summary_large_image",
  canonical_enabled:    "true",
  meta_robots:          "index,follow",

  api_enabled:          "false",
  api_rate_limit:       "100",
  webhook_enabled:      "false",

  storage_provider:     process.env.STORAGE_PROVIDER ?? "supabase",
  cdn_url:              process.env.CDN_URL ?? "",
  s3_bucket:            process.env.S3_BUCKET ?? "",
  s3_region:            process.env.S3_REGION ?? "eu-central-1",
  s3_access_key:        process.env.S3_ACCESS_KEY ? "••••••••" : "",
  s3_secret_key:        process.env.S3_SECRET_KEY ? "••••••••" : "",

  openai_api_key:       process.env.OPENAI_API_KEY ? "••••••••" : "",
  sentry_dsn:           process.env.SENTRY_DSN ?? "",

  max_upload_size:      "10",
  allowed_image_types:  "jpg,jpeg,png,webp,gif,svg",
  allowed_doc_types:    "pdf,doc,docx,xls,xlsx,zip",
  auto_webp:            "true",
  image_quality:        "85",
  strip_exif:           "true",
  lazy_loading:         "true",

  cache_enabled:        "true",
  cache_ttl:            "3600",
  cache_provider:       process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "memory",
  redis_url:            process.env.UPSTASH_REDIS_REST_URL ?? "",
  gzip_enabled:         "true",

  debug_mode:           process.env.NODE_ENV === "development" ? "true" : "false",
  error_reporting:      process.env.NODE_ENV === "production" ? "production" : "verbose",
  log_level:            "warn",
  audit_log_enabled:    "true",
  log_retention_days:   "90",

  backup_enabled:       "false",
  backup_frequency:     "daily",
  backup_retention:     "7",

  active_languages:     "tr",
  fallback_language:    "tr",
  auto_detect_lang:     "true",
  lang_switcher:        "true",
  number_decimal:       ",",
  number_thousands:     ".",
  first_day_of_week:    "1",
  time_format:          "24h",

  homepage:             "default",
  posts_per_page:       "10",
  comments_enabled:     "true",
  comment_moderation:   "true",
  nav_sticky:           "true",
  footer_columns:       "4",
  footer_credit_text:   "© 2025 tutar.net. Tüm hakları saklıdır.",
  blog_enabled:         "false",
  rss_feed:             "true",

  // ── Header ──────────────────────────────────────────────
  header_logo_url:      "/logo.svg",
  header_logo_alt:      "tutar.net",
  header_nav_links:     '[{"href":"/nasil-calisir","label":"Neden biz?"},{"href":"/iletisim","label":"İletişim"},{"href":"/magazalar","label":"Mağazalar"}]',
  header_cta_href:      "/giris-yap",
  header_cta_label:     "Giriş Yap",
  header_show_login:    "true",

  // ── Footer ──────────────────────────────────────────────
  footer_description:   "Milyonlarca ürünü tek bir platformdan inceleyin, karşılaştırın ve en uygun fiyatı bulun.",
  footer_col2_heading:  "Keşfet",
  footer_col2_links:    '[{"href":"/kategori/telefon","label":"Popüler Telefonlar"},{"href":"/magazalar","label":"Tüm Mağazalar"},{"href":"/nasil-calisir","label":"Sistem Nasıl Çalışır?"},{"href":"/magaza-ol","label":"Satıcı Olun (1 Yıl Ücretsiz)"}]',
  footer_col3_heading:  "Kurumsal & Yasal",
  footer_col3_links:    '[{"href":"/hakkimizda","label":"Hakkımızda"},{"href":"/iletisim","label":"İletişim"},{"href":"/gizlilik","label":"Gizlilik Politikası"},{"href":"/kullanim-sartlari","label":"Kullanım Şartları"}]',
  footer_newsletter_title:   "E-Bülten",
  footer_newsletter_desc:    "İndirimlerden ilk siz haberdar olun.",
  footer_newsletter_btn:     "Katıl",
  footer_newsletter_enabled: "true",
  footer_bottom_links:  '[{"href":"/kvkk","label":"KVKK Metni"},{"href":"/cerez-politikasi","label":"Çerez Politikası"}]',

  // ── Homepage — Hero ─────────────────────────────────────
  hero_logo_url:           "/logo.svg",
  hero_subtitle:           "500'den fazla mağazada favorilerinizi kolayca bulun",
  hero_search_placeholder: "Ürün, marka veya kategori ara…",
  hero_steps:              '[{"title":"Arayın","desc":"İstediğiniz ürünü kolayca arayın ve farklı mağazalardaki fiyatları karşılaştırın."},{"title":"Sipariş Verin","desc":"En uygun fiyatlı mağazaya yönlendirilerek güvenle sipariş verin."},{"title":"Keyfini Çıkarın","desc":"Tasarrufunuzun tadını çıkarın, bütçenizi koruyun."}]',

  // ── Homepage — Kategoriler ──────────────────────────────
  home_categories_title:   "Popüler Kategoriler",
  home_categories_items:   '[{"name":"Telefon","slug":"telefon","icon":"Smartphone"},{"name":"Bilgisayar","slug":"bilgisayar","icon":"Laptop"},{"name":"Televizyon","slug":"televizyon","icon":"Tv"},{"name":"Kulaklık","slug":"kulaklik","icon":"Headphones"},{"name":"Oyun","slug":"oyun","icon":"Gamepad2"},{"name":"Giyim","slug":"giyim","icon":"Shirt"},{"name":"Ev & Yaşam","slug":"ev-yasam","icon":"Sofa"},{"name":"Spor","slug":"spor","icon":"Dumbbell"}]',

  // ── Homepage — Partner Logoları ─────────────────────────
  home_logos_title:      "Gücünü Aldığı Teknolojiler & Partnerler",
  home_logos_items:       '[{"name":"OpenAI","img":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/200px-OpenAI_Logo.svg.png"},{"name":"Google","img":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png"},{"name":"Vercel","img":"https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png"},{"name":"Supabase","img":"https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png"},{"name":"Stripe","img":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png"},{"name":"Prisma","img":"https://seeklogo.com/images/P/prisma-logo-3805665B69-seeklogo.com.png"}]',
  home_logos_cta_label:  "Tüm partner mağazaları gör",
  home_logos_cta_href:   "/magazalar",

  // ── Homepage — Stats ────────────────────────────────────
  stats_fallback_partners:  "500+",
  stats_fallback_products:  "10.000+",
  stats_fallback_updates:   "500K+",
  stats_label_updates:      "Fiyat Güncellemesi",
  stats_fallback_countries: "32",
  stats_label_countries:    "Ülke",

  // ── Homepage — Features ─────────────────────────────────
  features_badge:     "Avantajlar",
  features_title:     "İşinizi büyütmek için güçlü araçlar",
  features_subtitle:  "Binlerce mağazayla rekabet ederken öne çıkmanızı sağlayan akıllı çözümler.",
  features_items:     '[{"title":"Yüksek görünürlük","desc":"Milyonlarca kullanıcı arasında ürünleriniz öne çıkar.","icon":"Eye"},{"title":"Nitelikli trafik","desc":"Satın almaya hazır ziyaretçiler mağazanıza yönlendirilir.","icon":"TrendingUp"},{"title":"Fiyatları karşılaştırın","desc":"Rakiplerinizle gerçek zamanlı fiyat karşılaştırması yapın.","icon":"BarChart3"},{"title":"Uluslararası erişim","desc":"32 ülkede yerel para birimiyle satış yapın.","icon":"Globe"}]',

  // ── Homepage — CTA Kartı ────────────────────────────────
  cta_title:       "Hemen Yeni Müşteriler Kazanın",
  cta_subtitle:    "Geniş trafik ağımız sayesinde ürünlerinizi milyonlara ulaştırın.",
  cta_btn_label:   "Mağaza Olun (1 Yıl Ücretsiz)",
  cta_btn_href:    "/magaza-ol",
  cta_bg_image:    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80",
};

/** Settingsler için bellek içi önbellek */
let cache: Record<string, string> | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000; // 1 dakika

export function invalidateSettingsCache(): void {
  cache = null;
  cacheAt = 0;
}

/**
 * Tüm ayarları DB'den yükler, env defaults ile birleştirir.
 * Sonuç 1 dakika önbelleğe alınır.
 */
export async function loadAllSettings(): Promise<Record<string, string>> {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;

  try {
    const rows = await prisma.siteSetting.findMany();
    const dbMap: Record<string, string> = {};
    for (const row of rows) dbMap[row.key] = row.value;

    const merged = { ...ENV_DEFAULTS, ...dbMap };
    cache = merged;
    cacheAt = Date.now();
    return merged;
  } catch {
    return { ...ENV_DEFAULTS };
  }
}

/**
 * Tek bir ayar değerini getirir.
 * DB → env default → "" sırasıyla arar.
 */
export async function getSetting(key: string): Promise<string> {
  const all = await loadAllSettings();
  return all[key] ?? ENV_DEFAULTS[key] ?? "";
}

/**
 * Ayarları DB'ye kaydeder ve önbelleği temizler.
 */
export async function saveSettings(
  entries: { key: string; value: string }[]
): Promise<void> {
  await prisma.$transaction(
    entries.map(({ key, value }) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group: "general", label: key },
      })
    )
  );
  invalidateSettingsCache();
}

/**
 * JSON string'i guvenli sekilde parse eder.
 * Gecersiz JSON durumunda fallback degerini dondurur.
 */
export function safeJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * JSON formatinda saklanmasi gereken anahtar listesi.
 * API validasyonunda kullanilir.
 */
export const JSON_SETTING_KEYS = new Set([
  "header_nav_links",
  "footer_col2_links",
  "footer_col3_links",
  "footer_bottom_links",
  "hero_steps",
  "home_categories_items",
  "home_logos_items",
  "features_items",
]);
