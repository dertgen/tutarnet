"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Pencil, Trash2, Globe } from "lucide-react";
import {
  PageHeader, Badge, SearchInput, LoadingSpinner,
  DataTable, IconBtn, MetricCard, Toast,
} from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
        <div className="font-semibold text-foreground text-[13.5px]">{p.title}</div>
        {p.excerpt && (
          <div className="text-[11.5px] text-muted-foreground mt-0.5 max-w-[220px] truncate">
            {p.excerpt}
          </div>
        )}
      </div>,
      <span className="text-xs text-admin-accent font-mono">/{p.slug}</span>,
      <Badge variant={st.variant} dot>{st.label}</Badge>,
      <span className="text-xs text-muted-foreground">
        {p.published_at ? new Date(p.published_at).toLocaleDateString("tr-TR") : "—"}
      </span>,
      <span className="text-xs text-muted-foreground">
        {new Date(p.updated_at).toLocaleDateString("tr-TR")}
      </span>,
      <div className="flex gap-1.5">
        {p.status === "PUBLISHED" && (
          <IconBtn icon={Globe} color="#16a34a" title="Sayfayı Gör" onClick={() => window.open(`/${p.slug}`, "_blank")} />
        )}
        <IconBtn icon={Pencil} color="#6366f1" title="Düzenle" onClick={() => setEditing(p)} />
        <IconBtn icon={Trash2} color="#dc2626" title="Sil" onClick={() => handleDelete(p.id, p.title)} />
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

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sayfa Düzenle</DialogTitle>
            <DialogDescription>Sayfa başlığını, durumunu ve özetini güncelleyin.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">Başlık</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">Durum</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as PageStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Taslak</SelectItem>
                    <SelectItem value="PUBLISHED">Yayında</SelectItem>
                    <SelectItem value="ARCHIVED">Arşivde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">Özet</Label>
                <Textarea className="min-h-[72px] resize-y" value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Toplam Sayfa", value: pages.length,                                        colorClass: "text-admin-accent" },
          { label: "Yayında",      value: pages.filter((p) => p.status === "PUBLISHED").length, colorClass: "text-emerald-600" },
          { label: "Taslak",       value: pages.filter((p) => p.status === "DRAFT").length,     colorClass: "text-amber-600" },
          { label: "Arşiv",        value: pages.filter((p) => p.status === "ARCHIVED").length,  colorClass: "text-muted-foreground" },
        ].map((s, i) => (
          <MetricCard key={i} label={s.label} value={s.value} colorClass={s.colorClass} />
        ))}
      </div>

      {adding && (
        <Card className="p-5 mb-5 border-admin-accent-border">
          <div className="font-semibold text-foreground mb-4 text-sm">Yeni Sayfa Oluştur</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Başlık *</Label>
              <Input placeholder="Sayfa başlığı" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">URL Yolu (slug)</Label>
              <Input placeholder="hakkimizda" value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Durum</Label>
              <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v as PageStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="PUBLISHED">Yayınla</SelectItem>
                  <SelectItem value="ARCHIVED">Arşivle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <Label className="text-muted-foreground">Özet</Label>
            <Textarea className="min-h-[72px] resize-y" placeholder="Kısa açıklama…" value={form.excerpt} onChange={(e) => setForm((v) => ({ ...v, excerpt: e.target.value }))} />
          </div>
          <div className="mt-3 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setAdding(false)}>İptal</Button>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? "Oluşturuluyor…" : "Oluştur"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex gap-0.5 p-1 bg-muted border border-border rounded-lg">
            {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => {
              const labels: Record<string, string> = { ALL: "Tümü", PUBLISHED: "Yayında", DRAFT: "Taslak", ARCHIVED: "Arşiv" };
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-md text-[13px] cursor-pointer border-none transition-all ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </div>
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Sayfa ara…" />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Sayfa bulunamadı" />}
      </Card>
    </>
  );
}
