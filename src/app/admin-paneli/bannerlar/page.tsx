"use client";

import { useState, useEffect, useCallback } from "react";
import { Image, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import {
  PageHeader, Badge, LoadingSpinner, DataTable, IconBtn, MetricCard, Toast,
} from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      <div className="font-semibold text-foreground text-[13.5px]">{b.title}</div>
      {b.subtitle && <div className="text-xs text-muted-foreground mt-0.5">{b.subtitle}</div>}
      {b.link_url && (
        <div className="text-[11px] text-admin-accent mt-0.5 max-w-[200px] truncate">
          {b.link_url}
        </div>
      )}
    </div>,
    <span className="text-[12.5px] text-muted-foreground">{PLACEMENT_LABELS[b.placement] ?? b.placement}</span>,
    <span className="text-[13px] font-semibold text-admin-accent">{b.priority}</span>,
    <div className="text-[11.5px] text-muted-foreground">
      {b.start_at ? <div>Başl: {new Date(b.start_at).toLocaleDateString("tr-TR")}</div> : null}
      {b.end_at ? <div>Bitiş: {new Date(b.end_at).toLocaleDateString("tr-TR")}</div> : <div>Süresiz</div>}
    </div>,
    <Badge variant={b.is_active ? "green" : "gray"} dot>{b.is_active ? "Aktif" : "Pasif"}</Badge>,
    <div className="flex gap-1.5">
      <IconBtn icon={b.is_active ? EyeOff : Eye} color={b.is_active ? "#d97706" : "#16a34a"} title={b.is_active ? "Pasifleştir" : "Aktifleştir"} onClick={() => handleToggle(b.id, b.is_active)} />
      <IconBtn icon={Trash2} color="#dc2626" title="Sil" onClick={() => handleDelete(b.id, b.title)} />
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Toplam", value: banners.length,                              colorClass: "text-admin-accent" },
          { label: "Aktif",  value: banners.filter((b) => b.is_active).length,  colorClass: "text-emerald-600" },
          { label: "Pasif",  value: banners.filter((b) => !b.is_active).length, colorClass: "text-muted-foreground" },
        ].map((s, i) => (
          <MetricCard key={i} label={s.label} value={s.value} colorClass={s.colorClass} />
        ))}
      </div>

      {adding && (
        <Card className="p-5 mb-5 border-admin-accent-border">
          <div className="font-semibold text-foreground mb-4 text-sm">Yeni Banner Ekle</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Başlık *",     key: "title",     placeholder: "Banner başlığı" },
              { label: "Alt Başlık",   key: "subtitle",  placeholder: "İsteğe bağlı" },
              { label: "Görsel URL",   key: "image_url", placeholder: "https://…" },
              { label: "Bağlantı URL", key: "link_url",  placeholder: "https://…" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">{label}</Label>
                <Input placeholder={placeholder} value={(form as Record<string, string>)[key]} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Konum</Label>
              <Select value={form.placement} onValueChange={(v) => setForm((prev) => ({ ...prev, placement: v as BannerPlacement }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(PLACEMENT_LABELS) as [BannerPlacement, string][]).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">Öncelik (0-100)</Label>
              <Input type="number" min={0} max={100} value={form.priority} onChange={(e) => setForm((v) => ({ ...v, priority: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setAdding(false)}>İptal</Button>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-5">
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Banner bulunamadı" />}
      </Card>
    </>
  );
}
