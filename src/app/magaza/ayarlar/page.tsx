"use client";

import { useEffect, useState, useCallback } from "react";
import { Store, Building2, Shield, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PartnerProfile {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  phone: string | null;
  tax_number: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  logo_url: string | null;
}

export default function MagazaAyarlarPage() {
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    tax_number: "",
    city: "",
    district: "",
    address: "",
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    website: "",
    description: "",
    phone: "",
  });

  useEffect(() => {
    async function loadPartner() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      setToken(session.access_token);

      try {
        const res = await fetch("/api/magaza/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const p: PartnerProfile = data.partner;
          setPartner(p);
          setCompanyForm({
            name: p.name ?? "",
            tax_number: p.tax_number ?? "",
            city: p.city ?? "",
            district: p.district ?? "",
            address: p.address ?? "",
          });
          setStoreForm({
            name: p.name ?? "",
            website: p.website ?? "",
            description: p.description ?? "",
            phone: p.phone ?? "",
          });
        }
      } catch {
        // Ağ hatası — boş form ile devam et
      } finally {
        setLoading(false);
      }
    }

    loadPartner();
  }, []);

  const handleSave = useCallback(async (data: Partial<PartnerProfile>) => {
    if (!token) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/magaza/ayarlar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setPartner(result.partner);
        setMessage({ type: "success", text: "Bilgiler başarıyla güncellendi." });
      } else {
        setMessage({ type: "error", text: "Güncelleme sırasında bir hata oluştu." });
      }
    } catch {
      setMessage({ type: "error", text: "Bağlantı hatası. Lütfen tekrar deneyin." });
    } finally {
      setSaving(false);
    }
  }, [token]);

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
          <Building2 size={20} color="var(--fg)" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>Firma Bilgileri</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Şirket / Mağaza Unvanı</label>
            <input
              type="text"
              value={companyForm.name}
              onChange={(e) => setCompanyForm(f => ({ ...f, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Vergi Numarası</label>
            <input
              type="text"
              value={companyForm.tax_number}
              onChange={(e) => setCompanyForm(f => ({ ...f, tax_number: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Şehir</label>
            <input
              type="text"
              value={companyForm.city}
              onChange={(e) => setCompanyForm(f => ({ ...f, city: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>İlçe</label>
            <input
              type="text"
              value={companyForm.district}
              onChange={(e) => setCompanyForm(f => ({ ...f, district: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Adres</label>
            <input
              type="text"
              value={companyForm.address}
              onChange={(e) => setCompanyForm(f => ({ ...f, address: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => handleSave(companyForm)}
              disabled={saving}
              style={{ padding: "10px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Kaydediliyor..." : "Firma Bilgilerini Kaydet"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <Store size={20} color="var(--fg)" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>Mağaza Vitrini</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "8px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "12px", backgroundColor: "var(--muted-bg)", border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {partner?.logo_url ? (
                <img src={partner.logo_url} alt={partner.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--muted-fg)" }}>
                  {(storeForm.name || "M")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)", marginBottom: "4px" }}>Mağaza Logosu</div>
              <div style={{ fontSize: "12px", color: "var(--muted-fg)", marginBottom: "12px" }}>Tavsiye edilen boyut: 400x400px (PNG, JPG)</div>
              <button type="button" style={{ padding: "6px 14px", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", fontWeight: 600, color: "var(--fg)", cursor: "pointer" }}>
                <Upload size={14} /> Yeni Logo Yükle
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Mağaza Adı</label>
              <input
                type="text"
                value={storeForm.name}
                onChange={(e) => setStoreForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Telefon</label>
              <input
                type="tel"
                value={storeForm.phone}
                onChange={(e) => setStoreForm(f => ({ ...f, phone: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Website Adresi</label>
              <input
                type="url"
                value={storeForm.website}
                onChange={(e) => setStoreForm(f => ({ ...f, website: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Kısa Açıklama</label>
              <textarea
                rows={3}
                value={storeForm.description}
                onChange={(e) => setStoreForm(f => ({ ...f, description: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)", resize: "vertical" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => handleSave(storeForm)}
              disabled={saving}
              style={{ padding: "10px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Kaydediliyor..." : "Vitrin Ayarlarını Kaydet"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <Shield size={20} color="var(--fg)" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>Hesap Güvenliği</h2>
        </div>
        <form onSubmit={handlePasswordUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Yeni Şifre</label>
            <input name="new_password" type="password" placeholder="••••••••" minLength={6} required style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Yeni Şifre (Tekrar)</label>
            <input name="confirm_password" type="password" placeholder="••••••••" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }} />
          </div>
          <div>
            <button type="submit" disabled={saving} style={{ padding: "10px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
