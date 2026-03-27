"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity } from "lucide-react";
import {
  PageHeader, Badge, SearchInput, LoadingSpinner,
  DataTable, AvatarInitials, FilterTabs, Pagination, MetricCard,
} from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import type { AuditLogResponse, AuditLogView } from "@/types/admin";

const ACTION_MAP: Record<string, { label: string; variant: "green" | "blue" | "red" | "yellow" | "gray" }> = {
  CREATE:  { label: "Oluşturma",  variant: "green" },
  UPDATE:  { label: "Güncelleme", variant: "blue" },
  DELETE:  { label: "Silme",      variant: "red" },
  APPROVE: { label: "Onaylama",   variant: "green" },
  REJECT:  { label: "Reddedildi", variant: "red" },
  LOGIN:   { label: "Giriş",      variant: "gray" },
  LOGOUT:  { label: "Çıkış",      variant: "gray" },
};

const COLS = [
  { key: "personel", label: "Personel" },
  { key: "islem",    label: "İşlem" },
  { key: "kaynak",   label: "Kaynak" },
  { key: "deger",    label: "Değişim" },
  { key: "ip",       label: "IP Adresi" },
  { key: "tarih",    label: "Tarih" },
];

export default function AktivitePage() {
  const [logs, setLogs] = useState<AuditLogView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "30" });
      if (actionFilter !== "ALL") p.set("action", actionFilter);
      if (search) p.set("search", search);
      const res = await fetch(`/api/admin/aktivite-gunlugu?${p}`);
      const data: AuditLogResponse = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, page, search]);

  useEffect(() => { load(); }, [load]);

  const rows = logs.map((log) => {
    const action = ACTION_MAP[log.action] ?? { label: log.action, variant: "gray" as const };
    const hasChange = log.old_value !== null || log.new_value !== null;
    return [
      <div className="flex items-center gap-2">
        <AvatarInitials name={log.staff?.display_name ?? "Sistem"} size={28} />
        <div>
          <div className="text-[13px] font-semibold text-foreground">{log.staff?.display_name ?? "Sistem"}</div>
          <div className="text-[11px] text-muted-foreground">{log.staff?.role ?? "—"}</div>
        </div>
      </div>,
      <Badge variant={action.variant}>{action.label}</Badge>,
      <div>
        <div className="text-[13px] font-medium text-foreground">{log.resource}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{log.resource_id.slice(0, 12)}…</div>
      </div>,
      <div className="text-[11.5px] text-muted-foreground">
        {hasChange ? (
          <span className="inline-flex items-center gap-1">
            <span className="text-red-500">eski</span>
            <span className="text-border">→</span>
            <span className="text-emerald-600">yeni</span>
          </span>
        ) : <span>—</span>}
      </div>,
      <span className="text-[11.5px] text-muted-foreground font-mono">{log.ip_address ?? "—"}</span>,
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(log.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </span>,
    ];
  });

  return (
    <>
      <PageHeader title="Aktivite Günlüğü" description="Sistemde gerçekleştirilen tüm admin işlemlerinin kaydı" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Toplam Kayıt", value: total,                                               colorClass: "text-admin-accent" },
          { label: "Oluşturma",    value: logs.filter((l) => l.action === "CREATE").length,    colorClass: "text-emerald-600" },
          { label: "Güncelleme",   value: logs.filter((l) => l.action === "UPDATE").length,    colorClass: "text-admin-accent" },
          { label: "Silme",        value: logs.filter((l) => l.action === "DELETE").length,    colorClass: "text-red-600" },
        ].map((s, i) => (
          <MetricCard key={i} label={s.label} value={s.value} colorClass={s.colorClass} />
        ))}
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs
            tabs={[
              { key: "ALL",     label: "Tümü" },
              { key: "CREATE",  label: "Oluşturma" },
              { key: "UPDATE",  label: "Güncelleme" },
              { key: "DELETE",  label: "Silme" },
              { key: "APPROVE", label: "Onay" },
            ]}
            active={actionFilter}
            onChange={(tab) => { setActionFilter(tab); setPage(1); }}
          />
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Kaynak veya ID ara…" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Kayıt bulunamadı" />}
        <Pagination page={page} total={total} limit={30} onChange={setPage} />
      </Card>
    </>
  );
}
