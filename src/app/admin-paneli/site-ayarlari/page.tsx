"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings, Palette, Users, Shield, Mail, ShoppingCart,
  Globe, Plug, FolderOpen, Terminal, Languages, FileText,
  Save, RefreshCw, CheckCircle, XCircle, ChevronRight,
  Eye, EyeOff, Info, AlertTriangle, Copy, RotateCcw,
} from "lucide-react";
import { T } from "@/components/admin/tokens";
import { LoadingSpinner, PageHeader } from "@/components/admin/ui";

/* ─── Types ──────────────────────────────────────────────────── */
type FieldType = "text" | "email" | "url" | "password" | "number" | "textarea"
  | "toggle" | "select" | "color" | "json" | "tags" | "range";

interface Field {
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  defaultValue: string;
  placeholder?: string;
  sensitive?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
  badge?: "new" | "pro" | "beta";
}

interface Section {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  fields: Field[];
}

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  sections: Section[];
}

/* ─── Schema ─────────────────────────────────────────────────── */
const CATEGORIES: Category[] = [
  {
    id: "genel",
    label: "Genel Ayarlar",
    icon: Settings,
    description: "Site kimliği, temel bilgiler ve iletişim",
    color: "#6366f1",
    sections: [
      {
        id: "kimlik",
        title: "Site Kimliği",
        description: "Sitenizin adı, açıklaması ve temel kimlik bilgileri",
        fields: [
          { key: "site_name",        label: "Site Adı",           type: "text",     defaultValue: "tutar.net",          placeholder: "Sitenizin adı" },
          { key: "site_tagline",     label: "Slogan",             type: "text",     defaultValue: "Fiyat Karşılaştırma", placeholder: "Kısa açıklama / slogan" },
          { key: "site_description", label: "Site Açıklaması",    type: "textarea", defaultValue: "",                   placeholder: "Sitenizi anlatan kısa paragraf (SEO için önemli)" },
          { key: "site_url",         label: "Site URL",           type: "url",      defaultValue: "https://tutar.net",   placeholder: "https://siteniz.com" },
          { key: "admin_email",      label: "Admin E-postası",    type: "email",    defaultValue: "",                   placeholder: "admin@siteniz.com" },
          { key: "support_email",    label: "Destek E-postası",   type: "email",    defaultValue: "",                   placeholder: "destek@siteniz.com" },
          { key: "phone",            label: "Telefon",            type: "text",     defaultValue: "",                   placeholder: "+90 5xx xxx xx xx" },
          { key: "address",          label: "Adres",              type: "textarea", defaultValue: "",                   placeholder: "Fiziksel adres" },
        ],
      },
      {
        id: "medya_kimlik",
        title: "Logo & Görsel Kimlik",
        description: "Site logosu, favicon ve diğer marka görselleri",
        fields: [
          { key: "logo_url",         label: "Logo URL",           type: "url",  defaultValue: "", placeholder: "/logo.png veya https://..." },
          { key: "logo_dark_url",    label: "Dark Logo URL",      type: "url",  defaultValue: "", placeholder: "Koyu arka plan için alternatif logo" },
          { key: "favicon_url",      label: "Favicon URL",        type: "url",  defaultValue: "", placeholder: "/favicon.ico" },
          { key: "og_image_url",     label: "OG Görsel URL",      type: "url",  defaultValue: "", placeholder: "Sosyal paylaşım görseli (1200x630)" },
        ],
      },
      {
        id: "bolgesel",
        title: "Bölgesel Ayarlar",
        description: "Dil, zaman dilimi ve para birimi",
        fields: [
          { key: "default_language", label: "Varsayılan Dil",   type: "select", defaultValue: "tr",              options: [{ value: "tr", label: "Türkçe" }, { value: "en", label: "İngilizce" }, { value: "de", label: "Almanca" }, { value: "fr", label: "Fransızca" }] },
          { key: "timezone",         label: "Zaman Dilimi",     type: "select", defaultValue: "Europe/Istanbul",  options: [{ value: "Europe/Istanbul", label: "Europe/Istanbul (UTC+3)" }, { value: "Europe/London", label: "Europe/London (UTC+0)" }, { value: "America/New_York", label: "America/New_York (UTC-5)" }, { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" }] },
          { key: "currency",         label: "Para Birimi",      type: "select", defaultValue: "TRY",             options: [{ value: "TRY", label: "₺ Türk Lirası (TRY)" }, { value: "USD", label: "$ Amerikan Doları (USD)" }, { value: "EUR", label: "€ Euro (EUR)" }, { value: "GBP", label: "£ İngiliz Sterlini (GBP)" }] },
          { key: "currency_position",label: "Para Birimi Pozisyonu", type: "select", defaultValue: "before",  options: [{ value: "before", label: "Önce (₺100)" }, { value: "after", label: "Sonra (100₺)" }] },
          { key: "date_format",      label: "Tarih Formatı",    type: "select", defaultValue: "DD.MM.YYYY",     options: [{ value: "DD.MM.YYYY", label: "DD.MM.YYYY" }, { value: "MM/DD/YYYY", label: "MM/DD/YYYY" }, { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }] },
        ],
      },
      {
        id: "durum",
        title: "Site Durumu",
        description: "Bakım modu ve erişim kontrolü",
        fields: [
          { key: "maintenance_mode", label: "Bakım Modu",         type: "toggle", defaultValue: "false",       description: "Açıkken sadece adminler siteye erişebilir" },
          { key: "maintenance_msg",  label: "Bakım Mesajı",       type: "textarea", defaultValue: "Sitemiz bakım modunda. Yakında geri döneceğiz.", placeholder: "Ziyaretçilere gösterilecek mesaj" },
          { key: "coming_soon",      label: "Yakında Sayfası",    type: "toggle", defaultValue: "false" },
          { key: "registration_open",label: "Kayıt Açık",         type: "toggle", defaultValue: "true",        description: "Yeni kullanıcı kaydına izin ver" },
        ],
      },
    ],
  },
  {
    id: "tasarim",
    label: "Tasarım & Görünüm",
    icon: Palette,
    description: "Tema, renkler, fontlar ve layout",
    color: "#ec4899",
    sections: [
      {
        id: "tema",
        title: "Tema",
        description: "Varsayılan tema ve karanlık mod ayarları",
        fields: [
          { key: "default_theme",    label: "Varsayılan Tema",    type: "select", defaultValue: "light", options: [{ value: "light", label: "Açık (Light)" }, { value: "dark", label: "Koyu (Dark)" }, { value: "system", label: "Sistem Tercihine Göre" }] },
          { key: "allow_theme_toggle",label: "Tema Değiştirme",  type: "toggle", defaultValue: "true",  description: "Kullanıcıların temayı değiştirmesine izin ver" },
          { key: "custom_theme_name", label: "Özel Tema Adı",    type: "text",   defaultValue: "",      placeholder: "Özel tema varsa adı" },
        ],
      },
      {
        id: "renkler",
        title: "Renk Paleti",
        description: "Marka renkleri ve aksent renkleri",
        fields: [
          { key: "color_primary",    label: "Birincil Renk",      type: "color",  defaultValue: "#6366f1" },
          { key: "color_secondary",  label: "İkincil Renk",       type: "color",  defaultValue: "#8b5cf6" },
          { key: "color_accent",     label: "Aksent Renk",        type: "color",  defaultValue: "#06b6d4" },
          { key: "color_success",    label: "Başarı Rengi",       type: "color",  defaultValue: "#22c55e" },
          { key: "color_warning",    label: "Uyarı Rengi",        type: "color",  defaultValue: "#f59e0b" },
          { key: "color_danger",     label: "Hata / Tehlike",     type: "color",  defaultValue: "#ef4444" },
        ],
      },
      {
        id: "tipografi",
        title: "Tipografi",
        description: "Font aileleri ve boyutları",
        fields: [
          { key: "font_heading",     label: "Başlık Fontu",       type: "select", defaultValue: "Inter", options: [{ value: "Inter", label: "Inter" }, { value: "Roboto", label: "Roboto" }, { value: "Poppins", label: "Poppins" }, { value: "Montserrat", label: "Montserrat" }, { value: "Raleway", label: "Raleway" }] },
          { key: "font_body",        label: "Gövde Fontu",        type: "select", defaultValue: "Inter", options: [{ value: "Inter", label: "Inter" }, { value: "Roboto", label: "Roboto" }, { value: "Open Sans", label: "Open Sans" }, { value: "Lato", label: "Lato" }, { value: "Source Sans Pro", label: "Source Sans Pro" }] },
          { key: "font_mono",        label: "Mono Fontu",         type: "select", defaultValue: "JetBrains Mono", options: [{ value: "JetBrains Mono", label: "JetBrains Mono" }, { value: "Fira Code", label: "Fira Code" }, { value: "Courier New", label: "Courier New" }] },
          { key: "base_font_size",   label: "Temel Font Boyutu",  type: "range",  defaultValue: "16",   min: 12, max: 20, unit: "px" },
        ],
      },
      {
        id: "layout",
        title: "Layout & Düzen",
        description: "Sayfa genişliği ve düzen tercihleri",
        fields: [
          { key: "layout_type",      label: "Layout Tipi",        type: "select", defaultValue: "fullwidth", options: [{ value: "fullwidth", label: "Tam Genişlik" }, { value: "boxed", label: "Kutulu (Boxed)" }, { value: "fluid", label: "Akışkan (Fluid)" }] },
          { key: "max_width",        label: "Maksimum Genişlik",  type: "number", defaultValue: "1280",      unit: "px", placeholder: "1280" },
          { key: "sidebar_position", label: "Sidebar Pozisyonu",  type: "select", defaultValue: "left", options: [{ value: "left", label: "Sol" }, { value: "right", label: "Sağ" }, { value: "none", label: "Yok" }] },
          { key: "sticky_header",    label: "Sabit Header",       type: "toggle", defaultValue: "true" },
          { key: "show_breadcrumbs", label: "Breadcrumb Göster",  type: "toggle", defaultValue: "true" },
          { key: "show_back_to_top", label: "Yukarı Çık Butonu",  type: "toggle", defaultValue: "true" },
        ],
      },
      {
        id: "ozel_css",
        title: "Özel Stiller",
        description: "Gelişmiş özelleştirme için CSS ve HTML enjeksiyonu",
        fields: [
          { key: "custom_css",       label: "Özel CSS",           type: "textarea", defaultValue: "", placeholder: "/* Özel CSS kodunuz */\nbody { font-family: 'Inter', sans-serif; }" },
          { key: "head_scripts",     label: "Head Scriptleri",    type: "textarea", defaultValue: "", placeholder: "<script>/* Head'e eklenecek scriptler */</script>", badge: "pro" },
          { key: "body_end_scripts", label: "Body Sonu Scriptleri", type: "textarea", defaultValue: "", placeholder: "<script>/* Body kapanmadan önce */</script>", badge: "pro" },
        ],
      },
    ],
  },
  {
    id: "kullanici",
    label: "Kullanıcı & Hesap",
    icon: Users,
    description: "Kayıt, giriş ve hesap yönetimi",
    color: "#10b981",
    sections: [
      {
        id: "kayit",
        title: "Kayıt Ayarları",
        description: "Kullanıcı kaydı ve onay süreci",
        fields: [
          { key: "registration_enabled",   label: "Kayıt Açık",             type: "toggle", defaultValue: "true" },
          { key: "email_verification",     label: "E-posta Doğrulama",      type: "toggle", defaultValue: "true",  description: "Kayıt sonrası e-posta onayı zorunlu" },
          { key: "auto_approve_users",     label: "Otomatik Onay",          type: "toggle", defaultValue: "true",  description: "Kapalıysa admin onayı gerekir" },
          { key: "registration_fields",    label: "Ek Kayıt Alanları",      type: "tags",   defaultValue: "phone", placeholder: "phone, address, company, job_title" },
          { key: "terms_required",         label: "Şartlar Kabul Zorunlu",  type: "toggle", defaultValue: "true" },
          { key: "terms_url",              label: "Şartlar & Koşullar URL", type: "url",    defaultValue: "/sayfalar/kullanim-sartlari" },
          { key: "privacy_url",            label: "Gizlilik Politikası URL",type: "url",    defaultValue: "/sayfalar/gizlilik-politikasi" },
        ],
      },
      {
        id: "sosyal_giris",
        title: "Sosyal Giriş",
        description: "OAuth ve sosyal medya ile giriş",
        fields: [
          { key: "google_login",      label: "Google ile Giriş",     type: "toggle",   defaultValue: "false" },
          { key: "google_client_id",  label: "Google Client ID",     type: "text",     defaultValue: "", sensitive: true, placeholder: "xxxx.apps.googleusercontent.com" },
          { key: "google_secret",     label: "Google Client Secret", type: "password", defaultValue: "", sensitive: true },
          { key: "facebook_login",    label: "Facebook ile Giriş",   type: "toggle",   defaultValue: "false" },
          { key: "facebook_app_id",   label: "Facebook App ID",      type: "text",     defaultValue: "", sensitive: true },
          { key: "facebook_secret",   label: "Facebook App Secret",  type: "password", defaultValue: "", sensitive: true },
          { key: "github_login",      label: "GitHub ile Giriş",     type: "toggle",   defaultValue: "false", badge: "beta" },
          { key: "github_client_id",  label: "GitHub Client ID",     type: "text",     defaultValue: "", sensitive: true },
          { key: "github_secret",     label: "GitHub Client Secret", type: "password", defaultValue: "", sensitive: true },
        ],
      },
      {
        id: "profil",
        title: "Profil Ayarları",
        description: "Kullanıcı profili ve avatar ayarları",
        fields: [
          { key: "allow_avatar_upload",  label: "Avatar Yükleme",       type: "toggle", defaultValue: "true" },
          { key: "avatar_max_size",      label: "Avatar Maks. Boyut",   type: "number", defaultValue: "2",   unit: "MB" },
          { key: "allow_username_change",label: "Kullanıcı Adı Değiştir", type: "toggle", defaultValue: "false" },
          { key: "allow_email_change",   label: "E-posta Değiştir",     type: "toggle", defaultValue: "true" },
          { key: "public_profiles",      label: "Herkese Açık Profiller", type: "toggle", defaultValue: "true" },
        ],
      },
    ],
  },
  {
    id: "guvenlik",
    label: "Güvenlik",
    icon: Shield,
    description: "Şifre politikası, 2FA ve erişim kontrolü",
    color: "#f59e0b",
    sections: [
      {
        id: "sifre",
        title: "Şifre Politikası",
        description: "Güçlü şifre kuralları",
        fields: [
          { key: "min_password_length",    label: "Min. Şifre Uzunluğu",  type: "number",  defaultValue: "8",    min: 6, max: 32 },
          { key: "require_uppercase",      label: "Büyük Harf Zorunlu",   type: "toggle",  defaultValue: "true" },
          { key: "require_lowercase",      label: "Küçük Harf Zorunlu",   type: "toggle",  defaultValue: "true" },
          { key: "require_number",         label: "Rakam Zorunlu",         type: "toggle",  defaultValue: "true" },
          { key: "require_special_char",   label: "Özel Karakter Zorunlu",type: "toggle",  defaultValue: "false" },
          { key: "password_expiry_days",   label: "Şifre Geçerlilik",     type: "number",  defaultValue: "0",    unit: "gün (0=sınırsız)" },
          { key: "prevent_reuse_count",    label: "Eski Şifre Tekrar",    type: "number",  defaultValue: "3",    description: "Son N şifreyle aynı olamaz" },
        ],
      },
      {
        id: "iki_faktor",
        title: "İki Faktörlü Doğrulama (2FA)",
        description: "Hesap güvenliğini artırın",
        fields: [
          { key: "2fa_enabled",         label: "2FA Özelliği",         type: "toggle", defaultValue: "false", badge: "pro" },
          { key: "2fa_required_admin",  label: "Admin İçin Zorunlu",   type: "toggle", defaultValue: "false" },
          { key: "2fa_method",          label: "2FA Yöntemi",          type: "select", defaultValue: "totp",  options: [{ value: "totp", label: "TOTP (Google Auth)" }, { value: "sms", label: "SMS" }, { value: "email", label: "E-posta" }] },
        ],
      },
      {
        id: "oturum",
        title: "Oturum Yönetimi",
        description: "Oturum süresi ve çoklu cihaz",
        fields: [
          { key: "session_timeout",      label: "Oturum Süresi",        type: "number", defaultValue: "60",   unit: "dakika" },
          { key: "remember_me_days",     label: "Beni Hatırla Süresi",  type: "number", defaultValue: "30",   unit: "gün" },
          { key: "max_sessions",         label: "Maks. Aktif Oturum",   type: "number", defaultValue: "5",    description: "Aynı anda kaç oturum açılabilir" },
          { key: "single_session",       label: "Tek Oturum Zorla",     type: "toggle", defaultValue: "false", description: "Yeni giriş önceki oturumu sonlandırır" },
        ],
      },
      {
        id: "erisim",
        title: "Erişim Kontrolü",
        description: "IP kısıtlamaları ve brute-force koruması",
        fields: [
          { key: "ip_whitelist",        label: "IP Whitelist",         type: "textarea", defaultValue: "",    placeholder: "192.168.1.1\n10.0.0.0/8\n(Her satıra bir IP/CIDR)" },
          { key: "ip_blacklist",        label: "IP Blacklist",         type: "textarea", defaultValue: "",    placeholder: "Engellenecek IP'ler" },
          { key: "max_login_attempts",  label: "Maks. Giriş Denemesi",type: "number",   defaultValue: "5" },
          { key: "lockout_duration",    label: "Kilitleme Süresi",     type: "number",   defaultValue: "15",  unit: "dakika" },
          { key: "captcha_enabled",     label: "CAPTCHA",              type: "toggle",   defaultValue: "false" },
          { key: "captcha_provider",    label: "CAPTCHA Sağlayıcı",   type: "select",   defaultValue: "recaptcha_v2", options: [{ value: "recaptcha_v2", label: "Google reCAPTCHA v2" }, { value: "recaptcha_v3", label: "Google reCAPTCHA v3" }, { value: "hcaptcha", label: "hCaptcha" }, { value: "turnstile", label: "Cloudflare Turnstile" }] },
          { key: "recaptcha_site_key",  label: "reCAPTCHA Site Key",  type: "text",     defaultValue: "",    sensitive: true },
          { key: "recaptcha_secret",    label: "reCAPTCHA Secret",    type: "password", defaultValue: "",    sensitive: true },
        ],
      },
    ],
  },
  {
    id: "bildirimler",
    label: "Bildirimler & E-posta",
    icon: Mail,
    description: "SMTP, e-posta şablonları ve push bildirimleri",
    color: "#3b82f6",
    sections: [
      {
        id: "smtp",
        title: "SMTP Ayarları",
        description: "E-posta gönderim sunucusu",
        fields: [
          { key: "smtp_host",       label: "SMTP Sunucu",      type: "text",     defaultValue: "", placeholder: "smtp.gmail.com" },
          { key: "smtp_port",       label: "SMTP Port",        type: "number",   defaultValue: "587" },
          { key: "smtp_secure",     label: "SSL/TLS",          type: "select",   defaultValue: "tls",  options: [{ value: "tls", label: "TLS (STARTTLS)" }, { value: "ssl", label: "SSL" }, { value: "none", label: "Şifresiz" }] },
          { key: "smtp_user",       label: "SMTP Kullanıcı",  type: "email",    defaultValue: "",   placeholder: "user@gmail.com" },
          { key: "smtp_password",   label: "SMTP Şifre",      type: "password", defaultValue: "",   sensitive: true },
          { key: "smtp_from_name",  label: "Gönderen Adı",    type: "text",     defaultValue: "tutar.net" },
          { key: "smtp_from_email", label: "Gönderen E-posta",type: "email",    defaultValue: "",   placeholder: "noreply@tutar.net" },
          { key: "smtp_provider",   label: "E-posta Sağlayıcı", type: "select", defaultValue: "custom", options: [{ value: "custom", label: "Özel SMTP" }, { value: "sendgrid", label: "SendGrid" }, { value: "mailgun", label: "Mailgun" }, { value: "ses", label: "Amazon SES" }, { value: "resend", label: "Resend" }] },
        ],
      },
      {
        id: "email_sablonlar",
        title: "E-posta Bildirimleri",
        description: "Hangi olaylar için e-posta gönderilsin",
        fields: [
          { key: "email_welcome",        label: "Hoş Geldin E-postası",       type: "toggle", defaultValue: "true" },
          { key: "email_verification",   label: "E-posta Doğrulama",          type: "toggle", defaultValue: "true" },
          { key: "email_password_reset", label: "Şifre Sıfırlama",            type: "toggle", defaultValue: "true" },
          { key: "email_new_partner",    label: "Yeni Partner Başvurusu",     type: "toggle", defaultValue: "true" },
          { key: "email_partner_approved",label: "Partner Onayı",             type: "toggle", defaultValue: "true" },
          { key: "email_new_report",     label: "Yeni Rapor / Şikayet",       type: "toggle", defaultValue: "true" },
          { key: "email_daily_summary",  label: "Günlük Özet Raporu",         type: "toggle", defaultValue: "false" },
          { key: "daily_summary_time",   label: "Özet Saati",                 type: "text",   defaultValue: "08:00", placeholder: "HH:MM" },
        ],
      },
      {
        id: "push",
        title: "Push Bildirimleri",
        description: "Tarayıcı ve mobil push bildirimleri",
        fields: [
          { key: "push_enabled",        label: "Push Bildirimleri",   type: "toggle",   defaultValue: "false", badge: "beta" },
          { key: "vapid_public_key",    label: "VAPID Public Key",    type: "text",     defaultValue: "",   sensitive: true, badge: "beta" },
          { key: "vapid_private_key",   label: "VAPID Private Key",   type: "password", defaultValue: "",   sensitive: true, badge: "beta" },
          { key: "fcm_server_key",      label: "FCM Server Key",      type: "password", defaultValue: "",   sensitive: true, badge: "beta" },
        ],
      },
      {
        id: "sms",
        title: "SMS Entegrasyonu",
        description: "SMS gönderimi için sağlayıcı ayarları",
        fields: [
          { key: "sms_enabled",     label: "SMS Bildirimleri",    type: "toggle",  defaultValue: "false" },
          { key: "sms_provider",    label: "SMS Sağlayıcı",       type: "select",  defaultValue: "twilio", options: [{ value: "twilio", label: "Twilio" }, { value: "netgsm", label: "NetGSM" }, { value: "iletimerkezi", label: "İletimerkezi" }, { value: "messagebird", label: "MessageBird" }] },
          { key: "sms_api_key",     label: "API Anahtarı",        type: "password",defaultValue: "",   sensitive: true },
          { key: "sms_api_secret",  label: "API Secret",          type: "password",defaultValue: "",   sensitive: true },
          { key: "sms_sender_id",   label: "Gönderen ID",         type: "text",    defaultValue: "",   placeholder: "TUTARNET" },
        ],
      },
    ],
  },
  {
    id: "eticaret",
    label: "E-Ticaret",
    icon: ShoppingCart,
    description: "Ödeme, kargo, vergi ve ürün ayarları",
    color: "#8b5cf6",
    sections: [
      {
        id: "odeme",
        title: "Ödeme Yöntemleri",
        description: "Desteklenen ödeme entegrasyonları",
        fields: [
          { key: "payment_stripe",     label: "Stripe",              type: "toggle",  defaultValue: "false" },
          { key: "stripe_public_key",  label: "Stripe Public Key",   type: "text",    defaultValue: "", sensitive: true, placeholder: "pk_..." },
          { key: "stripe_secret_key",  label: "Stripe Secret Key",   type: "password",defaultValue: "", sensitive: true, placeholder: "sk_..." },
          { key: "stripe_webhook",     label: "Stripe Webhook Secret",type: "password",defaultValue: "", sensitive: true },
          { key: "payment_iyzico",     label: "İyzico",              type: "toggle",  defaultValue: "false" },
          { key: "iyzico_api_key",     label: "İyzico API Key",      type: "password",defaultValue: "", sensitive: true },
          { key: "iyzico_secret_key",  label: "İyzico Secret Key",   type: "password",defaultValue: "", sensitive: true },
          { key: "payment_paytr",      label: "PayTR",               type: "toggle",  defaultValue: "false" },
          { key: "paytr_merchant_id",  label: "PayTR Merchant ID",   type: "text",    defaultValue: "", sensitive: true },
          { key: "payment_cod",        label: "Kapıda Ödeme",        type: "toggle",  defaultValue: "true" },
          { key: "payment_bank_transfer",label: "Banka Havalesi",    type: "toggle",  defaultValue: "true" },
        ],
      },
      {
        id: "kargo",
        title: "Kargo Ayarları",
        description: "Teslimat ve kargo entegrasyonları",
        fields: [
          { key: "free_shipping_threshold", label: "Ücretsiz Kargo Limiti", type: "number", defaultValue: "200", unit: "₺" },
          { key: "default_shipping_cost",   label: "Standart Kargo Ücreti",type: "number", defaultValue: "30",  unit: "₺" },
          { key: "shipping_aras",  label: "Aras Kargo",    type: "toggle", defaultValue: "false" },
          { key: "shipping_yurtici",label: "Yurtiçi Kargo",type: "toggle", defaultValue: "false" },
          { key: "shipping_mng",   label: "MNG Kargo",     type: "toggle", defaultValue: "false" },
          { key: "shipping_ptt",   label: "PTT Kargo",     type: "toggle", defaultValue: "false" },
        ],
      },
      {
        id: "vergi",
        title: "Vergi Yapılandırması",
        description: "KDV ve vergi hesaplama ayarları",
        fields: [
          { key: "tax_enabled",       label: "Vergi Hesaplama",      type: "toggle", defaultValue: "true" },
          { key: "default_tax_rate",  label: "Varsayılan KDV Oranı", type: "number", defaultValue: "18",  unit: "%" },
          { key: "prices_include_tax",label: "Fiyatlara KDV Dahil",  type: "toggle", defaultValue: "true" },
          { key: "show_tax_breakdown",label: "KDV Dökümü Göster",    type: "toggle", defaultValue: "true" },
        ],
      },
      {
        id: "urun",
        title: "Ürün Ayarları",
        description: "Ürün listeleme ve stok yönetimi",
        fields: [
          { key: "products_per_page",    label: "Sayfa Başına Ürün",    type: "number",  defaultValue: "24" },
          { key: "allow_reviews",        label: "Ürün Yorumları",       type: "toggle",  defaultValue: "true" },
          { key: "review_moderation",    label: "Yorum Moderasyonu",    type: "toggle",  defaultValue: "true" },
          { key: "show_stock_count",     label: "Stok Adedi Göster",    type: "toggle",  defaultValue: "false" },
          { key: "low_stock_threshold",  label: "Düşük Stok Uyarısı",  type: "number",  defaultValue: "10",  unit: "adet" },
          { key: "out_of_stock_display", label: "Tükenen Ürün",        type: "select",  defaultValue: "show", options: [{ value: "show", label: "Göster" }, { value: "hide", label: "Gizle" }] },
        ],
      },
    ],
  },
  {
    id: "seo",
    label: "SEO & Analitik",
    icon: Globe,
    description: "Meta taglar, sitemap, analitik entegrasyonları",
    color: "#06b6d4",
    sections: [
      {
        id: "meta",
        title: "Meta Etiketleri",
        description: "Arama motoru için varsayılan meta bilgileri",
        fields: [
          { key: "meta_title_suffix",  label: "Başlık Soneki",        type: "text",     defaultValue: "| tutar.net",     placeholder: "| Sitenizin Adı" },
          { key: "meta_robots",        label: "Robots Direktifi",     type: "select",   defaultValue: "index,follow",    options: [{ value: "index,follow", label: "Index, Follow" }, { value: "noindex,follow", label: "NoIndex, Follow" }, { value: "noindex,nofollow", label: "NoIndex, NoFollow" }] },
          { key: "canonical_enabled",  label: "Canonical URL",        type: "toggle",   defaultValue: "true" },
          { key: "structured_data",    label: "Yapısal Veri",         type: "toggle",   defaultValue: "true", description: "Schema.org JSON-LD otomatik eklenir" },
        ],
      },
      {
        id: "opengraph",
        title: "Open Graph & Sosyal",
        description: "Sosyal medya paylaşım ayarları",
        fields: [
          { key: "og_enabled",        label: "OG Etiketleri",        type: "toggle",  defaultValue: "true" },
          { key: "og_type",           label: "OG Tip",               type: "select",  defaultValue: "website", options: [{ value: "website", label: "Website" }, { value: "article", label: "Article" }] },
          { key: "twitter_card",      label: "Twitter Card Tipi",    type: "select",  defaultValue: "summary_large_image", options: [{ value: "summary", label: "Summary" }, { value: "summary_large_image", label: "Summary Large Image" }] },
          { key: "twitter_site",      label: "Twitter Hesabı",       type: "text",    defaultValue: "",  placeholder: "@siteniz" },
        ],
      },
      {
        id: "sitemap",
        title: "Sitemap & Robots",
        description: "Arama motoru tarama ayarları",
        fields: [
          { key: "sitemap_enabled",   label: "XML Sitemap",          type: "toggle",  defaultValue: "true" },
          { key: "sitemap_frequency", label: "Güncelleme Sıklığı",   type: "select",  defaultValue: "weekly", options: [{ value: "daily", label: "Günlük" }, { value: "weekly", label: "Haftalık" }, { value: "monthly", label: "Aylık" }] },
          { key: "robots_txt",        label: "robots.txt İçeriği",   type: "textarea",defaultValue: "User-agent: *\nAllow: /\nSitemap: https://tutar.net/sitemap.xml" },
        ],
      },
      {
        id: "analitik",
        title: "Analitik Entegrasyonları",
        description: "Ziyaretçi takip ve analitik araçları",
        fields: [
          { key: "ga4_id",            label: "Google Analytics 4 ID", type: "text",   defaultValue: "",  placeholder: "G-XXXXXXXXXX" },
          { key: "gtm_id",            label: "Google Tag Manager ID",  type: "text",   defaultValue: "",  placeholder: "GTM-XXXXXXX" },
          { key: "meta_pixel_id",     label: "Meta (Facebook) Pixel", type: "text",   defaultValue: "",  placeholder: "1234567890" },
          { key: "hotjar_id",         label: "Hotjar Site ID",         type: "text",   defaultValue: "",  placeholder: "1234567" },
          { key: "clarity_id",        label: "Microsoft Clarity ID",   type: "text",   defaultValue: "" },
          { key: "posthog_key",       label: "PostHog API Key",        type: "password",defaultValue: "", sensitive: true, badge: "new" },
        ],
      },
    ],
  },
  {
    id: "entegrasyonlar",
    label: "Entegrasyonlar & API",
    icon: Plug,
    description: "API anahtarları, webhooklar ve üçüncü taraf servisler",
    color: "#f97316",
    sections: [
      {
        id: "api_anahtarlari",
        title: "API Anahtarları",
        description: "Harici sistemler için API erişimi",
        fields: [
          { key: "api_enabled",       label: "Public API",            type: "toggle",  defaultValue: "false" },
          { key: "api_rate_limit",    label: "Rate Limit",            type: "number",  defaultValue: "100",  unit: "istek/dakika" },
          { key: "api_version",       label: "API Versiyonu",         type: "select",  defaultValue: "v1",   options: [{ value: "v1", label: "v1" }, { value: "v2", label: "v2 (beta)" }] },
          { key: "api_docs_public",   label: "API Docs Herkese Açık", type: "toggle",  defaultValue: "false" },
        ],
      },
      {
        id: "webhooks",
        title: "Webhook Ayarları",
        description: "Olaylar için HTTP bildirim endpoint'leri",
        fields: [
          { key: "webhook_enabled",     label: "Webhooklar",              type: "toggle",  defaultValue: "false" },
          { key: "webhook_secret",      label: "Webhook İmza Anahtarı",   type: "password",defaultValue: "", sensitive: true },
          { key: "webhook_on_user",     label: "Kullanıcı Olayları",      type: "toggle",  defaultValue: "true" },
          { key: "webhook_on_partner",  label: "Partner Olayları",        type: "toggle",  defaultValue: "true" },
          { key: "webhook_on_order",    label: "Sipariş Olayları",        type: "toggle",  defaultValue: "true" },
          { key: "webhook_retry_count", label: "Yeniden Deneme Sayısı",   type: "number",  defaultValue: "3" },
        ],
      },
      {
        id: "bulut",
        title: "Bulut & Depolama",
        description: "Dosya depolama servisleri",
        fields: [
          { key: "storage_provider",  label: "Depolama Sağlayıcı",    type: "select",  defaultValue: "local", options: [{ value: "local", label: "Yerel Depolama" }, { value: "s3", label: "Amazon S3" }, { value: "r2", label: "Cloudflare R2" }, { value: "supabase", label: "Supabase Storage" }, { value: "gcs", label: "Google Cloud Storage" }] },
          { key: "s3_bucket",         label: "S3 Bucket Adı",         type: "text",    defaultValue: "" },
          { key: "s3_region",         label: "S3 Bölge",              type: "text",    defaultValue: "eu-central-1" },
          { key: "s3_access_key",     label: "S3 Access Key",         type: "text",    defaultValue: "", sensitive: true },
          { key: "s3_secret_key",     label: "S3 Secret Key",         type: "password",defaultValue: "", sensitive: true },
          { key: "cdn_url",           label: "CDN URL",               type: "url",     defaultValue: "", placeholder: "https://cdn.siteniz.com" },
        ],
      },
      {
        id: "diger",
        title: "Diğer Entegrasyonlar",
        description: "Çeşitli üçüncü taraf servisler",
        fields: [
          { key: "mapbox_token",       label: "Mapbox Token",           type: "password",defaultValue: "", sensitive: true },
          { key: "algolia_app_id",     label: "Algolia App ID",         type: "text",    defaultValue: "", badge: "pro" },
          { key: "algolia_api_key",    label: "Algolia API Key",        type: "password",defaultValue: "", sensitive: true, badge: "pro" },
          { key: "openai_api_key",     label: "OpenAI API Key",         type: "password",defaultValue: "", sensitive: true, badge: "new" },
          { key: "sentry_dsn",         label: "Sentry DSN",             type: "url",     defaultValue: "" },
          { key: "intercom_app_id",    label: "Intercom App ID",        type: "text",    defaultValue: "" },
        ],
      },
    ],
  },
  {
    id: "medya",
    label: "Medya & Dosyalar",
    icon: FolderOpen,
    description: "Upload limitleri, formatlar ve CDN",
    color: "#84cc16",
    sections: [
      {
        id: "upload",
        title: "Upload Ayarları",
        description: "Dosya yükleme kuralları",
        fields: [
          { key: "max_upload_size",    label: "Maks. Upload Boyutu",  type: "number",  defaultValue: "10",  unit: "MB" },
          { key: "max_image_width",    label: "Maks. Görsel Genişliği",type: "number", defaultValue: "4000",unit: "px" },
          { key: "max_image_height",   label: "Maks. Görsel Yüksekliği",type: "number",defaultValue: "4000",unit: "px" },
          { key: "allowed_image_types",label: "İzinli Görsel Formatları",type: "tags", defaultValue: "jpg,jpeg,png,webp,gif,svg" },
          { key: "allowed_doc_types",  label: "İzinli Dosya Formatları",type: "tags",  defaultValue: "pdf,doc,docx,xls,xlsx,zip" },
          { key: "auto_webp",          label: "Otomatik WebP Dönüşümü",type: "toggle", defaultValue: "true", description: "Görseller otomatik WebP'ye dönüştürülür" },
        ],
      },
      {
        id: "gorsel_islem",
        title: "Görsel İşleme",
        description: "Otomatik yeniden boyutlandırma ve optimizasyon",
        fields: [
          { key: "thumbnail_width",    label: "Küçük Resim Genişliği",type: "number",  defaultValue: "300",  unit: "px" },
          { key: "thumbnail_height",   label: "Küçük Resim Yüksekliği",type: "number", defaultValue: "300",  unit: "px" },
          { key: "image_quality",      label: "Görsel Kalitesi",      type: "range",   defaultValue: "85",   min: 1, max: 100, unit: "%" },
          { key: "strip_exif",         label: "EXIF Verisi Temizle",  type: "toggle",  defaultValue: "true", description: "Gizlilik için konum/cihaz bilgisi kaldırılır" },
          { key: "lazy_loading",       label: "Lazy Loading",         type: "toggle",  defaultValue: "true" },
        ],
      },
    ],
  },
  {
    id: "sistem",
    label: "Sistem & Geliştirici",
    icon: Terminal,
    description: "Cache, debug modu, loglar ve yedekleme",
    color: "#64748b",
    sections: [
      {
        id: "performans",
        title: "Performans & Cache",
        description: "Önbellekleme ve hız optimizasyonu",
        fields: [
          { key: "cache_enabled",      label: "Cache",                type: "toggle",  defaultValue: "true" },
          { key: "cache_ttl",          label: "Cache TTL",            type: "number",  defaultValue: "3600",  unit: "saniye" },
          { key: "cache_provider",     label: "Cache Sağlayıcı",      type: "select",  defaultValue: "memory", options: [{ value: "memory", label: "Bellek (In-Memory)" }, { value: "redis", label: "Redis" }, { value: "upstash", label: "Upstash Redis" }] },
          { key: "redis_url",          label: "Redis URL",            type: "text",    defaultValue: "",     placeholder: "redis://localhost:6379", sensitive: true },
          { key: "html_minify",        label: "HTML Minify",          type: "toggle",  defaultValue: "false" },
          { key: "gzip_enabled",       label: "GZIP Sıkıştırma",     type: "toggle",  defaultValue: "true" },
        ],
      },
      {
        id: "debug",
        title: "Debug & Geliştirici",
        description: "Geliştirici araçları ve hata ayıklama",
        fields: [
          { key: "debug_mode",        label: "Debug Modu",            type: "toggle",  defaultValue: "false", description: "Üretimde KAPALI tutun!" },
          { key: "show_query_log",    label: "Sorgu Günlüğü",         type: "toggle",  defaultValue: "false" },
          { key: "error_reporting",   label: "Hata Raporlama",        type: "select",  defaultValue: "production", options: [{ value: "production", label: "Üretim (Kısıtlı)" }, { value: "verbose", label: "Ayrıntılı (Geliştirme)" }, { value: "silent", label: "Sessiz" }] },
          { key: "api_response_time", label: "API Süre Limiti",       type: "number",  defaultValue: "10",   unit: "saniye" },
        ],
      },
      {
        id: "log",
        title: "Log Yönetimi",
        description: "Uygulama günlükleri ve audit log",
        fields: [
          { key: "log_level",         label: "Log Seviyesi",          type: "select",  defaultValue: "warn", options: [{ value: "error", label: "Error" }, { value: "warn", label: "Warning" }, { value: "info", label: "Info" }, { value: "debug", label: "Debug" }] },
          { key: "audit_log_enabled", label: "Audit Log",             type: "toggle",  defaultValue: "true", description: "Tüm admin değişiklikleri kayıt altına alınır" },
          { key: "log_retention_days",label: "Log Saklama Süresi",    type: "number",  defaultValue: "90",   unit: "gün" },
          { key: "log_external",      label: "Harici Log Servisi",    type: "select",  defaultValue: "none", options: [{ value: "none", label: "Yok" }, { value: "datadog", label: "Datadog" }, { value: "logtail", label: "Logtail" }, { value: "papertrail", label: "Papertrail" }] },
        ],
      },
      {
        id: "yedekleme",
        title: "Yedekleme & Geri Yükleme",
        description: "Otomatik yedekleme ve veri kurtarma",
        fields: [
          { key: "backup_enabled",     label: "Otomatik Yedekleme",   type: "toggle",  defaultValue: "false", badge: "pro" },
          { key: "backup_frequency",   label: "Yedekleme Sıklığı",    type: "select",  defaultValue: "daily", options: [{ value: "hourly", label: "Saatlik" }, { value: "daily", label: "Günlük" }, { value: "weekly", label: "Haftalık" }] },
          { key: "backup_retention",   label: "Yedek Saklama",        type: "number",  defaultValue: "7",     unit: "adet" },
          { key: "backup_destination", label: "Yedek Hedefi",         type: "select",  defaultValue: "local", options: [{ value: "local", label: "Yerel" }, { value: "s3", label: "Amazon S3" }, { value: "gcs", label: "Google Cloud" }] },
        ],
      },
    ],
  },
  {
    id: "yerellesme",
    label: "Yerelleştirme",
    icon: Languages,
    description: "Çoklu dil ve bölgesel formatlar",
    color: "#0ea5e9",
    sections: [
      {
        id: "diller",
        title: "Dil Yönetimi",
        description: "Desteklenen diller ve çeviri ayarları",
        fields: [
          { key: "active_languages",   label: "Aktif Diller",         type: "tags",    defaultValue: "tr", placeholder: "tr, en, de, fr" },
          { key: "fallback_language",  label: "Yedek Dil",            type: "select",  defaultValue: "tr", options: [{ value: "tr", label: "Türkçe" }, { value: "en", label: "İngilizce" }] },
          { key: "auto_detect_lang",   label: "Dil Otomatik Algılama",type: "toggle",  defaultValue: "true", description: "Tarayıcı diline göre otomatik yönlendir" },
          { key: "lang_switcher",      label: "Dil Değiştirici",      type: "toggle",  defaultValue: "true" },
          { key: "url_lang_prefix",    label: "URL Dil Öneki",        type: "toggle",  defaultValue: "false", description: "Aktifken: /tr/sayfa, /en/page" },
        ],
      },
      {
        id: "formatlar",
        title: "Bölgesel Formatlar",
        description: "Tarih, saat, sayı ve para formatları",
        fields: [
          { key: "number_decimal",     label: "Ondalık Ayraç",        type: "select",  defaultValue: ",", options: [{ value: ",", label: "Virgül (1.234,56)" }, { value: ".", label: "Nokta (1,234.56)" }] },
          { key: "number_thousands",   label: "Binler Ayraç",         type: "select",  defaultValue: ".", options: [{ value: ".", label: "Nokta" }, { value: ",", label: "Virgül" }, { value: " ", label: "Boşluk" }] },
          { key: "first_day_of_week",  label: "Haftanın İlk Günü",   type: "select",  defaultValue: "1", options: [{ value: "0", label: "Pazar" }, { value: "1", label: "Pazartesi" }] },
          { key: "time_format",        label: "Saat Formatı",         type: "select",  defaultValue: "24h", options: [{ value: "24h", label: "24 Saat" }, { value: "12h", label: "12 Saat (AM/PM)" }] },
        ],
      },
    ],
  },
  {
    id: "icerik",
    label: "İçerik Yönetimi",
    icon: FileText,
    description: "Sayfa, menü ve blog yapılandırması",
    color: "#a855f7",
    sections: [
      {
        id: "sayfalar",
        title: "Sayfa Ayarları",
        description: "Varsayılan sayfa davranışları",
        fields: [
          { key: "homepage",          label: "Ana Sayfa",             type: "select",  defaultValue: "default", options: [{ value: "default", label: "Varsayılan" }, { value: "custom", label: "Özel Sayfa" }, { value: "blog", label: "Blog" }] },
          { key: "posts_per_page",    label: "Sayfa Başına Gönderi",  type: "number",  defaultValue: "10" },
          { key: "excerpt_length",    label: "Özet Uzunluğu",        type: "number",  defaultValue: "150",  unit: "karakter" },
          { key: "reading_time",      label: "Okuma Süresi Göster",  type: "toggle",  defaultValue: "true" },
          { key: "comments_enabled",  label: "Yorumlar",              type: "toggle",  defaultValue: "true" },
          { key: "comment_moderation",label: "Yorum Moderasyonu",     type: "toggle",  defaultValue: "true" },
        ],
      },
      {
        id: "menu",
        title: "Menü Yönetimi",
        description: "Navigasyon ve footer menü ayarları",
        fields: [
          { key: "nav_sticky",        label: "Yapışkan Navigasyon",  type: "toggle",  defaultValue: "true" },
          { key: "nav_transparent",   label: "Şeffaf Navigasyon",    type: "toggle",  defaultValue: "false", description: "Hero bölümünde şeffaf görünüm" },
          { key: "footer_columns",    label: "Footer Kolon Sayısı",  type: "select",  defaultValue: "4", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
          { key: "show_footer_credits",label: "Footer Kredi Metni",  type: "toggle",  defaultValue: "true" },
          { key: "footer_credit_text", label: "Kredi Metni",          type: "text",   defaultValue: "© 2025 tutar.net. Tüm hakları saklıdır." },
        ],
      },
      {
        id: "blog",
        title: "Blog Yapılandırması",
        description: "Blog ve makale ayarları",
        fields: [
          { key: "blog_enabled",      label: "Blog Özelliği",        type: "toggle",  defaultValue: "false" },
          { key: "blog_slug",         label: "Blog URL Öneki",       type: "text",    defaultValue: "blog",  placeholder: "blog" },
          { key: "author_pages",      label: "Yazar Sayfaları",      type: "toggle",  defaultValue: "true" },
          { key: "related_posts",     label: "İlgili Gönderiler",    type: "toggle",  defaultValue: "true" },
          { key: "related_posts_count",label: "İlgili Gönderi Sayısı",type: "number", defaultValue: "3" },
          { key: "rss_feed",          label: "RSS Feed",             type: "toggle",  defaultValue: "true" },
        ],
      },
    ],
  },
];

/* ─── Inline styles ──────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 13px",
  background: "#ffffff",
  border: `1px solid ${T.border}`,
  borderRadius: "9px", color: T.textPrimary,
  fontSize: "13.5px", outline: "none",
  transition: "border-color 0.18s",
  boxSizing: "border-box",
};

/* ─── Field renderer ─────────────────────────────────────────── */
function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showPass, setShowPass] = React.useState(false);
  const [copyDone, setCopyDone] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  if (field.type === "toggle") {
    const on = value === "true";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => onChange(on ? "false" : "true")}
          style={{
            width: "44px", height: "24px", borderRadius: "12px",
            background: on ? T.accent : T.border,
            border: "none", cursor: "pointer", position: "relative",
            transition: "background 0.2s", flexShrink: 0,
          }}
        >
          <span style={{
            position: "absolute", top: "3px",
            left: on ? "23px" : "3px",
            width: "18px", height: "18px",
            borderRadius: "50%", background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }} />
        </button>
        <span style={{ fontSize: "13px", color: on ? T.success : T.textMuted, fontWeight: 500 }}>
          {on ? "Açık" : "Kapalı"}
        </span>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inp, appearance: "auto", cursor: "pointer" }}
      >
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  if (field.type === "color") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="color"
          value={value || "#6366f1"}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "44px", height: "38px", borderRadius: "8px", border: `1px solid ${T.border}`, cursor: "pointer", padding: "2px", background: "#fff" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inp, width: "140px", fontFamily: "monospace" }}
          placeholder="#000000"
        />
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: value || "#e2e8f0", border: `1px solid ${T.border}` }} />
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "json") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={field.type === "json" ? 6 : 4}
        placeholder={field.placeholder}
        style={{ ...inp, resize: "vertical", lineHeight: 1.6, fontFamily: field.type === "json" ? "monospace" : "inherit" }}
      />
    );
  }

  if (field.type === "tags") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "virgülle ayırın: tag1, tag2"}
        style={inp}
      />
    );
  }

  if (field.type === "range") {
    const numVal = parseInt(value) || field.min || 0;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <input
          type="range"
          min={field.min ?? 0}
          max={field.max ?? 100}
          value={numVal}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, accentColor: T.accent }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "70px" }}>
          <input
            type="number"
            value={numVal}
            min={field.min}
            max={field.max}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inp, width: "64px", textAlign: "center" }}
          />
          {field.unit && <span style={{ fontSize: "12px", color: T.textMuted, whiteSpace: "nowrap" }}>{field.unit}</span>}
        </div>
      </div>
    );
  }

  if (field.type === "password") {
    return (
      <div style={{ position: "relative" }}>
        <input
          type={showPass ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "••••••••"}
          autoComplete="new-password"
          style={{ ...inp, paddingRight: "72px" }}
        />
        <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "4px" }}>
          <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: "4px", display: "flex", alignItems: "center" }}>
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copyDone ? T.success : T.textMuted, padding: "4px", display: "flex", alignItems: "center" }}>
            <Copy size={14} />
          </button>
        </div>
      </div>
    );
  }

  const withUnit = field.unit && field.type === "number";
  return (
    <div style={{ position: "relative" }}>
      <input
        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        autoComplete={field.sensitive ? "off" : undefined}
        style={{ ...inp, paddingRight: withUnit ? "60px" : inp.paddingRight as string }}
      />
      {withUnit && (
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: T.textMuted, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {field.unit}
        </span>
      )}
    </div>
  );
}

/* ─── Badge component ────────────────────────────────────────── */
function FieldBadge({ type }: { type: "new" | "pro" | "beta" }) {
  const cfg = {
    new:  { label: "YENİ",  bg: "#dcfce7", color: "#16a34a" },
    pro:  { label: "PRO",   bg: "#ede9fe", color: "#7c3aed" },
    beta: { label: "BETA",  bg: "#fef3c7", color: "#b45309" },
  }[type];
  return (
    <span style={{ fontSize: "9.5px", fontWeight: 700, background: cfg.bg, color: cfg.color, padding: "1px 6px", borderRadius: "4px", letterSpacing: "0.05em" }}>
      {cfg.label}
    </span>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function SiteAyarlariPage() {
  const [dbValues, setDbValues] = useState<Record<string, string>>({});
  const [values, setValues]     = useState<Record<string, string>>({});
  const [loadedValues, setLoadedValues] = useState<Record<string, string>>({});
  const [sources, setSources]   = useState<Record<string, "db" | "env" | "default">>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [activeCategory, setActiveCategory] = useState("genel");
  const [activeSection, setActiveSection]   = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-ayarlari");
      if (res.ok) {
        const data = await res.json();
        const newValues: Record<string, string> = {};
        const newDbValues: Record<string, string> = {};
        const newSources: Record<string, "db" | "env" | "default"> = {};

        for (const [k, v] of Object.entries(data.settings ?? {})) {
          const entry = v as { value: string; source: "db" | "env" | "default" };
          newValues[k] = entry.value;
          newSources[k] = entry.source;
          if (entry.source === "db") newDbValues[k] = entry.value;
        }

        CATEGORIES.forEach((cat) => cat.sections.forEach((sec) =>
          sec.fields.forEach((f) => {
            if (newValues[f.key] === undefined) newValues[f.key] = f.defaultValue;
          })
        ));

        setValues(newValues);
        setLoadedValues({ ...newValues });
        setDbValues(newDbValues);
        setSources(newSources);
      }
    } catch {
      const defaults: Record<string, string> = {};
      CATEGORIES.forEach((cat) => cat.sections.forEach((sec) =>
        sec.fields.forEach((f) => { defaults[f.key] = f.defaultValue; })
      ));
      setValues(defaults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const category = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];

  useEffect(() => {
    setActiveSection(category.sections[0]?.id ?? null);
  }, [activeCategory, category.sections]);

  const section = category.sections.find((s) => s.id === activeSection) ?? category.sections[0];

  // "Değişti" = kullanıcı API'den yüklenen değerden farklı bir şey yazdı
  const isDirty = Object.keys(values).some((k) => values[k] !== (loadedValues[k] ?? values[k]));

  const handleSave = async () => {
    setSaving(true);
    const changed = Object.keys(values)
      .filter((k) => values[k] !== (loadedValues[k] ?? values[k]))
      .map((k) => ({ key: k, value: values[k] }));

    if (changed.length === 0) { showToast(true, "Değişiklik yok."); setSaving(false); return; }

    const res = await fetch("/api/admin/site-ayarlari", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: changed }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      showToast(true, `${d.saved} ayar başarıyla kaydedildi.`);
      load();
    } else {
      const d = await res.json();
      showToast(false, d.error ?? "Kaydedilemedi");
    }
  };

  const handleReset = async () => {
    if (!section) return;
    const keys = section.fields.map((f) => f.key);
    const res = await fetch("/api/admin/site-ayarlari", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    });
    if (res.ok) {
      showToast(true, `"${section.title}" sıfırlandı — env/varsayılan değerler geri yüklendi.`);
      load();
    } else {
      showToast(false, "Sıfırlanamadı");
    }
  };

  const changedCount = Object.keys(values).filter(
    (k) => values[k] !== (loadedValues[k] ?? values[k])
  ).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: T.textPrimary, margin: 0, letterSpacing: "-0.5px" }}>
            Site Ayarları
          </h1>
          <p style={{ color: T.textSecondary, marginTop: "5px", fontSize: "13.5px" }}>
            Sitenizin tüm yapılandırmasını buradan yönetin — {CATEGORIES.reduce((acc, c) => acc + c.sections.reduce((a, s) => a + s.fields.length, 0), 0)} ayar, {CATEGORIES.length} kategori
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={load}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "9px", color: T.textSecondary, fontSize: "13px", cursor: "pointer", fontWeight: 500 }}
          >
            <RefreshCw size={14} /> Yenile
          </button>
          {isDirty && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "9px", fontSize: "12.5px", color: "#b45309" }}>
              <AlertTriangle size={13} />
              {changedCount} kaydedilmemiş değişiklik
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 20px", background: T.accent, border: "none", borderRadius: "9px", color: "#fff", fontSize: "13.5px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.7 : 1 }}
          >
            <Save size={15} /> {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "13px 18px", borderRadius: "10px", marginBottom: "20px",
          background: toast.ok ? "#dcfce7" : "#fee2e2",
          border: `1px solid ${toast.ok ? "#bbf7d0" : "#fecaca"}`,
          color: toast.ok ? "#16a34a" : "#dc2626",
          fontSize: "13.5px", fontWeight: 500,
        }}>
          {toast.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.text}
        </div>
      )}

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px", alignItems: "flex-start" }}>

        {/* Left sidebar: categories */}
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden", position: "sticky", top: "78px" }}>
          <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kategoriler</span>
          </div>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const CatIcon = cat.icon;
            const totalFields = cat.sections.reduce((a, s) => a + s.fields.length, 0);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "11px 14px", border: "none",
                  cursor: "pointer", textAlign: "left",
                  background: isActive ? T.accentDim : "transparent",
                  borderLeft: isActive ? `3px solid ${T.accent}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: isActive ? T.accentDim : T.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: isActive ? `1px solid ${T.accentBorder}` : `1px solid ${T.border}` }}>
                  <CatIcon size={14} color={isActive ? T.accent : T.textMuted} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? T.accent : T.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: "11px", color: T.textMuted }}>{totalFields} ayar</div>
                </div>
                {isActive && <ChevronRight size={13} color={T.accent} />}
              </button>
            );
          })}
        </div>

        {/* Right: sections + fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

          {/* Category header */}
          <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: "14px 14px 0 0", padding: "20px 24px", borderBottom: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${category.color}15`, border: `1px solid ${category.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <category.icon size={18} color={category.color} strokeWidth={1.8} />
              </div>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: T.textPrimary, margin: 0 }}>{category.label}</h2>
                <p style={{ fontSize: "13px", color: T.textMuted, margin: "2px 0 0" }}>{category.description}</p>
              </div>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", gap: "4px", marginTop: "18px", borderBottom: `1px solid ${T.border}`, paddingBottom: "0", marginBottom: "-20px" }}>
              {category.sections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    style={{
                      padding: "9px 16px", border: "none", background: "transparent",
                      cursor: "pointer", fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? T.accent : T.textSecondary,
                      borderBottom: isActive ? `2px solid ${T.accent}` : "2px solid transparent",
                      marginBottom: "-1px", transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sec.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section content */}
          {section && (
            <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: "0 0 14px 14px", padding: "28px 24px" }}>
              {section.description && (
                <div style={{ display: "flex", gap: "10px", padding: "12px 16px", background: "#f8fafc", border: `1px solid ${T.border}`, borderRadius: "9px", marginBottom: "28px" }}>
                  <Info size={15} color={T.textMuted} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "13px", color: T.textSecondary, margin: 0, lineHeight: 1.5 }}>{section.description}</p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {section.fields.map((field, idx) => {
                  const val = values[field.key] ?? field.defaultValue;
                  const isChanged = val !== (loadedValues[field.key] ?? field.defaultValue);
                  return (
                    <div
                      key={field.key}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px", alignItems: "flex-start",
                        padding: "20px 0",
                        borderBottom: idx < section.fields.length - 1 ? `1px solid ${T.divider}` : "none",
                      }}
                    >
                      {/* Label column */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                          <label style={{ fontSize: "13.5px", fontWeight: 600, color: T.textPrimary, display: "block" }}>
                            {field.label}
                          </label>
                          {field.badge && <FieldBadge type={field.badge} />}
                          {isChanged && (
                            <span style={{ fontSize: "10px", fontWeight: 700, background: "#fef9c3", color: "#b45309", padding: "1px 6px", borderRadius: "4px" }}>
                              DEĞİŞTİ
                            </span>
                          )}
                          {!isChanged && sources[field.key] === "db" && (
                            <span style={{ fontSize: "10px", fontWeight: 600, background: "#dcfce7", color: "#16a34a", padding: "1px 6px", borderRadius: "4px" }}>
                              DB
                            </span>
                          )}
                          {!isChanged && sources[field.key] === "env" && (
                            <span style={{ fontSize: "10px", fontWeight: 600, background: "#eff6ff", color: "#2563eb", padding: "1px 6px", borderRadius: "4px" }}>
                              ENV
                            </span>
                          )}
                        </div>
                        {field.description && (
                          <p style={{ fontSize: "12.5px", color: T.textMuted, margin: 0, lineHeight: 1.5 }}>
                            {field.description}
                          </p>
                        )}
                        {field.sensitive && (
                          <p style={{ fontSize: "11.5px", color: T.warning, margin: "4px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Shield size={11} /> Hassas bilgi — güvenli saklayın
                          </p>
                        )}
                      </div>

                      {/* Input column */}
                      <div>
                        <FieldRenderer
                          field={field}
                          value={val}
                          onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${T.border}` }}>
                <button
                  onClick={handleReset}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", color: T.textMuted, fontSize: "12.5px", cursor: "pointer", fontWeight: 500 }}
                >
                  <RotateCcw size={13} /> Varsayılana Sıfırla
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 22px", background: T.accent, border: "none", borderRadius: "9px", color: "#fff", fontSize: "13.5px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.7 : 1 }}
                >
                  <Save size={14} /> {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
