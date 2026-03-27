"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Pencil, Trash2, Globe } from "lucide-react";
import {
  PageHeader, AdminCard, Badge, SearchInput, LoadingSpinner,
  DataTable, IconBtn, Toast, T,
} from "@/components/admin/ui";
import type { PageItem, PagesListResponse, CreatePageBody, PageStatus } from "@/types/admin";

const STATUS_MAP: Record<PageStatus, { label: string; variant: "green" | "yellow" | "gray" }> = {
  PUBLISHED: { label: "Yayında",    variant: "green" },
  DRAFT:     { label: "Taslak",     variant: "yellow" },
  ARCHIVED:  { label: "Arşivlendi", variant: "gray" },
};

const COLS = [
  { key: "sayfa",       label: "Sayfa" },
  { key: "slug",        label: "URL Yolu" },
  { key: "durum",       label: "Durum" },
  { key: "yayinlanma",  label: "Yayın Tarihi" },
  { key: "guncelleme",  label: "Son Güncelleme" },
  { key: "islem",       label: "", width: "90px" },
];

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "#ffffff",
  border: `1px solid ${T.border}`,
  borderRadius: "10px", color: T.textPrimary,
  fontSize: "14px", outline: "none",
};

export default function IcerikPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PageStatus | "ALL">("ALL");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<{ title: string; slug: string; excerpt: string; status: PageStatus }>({
    title: "", slug: "", excerpt: "", status: "DRAFT",
  });

  const showToast = (ok: boolean, text: string) => { setToast({ ok, text }); setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter !== "ALL") p.set("status", statusFilter);
      if (search) p.set("search", search);
      const res = await fetch(`/api/admin/sayfalar?${p}`);
      const data: PagesListResponse = await res.json();
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" sayfasını silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/sayfalar/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else { const d = await res.json(); showToast(false, d.error ?? "Silinemedi"); }
  };

  const handleEdit = async () => {
    if (!editing || !editing.title.trim()) { showToast(false, "Başlık zorunludur."); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/sayfalar/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editing.title, excerpt: editing.excerpt, status: editing.status }),
    });
    setSaving(false);
    if (res.ok) { setEditing(null); showToast(true, "Sayfa güncellendi."); load(); }
    else { const d = await res.json(); showToast(false, d.error ?? "Güncellenemedi"); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast(false, "Sayfa başlığı zorunludur."); return; }
    setSaving(true);
    const body: CreatePageBody = {
      title: form.title, slug: form.slug || undefined,
      content: "", excerpt: form.excerpt || undefined, status: form.status,
    };
    const res = await fetch("/api/admin/sayfalar", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ title: "", slug: "", excerpt: "", status: "DRAFT" });
      setAdding(false);
      showToast(true, "Sayfa oluşturuldu.");
      load();
    } else { const d = await res.json(); showToast(false, d.error ?? "Oluşturulamadı"); }
  };

  const filtered = search
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()))
    : pages;

  const rows = filtered.map((p) => {
    const st = STATUS_MAP[p.status];
    return [
      <div>
        <div style={{ fontWeight: 600, color: T.textPrimary, fontSize: "13.5px" }}>{p.title}</div>
        {p.excerpt && (
          <div style={{ fontSize: "11.5px", color: T.textMuted, marginTop: "2px", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.excerpt}
          </div>
        )}
      </div>,
      <span style={{ fontSize: "12px", color: T.accent, fontFamily: "monospace" }}>/{p.slug}</span>,
      <Badge variant={st.variant} dot>{st.label}</Badge>,
      <span style={{ fontSize: "12px", color: T.textMuted }}>
        {p.published_at ? new Date(p.published_at).toLocaleDateString("tr-TR") : "—"}
      </span>,
      <span style={{ fontSize: "12px", color: T.textMuted }}>
        {new Date(p.updated_at).toLocaleDateString("tr-TR")}
      </span>,
      <div style={{ display: "flex", gap: "5px" }}>
        {p.status === "PUBLISHED" && (
          <IconBtn icon={Globe} color={T.success} title="Sayfayı Gör" onClick={() => window.open(`/${p.slug}`, "_blank")} />
        )}
        <IconBtn icon={Pencil} color={T.accent} title="Düzenle" onClick={() => setEditing(p)} />
        <IconBtn icon={Trash2} color={T.danger} title="Sil" onClick={() => handleDelete(p.id, p.title)} />
      </div>,
    ];
  });

  return (
    <>
      <PageHeader
        title="İçerik Sayfaları"
        description="Statik sayfaları (hakkında, SSS, gizlilik vb.) oluşturun ve düzenleyin"
        actions={[{ label: "Yeni Sayfa", icon: Plus, variant: "primary", onClick: () => setAdding((v) => !v) }]}
      />

      {toast && <Toast ok={toast.ok} text={toast.text} />}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "500px", maxWidth: "90vw", boxShadow: T.shadowLg }}>
            <div style={{ fontWeight: 700, fontSize: "16px", color: T.textPrimary, marginBottom: "20px" }}>Sayfa Düzenle</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Başlık</label>
                <input style={inp} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Durum</label>
                <select style={{ ...inp, cursor: "pointer" }} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as PageStatus })}>
                  <option value="DRAFT">Taslak</option>
                  <option value="PUBLISHED">Yayında</option>
                  <option value="ARCHIVED">Arşivde</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Özet</label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: "72px" }} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setEditing(null)} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "10px", color: T.textSecondary, fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>İptal</button>
              <button disabled={saving} onClick={handleEdit} style={{ padding: "10px 24px", background: T.accent, border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Toplam Sayfa", value: pages.length,                                   color: T.accent,    bg: T.accentDim },
          { label: "Yayında",      value: pages.filter((p) => p.status === "PUBLISHED").length, color: T.success, bg: T.successDim },
          { label: "Taslak",       value: pages.filter((p) => p.status === "DRAFT").length,     color: T.warning, bg: T.warningDim },
          { label: "Arşiv",        value: pages.filter((p) => p.status === "ARCHIVED").length,  color: T.textMuted, bg: "rgba(139,152,184,0.08)" },
        ].map((s, i) => (
          <AdminCard key={i} style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, letterSpacing: "-0.4px" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "4px" }}>{s.label}</div>
          </AdminCard>
        ))}
      </div>

      {adding && (
        <AdminCard style={{ marginBottom: "20px", border: `1px solid ${T.accentBorder}` }}>
          <div style={{ fontWeight: 600, color: T.textPrimary, marginBottom: "16px", fontSize: "14px" }}>Yeni Sayfa Oluştur</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Başlık *</label>
              <input style={inp} placeholder="Sayfa başlığı" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>URL Yolu (slug)</label>
              <input style={inp} placeholder="hakkimizda" value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Durum</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as PageStatus }))}>
                <option value="DRAFT">Taslak</option>
                <option value="PUBLISHED">Yayınla</option>
                <option value="ARCHIVED">Arşivle</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Özet</label>
            <textarea style={{ ...inp, resize: "vertical", minHeight: "72px" }} placeholder="Kısa açıklama…" value={form.excerpt} onChange={(e) => setForm((v) => ({ ...v, excerpt: e.target.value }))} />
          </div>
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button onClick={() => setAdding(false)} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "10px", color: T.textSecondary, fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>İptal</button>
            <button disabled={saving} onClick={handleSave} style={{ padding: "10px 24px", background: T.accent, border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
              {saving ? "Oluşturuluyor…" : "Oluştur"}
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard style={{ padding: "20px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "2px", padding: "4px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px" }}>
            {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => {
              const labels: Record<string, string> = { ALL: "Tümü", PUBLISHED: "Yayında", DRAFT: "Taslak", ARCHIVED: "Arşiv" };
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "7px 14px", borderRadius: "7px", fontSize: "13px", fontWeight: statusFilter === s ? 600 : 400, cursor: "pointer", border: "none", background: statusFilter === s ? T.accent : "transparent", color: statusFilter === s ? "#fff" : T.textSecondary, transition: "all 0.18s" }}>
                  {labels[s]}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Sayfa ara…" />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Sayfa bulunamadı" />}
      </AdminCard>
    </>
  );
}
