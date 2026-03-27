"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Eye, MapPin, Store } from "lucide-react";
import {
  PageHeader, Badge, FilterTabs, SearchInput,
  DataTable, LoadingSpinner, AvatarInitials, IconBtn, Pagination,
} from "@/components/admin/ui";
import type { PartnerAdminView, PartnersAdminListResponse } from "@/types/admin";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const STATUS_MAP: Record<string, { label: string; variant: "yellow" | "green" | "red" | "gray" }> = {
  PENDING:   { label: "Onay Bekliyor", variant: "yellow" },
  ACTIVE:    { label: "Aktif",         variant: "green" },
  SUSPENDED: { label: "Askıya Alındı", variant: "red" },
  REJECTED:  { label: "Reddedildi",    variant: "red" },
};

const TYPE_MAP: Record<string, { label: string; variant: "purple" | "blue" }> = {
  E_COMMERCE: { label: "E-Ticaret", variant: "purple" },
  SERVICE:    { label: "Hizmet",    variant: "blue" },
};

function PartnerDetailModal({ partner, onClose, onAction }: {
  partner: PartnerAdminView;
  onClose: () => void;
  onAction: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const act = async (action: "approve" | "reject") => {
    setProcessing(true);
    try {
      await fetch(`/api/admin/partners/${partner.id}/${action}`, {
        method: "POST",
        ...(action === "reject" ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "" }) } : {}),
      });
      toast.success(`Partner ${action === "approve" ? "onaylandı" : "reddedildi"}`);
      onAction();
      onClose();
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setProcessing(false);
    }
  };

  const st = STATUS_MAP[partner.status] ?? { label: partner.status, variant: "gray" as const };
  const ty = TYPE_MAP[partner.type] ?? { label: partner.type, variant: "purple" as const };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card border-admin-border">
        <DialogHeader className="flex flex-row items-center gap-4">
          <AvatarInitials name={partner.name} size={48} />
          <div className="flex flex-col items-start gap-1">
            <DialogTitle className="text-xl font-bold">{partner.name}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant={ty.variant}>{ty.label}</Badge>
              <Badge variant={st.variant} dot>{st.label}</Badge>
            </div>
            <DialogDescription className="hidden">Partner Detayları</DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {[
            { label: "E-posta",      val: partner.user.email },
            { label: "Şehir",        val: partner.city ?? "—" },
            { label: "Sektör",       val: partner.sector },
            { label: "Paket",        val: partner.package_type },
            { label: "Ürün Sayısı",  val: String(partner._count.products) },
            { label: "Hizmet",       val: String(partner._count.services) },
            { label: "Randevu",      val: String(partner._count.appointments) },
            { label: "Abonelik",     val: partner.subscription_status },
          ].map(({ label, val }, i) => (
            <div key={i} className="bg-muted p-3 rounded-lg border border-border">
              <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">{label}</div>
              <div className="text-sm font-medium text-foreground">{val}</div>
            </div>
          ))}
        </div>

        {partner.status === "PENDING" && (
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 font-bold"
              variant="outline"
              disabled={processing}
              onClick={() => act("approve")}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> {processing ? "İşleniyor…" : "Onayla"}
            </Button>
            <Button
              className="flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20 font-bold"
              variant="outline"
              disabled={processing}
              onClick={() => act("reject")}
            >
              <XCircle className="w-4 h-4 mr-2" /> {processing ? "İşleniyor…" : "Reddet"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PartnersContent() {
  const searchParams = useSearchParams();
  const [partners, setPartners] = useState<PartnerAdminView[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({ PENDING: 0, ACTIVE: 0, SUSPENDED: 0, REJECTED: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("status") ?? "ALL");
  const [selected, setSelected] = useState<PartnerAdminView | null>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      if (activeTab !== "ALL") p.set("status", activeTab);
      if (search) p.set("search", search);
      const res = await fetch(`/api/admin/partners?${p}`);
      const d: PartnersAdminListResponse = await res.json();
      setPartners(d.partners);
      setTotal(d.total);
      setCounts(d.counts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab, search, page]);

  const toggleStatus = async (partner: PartnerAdminView) => {
    const newStatus = partner.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    // Optimistic UI update could be added here
    try {
      if (newStatus === "ACTIVE") {
        // Assume there is an approve or activate endpoint. Let's use approve for simplicity or custom status update endpoint
        await fetch(`/api/admin/partners/${partner.id}/approve`, { method: "POST" });
      } else {
        await fetch(`/api/admin/partners/${partner.id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Askıya alındı" }) });
      }
      toast.success(`Partner durumu ${newStatus === "ACTIVE" ? "Aktif" : "Askıya Alındı"} olarak güncellendi`);
      load();
    } catch {
      toast.error("Durum güncellenirken hata oluştu");
    }
  };

  const COLS = [
    { key: "partner",  label: "Partner" },
    { key: "tip",      label: "Tip" },
    { key: "konum",    label: "Konum" },
    { key: "durum",    label: "Durum" },
    { key: "tarih",    label: "Tarih" },
    { key: "islem",    label: "", width: "120px" },
  ];

  const rows = partners.map((p) => {
    const st = STATUS_MAP[p.status] ?? { label: p.status, variant: "gray" as const };
    const ty = TYPE_MAP[p.type] ?? { label: p.type, variant: "purple" as const };
    
    // Yalnızca PENDING değilse toggle edilebilir
    const canToggle = p.status === "ACTIVE" || p.status === "SUSPENDED";

    return [
      <div className="flex items-center gap-2.5">
        <AvatarInitials name={p.name} size={36} />
        <div>
          <div className="font-semibold text-foreground text-[13.5px]">{p.name}</div>
          <div className="text-[11.5px] text-muted-foreground">{p.user.email}</div>
        </div>
      </div>,
      <div>
        <Badge variant={ty.variant}>{ty.label}</Badge>
        <div className="text-[11px] text-muted-foreground mt-1">
          {p._count.products > 0 ? `${p._count.products} ürün` : ""}
          {p._count.services > 0 ? ` ${p._count.services} hizmet` : ""}
        </div>
      </div>,
      <div className="flex items-center gap-1.5 text-muted-foreground text-[13px]">
        <MapPin className="w-3.5 h-3.5 text-admin-accent" /> {p.city ?? "—"}{p.district ? `, ${p.district}` : ""}
      </div>,
      <div className="flex items-center gap-2">
        {canToggle ? (
          <Switch 
            checked={p.status === "ACTIVE"} 
            onCheckedChange={() => toggleStatus(p)} 
            className="data-[state=checked]:bg-emerald-500"
          />
        ) : null}
        <Badge variant={st.variant} dot>{st.label}</Badge>
      </div>,
      <span className="text-[12.5px] text-muted-foreground">
        {new Date(p.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
      </span>,
      <div className="flex gap-1.5 justify-end">
        <IconBtn icon={Eye} title="Görüntüle" onClick={() => setSelected(p)} />
        {p.status === "PENDING" && (
          <>
            <IconBtn icon={CheckCircle} color="#10b981" title="Onayla" onClick={async () => { await fetch(`/api/admin/partners/${p.id}/approve`, { method: "POST" }); load(); }} />
            <IconBtn icon={XCircle} color="#f43f5e" title="Reddet" onClick={async () => { await fetch(`/api/admin/partners/${p.id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "" }) }); load(); }} />
          </>
        )}
      </div>,
    ];
  });

  return (
    <>
      {selected && <PartnerDetailModal partner={selected} onClose={() => setSelected(null)} onAction={load} />}

      <PageHeader
        title="Partner Yönetimi"
        description="Mağaza ve hizmet sağlayıcıları gerçek zamanlı yönetin"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Toplam",         value: total,               className: "text-admin-accent bg-admin-accent/10" },
          { label: "Onay Bekleyen",  value: counts.PENDING ?? 0, className: "text-amber-500 bg-amber-500/10" },
          { label: "Aktif",          value: counts.ACTIVE ?? 0,  className: "text-emerald-500 bg-emerald-500/10" },
          { label: "Askıya Alınmış", value: counts.SUSPENDED ?? 0, className: "text-rose-500 bg-rose-500/10" },
        ].map((s, i) => (
          <Card key={i} className="p-5 border-border shadow-sm">
            <div className={`text-2xl font-extrabold tracking-tight mb-1`}>
              <span className={s.className.split(" ")[0]}>{s.value}</span>
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 shadow-sm border-admin-border">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs
            tabs={[
              { key: "ALL",       label: "Tümü",   count: total },
              { key: "PENDING",   label: "Bekleyen", count: counts.PENDING ?? 0 },
              { key: "ACTIVE",    label: "Aktif",  count: counts.ACTIVE ?? 0 },
              { key: "SUSPENDED", label: "Askıda", count: counts.SUSPENDED ?? 0 },
            ]}
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPage(1); }}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Partner, e-posta veya şehir ara…" />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Partner bulunamadı" />}
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </Card>
    </>
  );
}

export default function PartnersPage() {
  return <Suspense fallback={<LoadingSpinner />}><PartnersContent /></Suspense>;
}
