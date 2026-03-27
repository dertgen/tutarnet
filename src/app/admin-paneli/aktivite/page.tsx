"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity } from "lucide-react";
import {
  PageHeader, AdminCard, Badge, SearchInput, LoadingSpinner,
  DataTable, AvatarInitials, FilterTabs, Pagination, T,
} from "@/components/admin/ui";
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <AvatarInitials name={log.staff?.display_name ?? "Sistem"} size={28} color={T.accent} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: T.textPrimary }}>{log.staff?.display_name ?? "Sistem"}</div>
          <div style={{ fontSize: "11px", color: T.textMuted }}>{log.staff?.role ?? "—"}</div>
        </div>
      </div>,
      <Badge variant={action.variant}>{action.label}</Badge>,
      <div>
        <div style={{ fontSize: "13px", color: T.textPrimary, fontWeight: 500 }}>{log.resource}</div>
        <div style={{ fontSize: "11px", color: T.textMuted, fontFamily: "monospace" }}>{log.resource_id.slice(0, 12)}…</div>
      </div>,
      <div style={{ fontSize: "11.5px", color: T.textMuted }}>
        {hasChange ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: T.danger }}>eski</span>
            <span style={{ color: T.divider }}>→</span>
            <span style={{ color: T.success }}>yeni</span>
          </span>
        ) : <span>—</span>}
      </div>,
      <span style={{ fontSize: "11.5px", color: T.textMuted, fontFamily: "monospace" }}>{log.ip_address ?? "—"}</span>,
      <span style={{ fontSize: "12px", color: T.textMuted, whiteSpace: "nowrap" }}>
        {new Date(log.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </span>,
    ];
  });

  return (
    <>
      <PageHeader title="Aktivite Günlüğü" description="Sistemde gerçekleştirilen tüm admin işlemlerinin kaydı" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Toplam Kayıt", value: total,                                               color: T.accent,  bg: T.accentDim },
          { label: "Oluşturma",    value: logs.filter((l) => l.action === "CREATE").length,    color: T.success, bg: T.successDim },
          { label: "Güncelleme",   value: logs.filter((l) => l.action === "UPDATE").length,    color: T.accent,  bg: T.accentDim },
          { label: "Silme",        value: logs.filter((l) => l.action === "DELETE").length,    color: T.danger,  bg: T.dangerDim },
        ].map((s, i) => (
          <AdminCard key={i} style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, letterSpacing: "-0.4px" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "4px" }}>{s.label}</div>
          </AdminCard>
        ))}
      </div>

      <AdminCard style={{ padding: "20px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
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
          <div style={{ flex: 1, minWidth: "200px" }}>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Kaynak veya ID ara…" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : <DataTable columns={COLS} rows={rows} emptyLabel="Kayıt bulunamadı" />}
        <Pagination page={page} total={total} limit={30} onChange={setPage} />
      </AdminCard>
    </>
  );
}
