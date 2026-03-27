"use client";

import { useState, useEffect, useCallback } from "react";
import { Image, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import {
  PageHeader, AdminCard, Badge, LoadingSpinner, DataTable, IconBtn, Toast, T,
} from "@/components/admin/ui";
import type { BannerItem, BannersListResponse, CreateBannerBody, BannerPlacement } from "@/types/admin";

const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  HOME:           "Ana Sayfa",
  CATEGORY:       "Kategori",
  SEARCH:         "Arama",
  PARTNER_DETAIL: "Partner Detay",
  ALL:            "Her Yer",
};

const COLS = [
  { key: "banner",  label: "Banner" },
  { key: "konum",   label: "Konum" },
  { key: "oncelik", label: "Öncelik" },
  { key: "sure",    label: "Süre" },
  { key: "durum",   label: "Durum" },
  { key: "islem",   label: "", width: "100px" },
];

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "#ffffff",
  border: `1px solid ${T.border}`,
  borderRadius: "10px", color: T.textPrimary,
  fontSize: "14px", outline: "none",
};

export default function BannerlarPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<{
    title: string; subtitle: string; image_url: string;
    link_url: string; link_text: string; placement: BannerPlacement; priority: string;
  }>({ title: "", subtitle: "", image_url: "", link_url: "", link_text: "", placement: "HOME", priority: "0" });

  const showToast = (ok: boolean, text: string) => { setToast({ ok, text }); setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bannerlar");
      const data: BannersListResponse = await res.json();
      setBanners(data.banners);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/bannerlar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    if (res.ok) load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" bannerını silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/bannerlar/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else { const d = await res.json(); showToast(false, d.error ?? "Silinemedi"); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast(false, "Banner başlığı zorunludur."); return; }
    setSaving(true);
    const body: CreateBannerBody = {
      title: form.title, subtitle: form.subtitle || undefined,
      image_url: form.image_url || undefined, link_url: form.link_url || undefined,
      link_text: form.link_text || undefined, placement: form.placement,
      priority: parseInt(form.priority, 10) || 0,
    };
    const res = await fetch("/api/admin/bannerlar", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ title: "", subtitle: "", image_url: "", link_url: "", link_text: "", placement: "HOME", priority: "0" });
      setAdding(false);
      showToast(true, "Banner eklendi.");
      load();
    } else { const d = await res.json(); showToast(false, d.error ?? "Eklenemedi"); }
  };

  const rows = banners.map((b) => [
    <div>
      <div style={{ fontWeight: 600, color: T.textPrimary, fontSize: "13.5px" }}>{b.title}</div>
      {b.subtitle && <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "2px" }}>{b.subtitle}</div>}
      {b.link_url && (
        <div style={{ fontSize: "11px", color: T.accent, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
          {b.link_url}
        </div>
      )}
    </div>,
    <span style={{ fontSize: "12.5px", color: T.textSecondary }}>{PLACEMENT_LABELS[b.placement] ?? b.placement}</span>,
    <span style={{ fontSize: "13px", fontWeight: 600, color: T.accent }}>{b.priority}</span>,
    <div style={{ fontSize: "11.5px", color: T.textMuted }}>
      {b.start_at ? <div>Başl: {new Date(b.start_at).toLocaleDateString("tr-TR")}</div> : null}
      {b.end_at ? <div>Bitiş: {new Date(b.end_at).toLocaleDateString("tr-TR")}</div> : <div>Süresiz</div>}
    </div>,
    <Badge variant={b.is_active ? "green" : "gray"} dot>{b.is_active ? "Aktif" : "Pasif"}</Badge>,
    <div style={{ display: "flex", gap: "5px" }}>
      <IconBtn icon={b.is_active ? EyeOff : Eye} color={b.is_active ? T.warning : T.success} title={b.is_active ? "Pasifleştir" : "Aktifleştir"} onClick={() => handleToggle(b.id, b.is_active)} />
      <IconBtn icon={Trash2} color={T.danger} title="Sil" onClick={() => handleDelete(b.id, b.title)} />
    </div>,
  ]);

  return (
    <>
      <PageHeader
        title="Banner Yönetimi"
        description="Site genelindeki banner ve görselleri ekleyin, düzenleyin"
        actions={[{ label: "Yeni Banner", icon: Plus, variant: "primary", onClick: () => setAdding((v) => !v) }]}
      />

      {toast && <Toast ok={toast.ok} text={toast.text} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Toplam", value: banners.length,                         color: T.accent,  bg: T.accentDim },
          { label: "Aktif",  value: banners.filter((b) => b.is_active).length,  color: T.success, bg: T.successDim },
          { label: "Pasif",  value: banners.filter((b) => !b.is_active).length, color: T.textMuted, bg: "rgba(139,152,184,0.08)" },
        ].map((s, i) => (
          <AdminCard key={i} style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, letterSpacing: "-0.4px" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "4px" }}>{s.label}</div>
          </AdminCard>
        ))}
      </div>

      {adding && (
        <AdminCard style={{ marginBottom: "20px", border: `1px solid ${T.accentBorder}` }}>
          <div style={{ fontWeight: 600, color: T.textPrimary, marginBottom: "16px", fontSize: "14px" }}>Yeni Banner Ekle</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "Başlık *",    key: "title",     placeholder: "Banner başlığı" },
              { label: "Alt Başlık",  key: "subtitle",  placeholder: "İsteğe bağlı" },
              { label: "Görsel URL",  key: "image_url", placeholder: "https://…" },
              { label: "Bağlantı URL", key: "link_url", placeholder: "https://…" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>{label}</label>
                <input style={inp} placeholder={placeholder} value={(form as Record<string, string>)[key]} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Konum</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.placement} onChange={(e) => setForm((v) => ({ ...v, placement: e.target.value as BannerPlacement }))}>
                {(Object.entries(PLACEMENT_LABELS) as [BannerPlacement, string][]).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Öncelik (0-100)</label>
              <input style={inp} type="number" min={0} max={100} value={form.priority} onChange={(e) => setForm((v) => ({ ...v, priority: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button onClick={() => setAdding(false)} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "10px", color: T.textSecondary, fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>İptal</button>
            <button disabled={saving} onClick={handleSave} style={{ padding: "10px 24px", background: T.accent, border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard style={{ padding: "20px" }}>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Banner bulunamadı" />}
      </AdminCard>
    </>
  );
}
