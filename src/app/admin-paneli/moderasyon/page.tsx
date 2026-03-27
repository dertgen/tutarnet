"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flag, AlertTriangle, MessageSquare, Star, CheckCircle, XCircle, Eye, Clock, UserCircle } from "lucide-react";
import {
  PageHeader, AdminCard, Badge, FilterTabs, SearchInput,
  DataTable, LoadingSpinner, AvatarInitials, IconBtn, Pagination, MetricCard, Toast,
} from "@/components/admin/ui";
import type { ReportAdminView, ReportListResponse, ReportType } from "@/types/admin";

const STATUS_MAP = {
  PENDING:   { label: "Bekliyor",    variant: "yellow" as const },
  REVIEWED:  { label: "İnceleniyor", variant: "blue" as const },
  RESOLVED:  { label: "Çözüldü",    variant: "green" as const },
  DISMISSED: { label: "Reddedildi", variant: "gray" as const },
};

const SEVERITY_MAP = {
  LOW:      { label: "Düşük",    variant: "gray" as const },
  MEDIUM:   { label: "Orta",     variant: "yellow" as const },
  HIGH:     { label: "Yüksek",   variant: "red" as const },
  CRITICAL: { label: "Kritik",   variant: "red" as const },
};

const TYPE_MAP: Record<ReportType, { label: string; variant: "blue" | "purple" | "orange" | "gray"; icon: React.ElementType }> = {
  REVIEW:  { label: "Yorum",     variant: "blue",   icon: Star },
  CONTENT: { label: "İçerik",    variant: "purple",  icon: MessageSquare },
  PARTNER: { label: "Partner",   variant: "orange",  icon: Flag },
  USER:    { label: "Kullanıcı", variant: "gray",    icon: UserCircle },
  DEAL:    { label: "Fırsat",    variant: "blue",    icon: Flag },
  SPAM:    { label: "Spam",      variant: "gray",    icon: MessageSquare },
};

const COLS = [
  { key: "tip",     label: "Tip" },
  { key: "neden",   label: "Neden" },
  { key: "hedef",   label: "Hedef" },
  { key: "sikayet", label: "Şikayet Eden" },
  { key: "onem",    label: "Önem" },
  { key: "durum",   label: "Durum" },
  { key: "tarih",   label: "Tarih" },
  { key: "islem",   label: "", width: "80px" },
];

export default function ModerationPage() {
  const [reports, setReports] = useState<ReportAdminView[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ PENDING: 0, REVIEWED: 0, RESOLVED: 0, DISMISSED: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      if (activeTab !== "ALL") p.set("status", activeTab);
      const res = await fetch(`/api/admin/raporlar?${p}`);
      const data: ReportListResponse = await res.json();
      setReports(data.reports);
      setTotal(data.total);
      setCounts(data.counts as typeof counts);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: "RESOLVED" | "DISMISSED") => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/raporlar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(true, status === "RESOLVED" ? "Rapor çözüldü olarak işaretlendi." : "Rapor reddedildi.");
        load();
      } else {
        const d = await res.json();
        showToast(false, d.error ?? "İşlem başarısız");
      }
    } finally {
      setActionId(null);
    }
  };

  const filtered = search
    ? reports.filter((r) =>
        r.reason.toLowerCase().includes(search.toLowerCase()) ||
        r.target_label.toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  const rows = filtered.map((r) => {
    const st = STATUS_MAP[r.status];
    const sv = SEVERITY_MAP[r.severity];
    const ty = TYPE_MAP[r.type];
    const TypeIcon = ty.icon;
    const busy = actionId === r.id;

    return [
      <div className="flex items-center gap-2">
        <TypeIcon size={14} className="text-muted-foreground" />
        <Badge variant={ty.variant}>{ty.label}</Badge>
      </div>,
      <div>
        <div className="text-[13.5px] font-medium text-foreground">{r.reason}</div>
        <div className="text-[11.5px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
          {r.description}
        </div>
      </div>,
      <span className="text-[12.5px] text-muted-foreground max-w-[140px] block truncate">
        {r.target_label}
      </span>,
      <div className="flex items-center gap-2">
        <AvatarInitials name={r.reported_by.name ?? r.reported_by.email} size={26} />
        <span className="text-[12.5px] text-muted-foreground">{r.reported_by.name ?? "—"}</span>
      </div>,
      <Badge variant={sv.variant}>{sv.label}</Badge>,
      <Badge variant={st.variant}>{st.label}</Badge>,
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
      </span>,
      <div className="flex gap-1.5">
        <IconBtn icon={Eye} title="Görüntüle" />
        {r.status === "PENDING" && (
          <>
            <IconBtn icon={busy ? Clock : CheckCircle} color="#16a34a" title="Çöz" onClick={() => updateStatus(r.id, "RESOLVED")} />
            <IconBtn icon={busy ? Clock : XCircle} color="#dc2626" title="Reddet" onClick={() => updateStatus(r.id, "DISMISSED")} />
          </>
        )}
      </div>,
    ];
  });

  return (
    <>
      <PageHeader title="Moderasyon" description="Şikayet, yorum ve içerik raporlarını inceleyin" />

      {toast && <Toast ok={toast.ok} text={toast.text} />}

      {counts.PENDING > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200/50 rounded-xl mb-6">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span className="text-[13.5px] text-foreground">
            <strong className="text-amber-600">{counts.PENDING} rapor</strong> inceleme bekliyor — acil işlem gerektirebilir
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Toplam Rapor",  value: total,            colorClass: "text-admin-accent" },
          { label: "Bekleyen",      value: counts.PENDING,   colorClass: "text-amber-600" },
          { label: "İnceleniyor",   value: counts.REVIEWED,  colorClass: "text-admin-accent" },
          { label: "Çözüldü",       value: counts.RESOLVED,  colorClass: "text-emerald-600" },
        ].map((s, i) => (
          <MetricCard key={i} label={s.label} value={s.value} colorClass={s.colorClass} />
        ))}
      </div>

      <AdminCard className="p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs
            tabs={[
              { key: "ALL",      label: "Tümü",       count: total },
              { key: "PENDING",  label: "Bekleyen",   count: counts.PENDING },
              { key: "REVIEWED", label: "İnceleniyor", count: counts.REVIEWED },
              { key: "RESOLVED", label: "Çözüldü",    count: counts.RESOLVED },
            ]}
            active={activeTab}
            onChange={(tab) => { setActiveTab(tab); setPage(1); }}
          />
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Neden veya hedef ara…" />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Rapor bulunamadı" />}
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </AdminCard>
    </>
  );
}
