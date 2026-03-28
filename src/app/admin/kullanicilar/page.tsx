"use client";

import { useState, useEffect } from "react";
import { Users, ShieldCheck, UserCheck, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, Badge, FilterTabs, SearchInput,
  DataTable, LoadingSpinner, AvatarInitials, IconBtn, Pagination,
} from "@/components/admin/ui";
import type { UserAdminView, UsersListResponse } from "@/types/admin";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

function getRoleInfo(u: UserAdminView): { label: string; variant: "green" | "purple" | "gray" } {
  if (u.is_admin && u.admin_staff) return { label: u.admin_staff.role.replace("_", " "), variant: "green" };
  if (u.partner) return { label: "Partner", variant: "purple" };
  return { label: "Kullanıcı", variant: "gray" };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<UserAdminView | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; phone: string; is_admin: boolean }>({ name: "", phone: "", is_admin: false });
  const [saving, setSaving] = useState(false);
  
  // Alert Dialog State
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      if (activeTab !== "ALL") p.set("role", activeTab.toLowerCase());
      if (search) p.set("search", search);
      const res = await fetch(`/api/admin/kullanicilar?${p}`);
      const data: UsersListResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab, search, page]);

  const openEdit = (u: UserAdminView) => {
    setEditing(u);
    setEditForm({ name: u.name ?? "", phone: u.phone ?? "", is_admin: u.is_admin });
  };

  const handleEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/kullanicilar/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, phone: editForm.phone, is_admin: editForm.is_admin }),
      });
      if (res.ok) { 
        setEditing(null); 
        toast.success("Kullanıcı güncellendi."); 
        load(); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error ?? "Güncellenemedi"); 
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/admin/kullanicilar/${userToDelete.id}`, { method: "DELETE" });
      if (res.ok) { 
        toast.success("Kullanıcı devre dışı bırakıldı."); 
        load(); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error ?? "İşlem başarısız"); 
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setUserToDelete(null);
    }
  };

  const adminCount   = users.filter((u) => u.is_admin).length;
  const partnerCount = users.filter((u) => u.partner).length;

  const COLS = [
    { key: "user",     label: "Kullanıcı" },
    { key: "rol",      label: "Rol" },
    { key: "aktivite", label: "Aktivite" },
    { key: "tarih",    label: "Kayıt Tarihi" },
    { key: "islem",    label: "", width: "80px" },
  ];

  const rows = users.map((u) => {
    const role = getRoleInfo(u);
    return [
      <div className="flex items-center gap-2.5">
        <AvatarInitials
          name={u.name ?? u.email}
          color={u.is_admin ? "var(--color-admin-accent)" : u.partner ? "#8b5cf6" : "#cbd5e1"}
          size={36}
        />
        <div>
          <div className="font-semibold text-foreground text-[13.5px]">{u.name ?? "—"}</div>
          <div className="text-[11.5px] text-muted-foreground">{u.email}</div>
        </div>
      </div>,
      <Badge variant={role.variant}>{role.label}</Badge>,
      <div className="text-xs text-muted-foreground">
        <span>{u._count.appointments} randevu</span>
        <span className="mx-1.5 text-border">·</span>
        <span>{u._count.reviews} yorum</span>
      </div>,
      <span className="text-[12.5px] text-muted-foreground">
        {new Date(u.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
      </span>,
      <div className="flex gap-1.5 justify-end">
        <IconBtn icon={Pencil} color="#f59e0b" title="Düzenle" onClick={() => openEdit(u)} />
        <IconBtn icon={Trash2} color="#f43f5e" title="Devre Dışı Bırak" onClick={() => setUserToDelete({ id: u.id, name: u.name ?? u.email })} />
      </div>,
    ];
  });

  return (
    <>
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Platform kullanıcılarını gerçek zamanlı görüntüleyin ve yönetin"
      />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input 
                id="name" 
                value={editForm.name} 
                onChange={(e) => setEditForm((v) => ({ ...v, name: e.target.value }))} 
                placeholder="Ad Soyad" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                value={editForm.phone} 
                onChange={(e) => setEditForm((v) => ({ ...v, phone: e.target.value }))} 
                placeholder="+90 500 000 0000" 
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted border rounded-lg mt-2">
              <Switch 
                id="is_admin_toggle" 
                checked={editForm.is_admin} 
                onCheckedChange={(checked) => setEditForm((v) => ({ ...v, is_admin: checked }))} 
                className="data-[state=checked]:bg-admin-accent"
              />
              <Label htmlFor="is_admin_toggle" className="text-[13px] cursor-pointer cursor-pointer select-none">
                Admin yetkisi ver
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>İptal</Button>
            <Button disabled={saving} onClick={handleEdit} className="bg-admin-accent hover:bg-admin-accent/90">
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Devre Dışı Bırak</AlertDialogTitle>
            <AlertDialogDescription>
              "{userToDelete?.name || "Bu kullanıcı"}" hesabını devre dışı bırakmak istediğinize emin misiniz? Bu işlem geri alınabilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Devre Dışı Bırak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Toplam Kullanıcı", value: total,        className: "text-admin-accent bg-admin-accent/10", icon: Users },
          { label: "Admin / Personel", value: adminCount,   className: "text-amber-500 bg-amber-500/10", icon: ShieldCheck },
          { label: "Partner",          value: partnerCount, className: "text-purple-500 bg-purple-500/10", icon: UserCheck },
        ].map((s, i) => (
          <Card key={i} className="p-5 flex items-center gap-4 border-border shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.className}`}>
              <s.icon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className={`text-2xl font-extrabold tracking-tight mb-0.5 ${s.className.split(" ")[0]}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 shadow-sm border-admin-border">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs
            tabs={[
              { key: "ALL",     label: "Tümü",      count: total },
              { key: "admin",   label: "Adminler",  count: adminCount },
              { key: "partner", label: "Partner", count: partnerCount },
            ]}
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPage(1); }}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="İsim veya e-posta ara…" />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Kullanıcı bulunamadı" />}
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </Card>
    </>
  );
}
