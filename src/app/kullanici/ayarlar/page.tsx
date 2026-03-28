"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, Shield, Bell, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}

export default function AyarlarPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", phone: "" });
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [campaignEnabled, setCampaignEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      setToken(session.access_token);

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setForm({ name: data.user.name ?? "", phone: data.user.phone ?? "" });
        }
      } catch {
        // Ağ hatası — boş form ile devam et
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setMessage({ type: "success", text: "Bilgiler başarıyla güncellendi." });
      } else {
        setMessage({ type: "error", text: "Güncelleme sırasında bir hata oluştu." });
      }
    } catch {
      setMessage({ type: "error", text: "Bağlantı hatası. Lütfen tekrar deneyin." });
    } finally {
      setSaving(false);
    }
  }, [token, form]);

  const handlePasswordUpdate = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Şifre en az 6 karakter olmalıdır." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Şifreler eşleşmiyor. Lütfen tekrar kontrol edin." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: "error", text: "Şifre güncellenemedi: " + error.message });
    } else {
      setMessage({ type: "success", text: "Şifreniz başarıyla güncellendi." });
      (e.target as HTMLFormElement).reset();
    }

    setSaving(false);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--muted-fg)" }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          backgroundColor: message.type === "success" ? "rgba(0, 229, 188, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: message.type === "success" ? "var(--teal)" : "#ef4444",
          border: `1px solid ${message.type === "success" ? "rgba(0, 229, 188, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <User size={20} color="var(--fg)" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>Kişisel Bilgiler</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Ad Soyad</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--muted-bg)", color: "var(--fg)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Telefon Numarası</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+90 5xx xxx xx xx"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--muted-bg)", color: "var(--fg)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>E-posta Adresi</label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--muted-fg)", cursor: "not-allowed" }}
            />
            <span style={{ fontSize: "12px", color: "var(--muted-fg)", marginTop: "4px", display: "block" }}>Değişiklik için müşteri hizmetleriyle görüşün.</span>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              style={{ padding: "10px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <Shield size={20} color="var(--fg)" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>Güvenlik & Şifre</h2>
        </div>
        <form onSubmit={handlePasswordUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Yeni Şifre</label>
            <input name="new_password" type="password" placeholder="••••••••" minLength={6} required autoComplete="new-password" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }} />
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", margin: "14px 0 8px" }}>Şifreyi Onayla</label>
            <input name="confirm_password" type="password" placeholder="••••••••" minLength={6} required autoComplete="new-password" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }} />
          </div>
          <div>
            <button type="submit" disabled={saving} style={{ padding: "10px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <Bell size={20} color="var(--fg)" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>Bildirim Tercihleri</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)" }}>Fiyat Alarmı Bildirimleri</div>
              <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>Takip ettiğim ürünlerin fiyatı düştüğünde e-posta al.</div>
            </div>
            <input type="checkbox" checked={alarmEnabled} onChange={(e) => setAlarmEnabled(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--teal)" }} />
          </div>
          <div style={{ height: "1px", backgroundColor: "var(--border)" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)" }}>Kampanya ve Fırsatlar</div>
              <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>Özel indirim günlerinde bülten e-postası al.</div>
            </div>
            <input type="checkbox" checked={campaignEnabled} onChange={(e) => setCampaignEnabled(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--teal)" }} />
          </div>
          <div style={{ height: "1px", backgroundColor: "var(--border)" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)" }}>SMS Bildirimleri</div>
              <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>Kritik güncellemeleri telefonuma SMS olarak gönder.</div>
            </div>
            <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--teal)" }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "var(--muted-bg)", fontSize: "12px", color: "var(--muted-fg)" }}>
        <Settings size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
        Bildirim tercihleri kaydedildi — henüz aktif e-posta gönderimi yapılmamaktadır.
      </div>

    </div>
  );
}
