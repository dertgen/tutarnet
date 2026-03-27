"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCog, Plus, Pencil, Trash2, ShieldCheck, UserCheck, Eye, EyeOff } from "lucide-react";
import {
  PageHeader, AdminCard, Badge, SearchInput, LoadingSpinner,
  DataTable, AvatarInitials, IconBtn, Toast, T,
} from "@/components/admin/ui";
import type { StaffListItem, StaffListResponse, CreateStaffBody, AdminRole } from "@/types/admin";

const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: T.danger,
  ADMIN:       T.warning,
  MODERATOR:   T.accent,
  EDITOR:      T.purple,
  VIEWER:      T.textMuted,
};

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Süper Admin",
  ADMIN:       "Admin",
  MODERATOR:   "Moderatör",
  EDITOR:      "Editör",
  VIEWER:      "İzleyici",
};

const COLS = [
  { key: "personel",   label: "Personel" },
  { key: "rol",        label: "Rol" },
  { key: "durum",      label: "Durum" },
  { key: "istatistik", label: "İstatistik" },
  { key: "son_giris",  label: "Son Giriş" },
  { key: "islem",      label: "", width: "80px" },
];

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "#ffffff",
  border: `1px solid ${T.border}`,
  borderRadius: "10px", color: T.textPrimary,
  fontSize: "14px", outline: "none",
};

export default function PersonelPage() {
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<StaffListItem | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<{ user_id: string; role: AdminRole; display_name: string }>({
    user_id: "", role: "MODERATOR", display_name: "",
  });

  const showToast = (ok: boolean, text: string) => { setToast({ ok, text }); setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/personel");
      const data: StaffListResponse = await res.json();
      setStaff(data.staff);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/personel/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    if (res.ok) load();
    else showToast(false, "Durum güncellenemedi");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" personelini sistemden çıkarmak istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/personel/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else { const d = await res.json(); showToast(false, d.error ?? "Silinemedi"); }
  };

  const handleSave = async () => {
    if (!form.user_id.trim() || !form.display_name.trim()) {
      showToast(false, "Kullanıcı ID ve görünen ad zorunludur.");
      return;
    }
    setSaving(true);
    const body: CreateStaffBody = { user_id: form.user_id, role: form.role, display_name: form.display_name };
    const res = await fetch("/api/admin/personel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ user_id: "", role: "MODERATOR", display_name: "" });
      setAdding(false);
      showToast(true, "Personel eklendi.");
      load();
    } else {
      const d = await res.json();
      showToast(false, d.error ?? "Eklenemedi");
    }
  };

  const handleEdit = async () => {
    if (!editing || !editing.display_name.trim()) {
      showToast(false, "Görünen ad zorunludur.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/personel/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editing.role, display_name: editing.display_name }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      showToast(true, "Personel güncellendi.");
      load();
    } else {
      const d = await res.json();
      showToast(false, d.error ?? "Güncellenemedi");
    }
  };

  const filtered = search
    ? staff.filter((s) => s.display_name.toLowerCase().includes(search.toLowerCase()) || s.user.email.toLowerCase().includes(search.toLowerCase()))
    : staff;

  const rows = filtered.map((s) => {
    const color = ROLE_COLORS[s.role];
    return [
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <AvatarInitials name={s.display_name} color={color} size={36} />
        <div>
          <div style={{ fontWeight: 600, color: T.textPrimary, fontSize: "13.5px" }}>{s.display_name}</div>
          <div style={{ fontSize: "11.5px", color: T.textMuted }}>{s.user.email}</div>
        </div>
      </div>,
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", background: color + "18", border: `1px solid ${color}30`, fontSize: "12px", fontWeight: 600, color }}>
        <ShieldCheck size={12} />
        {ROLE_LABELS[s.role]}
      </span>,
      <Badge variant={s.is_active ? "green" : "gray"}>{s.is_active ? "Aktif" : "Pasif"}</Badge>,
      <div style={{ fontSize: "12px", color: T.textMuted }}>
        <span>{s._count.audit_logs} işlem</span>
        <span style={{ margin: "0 5px", color: T.divider }}>·</span>
        <span>{s._count.resolved_reports} rapor</span>
      </div>,
      <span style={{ fontSize: "12px", color: T.textMuted }}>
        {s.last_login
          ? new Date(s.last_login).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
          : "Hiç giriş yok"}
      </span>,
      <div style={{ display: "flex", gap: "5px" }}>
        <IconBtn icon={s.is_active ? EyeOff : Eye} color={s.is_active ? T.warning : T.success} title={s.is_active ? "Pasifleştir" : "Aktifleştir"} onClick={() => handleToggleActive(s.id, s.is_active)} />
        <IconBtn icon={Pencil} color={T.accent} title="Düzenle" onClick={() => setEditing({ ...s })} />
        <IconBtn icon={Trash2} color={T.danger} title="Sil" onClick={() => handleDelete(s.id, s.display_name)} />
      </div>,
    ];
  });

  return (
    <>
      <PageHeader
        title="Personel Yönetimi"
        description="Admin çalışanlarını ekleyin, rollerini düzenleyin ve erişimlerini yönetin"
        actions={[{ label: "Yeni Personel", icon: Plus, variant: "primary", onClick: () => setAdding((v) => !v) }]}
      />

      {toast && <Toast ok={toast.ok} text={toast.text} />}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "90vw", boxShadow: T.shadowLg }}>
            <div style={{ fontWeight: 700, fontSize: "16px", color: T.textPrimary, marginBottom: "20px" }}>Personel Düzenle</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Görünen Ad</label>
                <input style={inp} value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Rol</label>
                <select style={{ ...inp, cursor: "pointer" }} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as AdminRole })}>
                  {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
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
          { label: "Toplam Personel",       value: staff.length,                                                                          color: T.accent,  bg: T.accentDim,  icon: UserCog },
          { label: "Aktif",                  value: staff.filter((s) => s.is_active).length,                                             color: T.success, bg: T.successDim, icon: UserCheck },
          { label: "Admin / Süper Admin",    value: staff.filter((s) => s.role === "ADMIN" || s.role === "SUPER_ADMIN").length,           color: T.warning, bg: T.warningDim, icon: ShieldCheck },
        ].map((st, i) => (
          <AdminCard key={i} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: st.bg, border: `1px solid ${st.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <st.icon size={18} color={st.color} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: st.color, letterSpacing: "-0.4px" }}>{st.value}</div>
              <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "2px" }}>{st.label}</div>
            </div>
          </AdminCard>
        ))}
      </div>

      {adding && (
        <AdminCard style={{ marginBottom: "20px", border: `1px solid ${T.accentBorder}` }}>
          <div style={{ fontWeight: 600, color: T.textPrimary, marginBottom: "16px", fontSize: "14px" }}>Yeni Personel Ekle</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Kullanıcı ID</label>
              <input style={inp} placeholder="UUID" value={form.user_id} onChange={(e) => setForm((v) => ({ ...v, user_id: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Görünen Ad</label>
              <input style={inp} placeholder="örn. Ahmet Y." value={form.display_name} onChange={(e) => setForm((v) => ({ ...v, display_name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", display: "block" }}>Rol</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value as AdminRole }))}>
                {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <button disabled={saving} onClick={handleSave} style={{ padding: "10px 20px", background: T.accent, border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <SearchInput value={search} onChange={setSearch} placeholder="İsim veya e-posta ara…" />
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Personel bulunamadı" />}
      </AdminCard>
    </>
  );
}
