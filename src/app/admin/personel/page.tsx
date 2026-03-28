"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCog, Plus, Pencil, Trash2, ShieldCheck, UserCheck, Eye, EyeOff } from "lucide-react";
import {
  PageHeader, Badge, SearchInput, LoadingSpinner,
  DataTable, AvatarInitials, IconBtn, KpiCard, Toast,
} from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { StaffListItem, StaffListResponse, CreateStaffBody, AdminRole } from "@/types/admin";

const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: "#dc2626",
  ADMIN:       "#d97706",
  MODERATOR:   "#6366f1",
  EDITOR:      "#7c3aed",
  VIEWER:      "#94a3b8",
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
      <div className="flex items-center gap-2.5">
        <AvatarInitials name={s.display_name} color={color} size={36} />
        <div>
          <div className="font-semibold text-foreground text-[13.5px]">{s.display_name}</div>
          <div className="text-[11.5px] text-muted-foreground">{s.user.email}</div>
        </div>
      </div>,
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
        style={{ background: color + "18", borderColor: color + "30", color }}
      >
        <ShieldCheck size={12} />
        {ROLE_LABELS[s.role]}
      </span>,
      <Badge variant={s.is_active ? "green" : "gray"}>{s.is_active ? "Aktif" : "Pasif"}</Badge>,
      <div className="text-xs text-muted-foreground">
        <span>{s._count.audit_logs} işlem</span>
        <span className="mx-1.5 text-border">·</span>
        <span>{s._count.resolved_reports} rapor</span>
      </div>,
      <span className="text-xs text-muted-foreground">
        {s.last_login
          ? new Date(s.last_login).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
          : "Hiç giriş yok"}
      </span>,
      <div className="flex gap-1.5">
        <IconBtn icon={s.is_active ? EyeOff : Eye} color={s.is_active ? "#d97706" : "#16a34a"} title={s.is_active ? "Pasifleştir" : "Aktifleştir"} onClick={() => handleToggleActive(s.id, s.is_active)} />
        <IconBtn icon={Pencil} color="#6366f1" title="Düzenle" onClick={() => setEditing({ ...s })} />
        <IconBtn icon={Trash2} color="#dc2626" title="Sil" onClick={() => handleDelete(s.id, s.display_name)} />
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

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personel Düzenle</DialogTitle>
            <DialogDescription>Personelin görünen adını ve rolünü güncelleyin.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">Görünen Ad</Label>
                <Input value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">Rol</Label>
                <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as AdminRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>İptal</Button>
            <Button disabled={saving} onClick={handleEdit}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Toplam Personel",    value: staff.length,                                                               colorClass: "text-admin-accent bg-admin-accent/10", icon: UserCog },
          { label: "Aktif",              value: staff.filter((s) => s.is_active).length,                                   colorClass: "text-emerald-600 bg-emerald-50",         icon: UserCheck },
          { label: "Admin / Süper Admin", value: staff.filter((s) => s.role === "ADMIN" || s.role === "SUPER_ADMIN").length, colorClass: "text-amber-600 bg-amber-50",            icon: ShieldCheck },
        ].map((st, i) => (
          <KpiCard key={i} label={st.label} value={st.value} icon={<st.icon size={18} strokeWidth={1.8} />} colorClass={st.colorClass} />
        ))}
      </div>

      {adding && (
        <Card className="p-5 mb-5 border-admin-accent-border">
          <div className="font-semibold text-foreground mb-4 text-sm">Yeni Personel Ekle</div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Kullanıcı ID</Label>
              <Input placeholder="UUID" value={form.user_id} onChange={(e) => setForm((v) => ({ ...v, user_id: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Görünen Ad</Label>
              <Input placeholder="örn. Ahmet Y." value={form.display_name} onChange={(e) => setForm((v) => ({ ...v, display_name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm((prev) => ({ ...prev, role: v as AdminRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button disabled={saving} onClick={handleSave} className="whitespace-nowrap">
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-5">
          <SearchInput value={search} onChange={setSearch} placeholder="İsim veya e-posta ara…" />
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Personel bulunamadı" />}
      </Card>
    </>
  );
}
