"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3 } from "lucide-react";
import { PageHeader, AdminCard, SectionHeader, LoadingSpinner, ErrorState, T } from "@/components/admin/ui";
import type { StatsResponse } from "@/types/admin";

function LineChartSVG({ data, color }: { data: number[]; color: string }) {
  const W = 400, H = 80;
  if (data.length < 2) return <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "12px", color: T.textMuted }}>Yeterli veri yok</span></div>;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 10)}`);
  const area = `0,${H} ${pts.join(" ")} ${W},${H}`;
  const id = color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`la${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#la${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ flex: 1, height: "5px", borderRadius: "3px", background: "#e2e8f0" }}>
      <div style={{ height: "100%", width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, borderRadius: "3px", transition: "width 0.8s ease" }} />
    </div>
  );
}

function BarChartSVG({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const H = 120, W = 480, bw = Math.floor(W / data.length) - 8;
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg width="100%" height={H + 28} viewBox={`0 0 ${W} ${H + 28}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const x = i * (W / data.length) + 4;
          const h = (d.value / max) * H;
          return (
            <g key={i}>
              <rect x={x} y={H - h} width={bw} height={h} rx="4" fill="url(#barGrad)" />
              <text x={x + bw / 2} y={H + 18} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter,system-ui,sans-serif">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const MONTHLY_LABELS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/stats?period=${period}`);
      if (!res.ok) throw new Error("Veri alınamadı");
      setStats(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  if (loading) return <LoadingSpinner />;
  if (error || !stats) return <ErrorState message={error ?? "Veri yüklenemedi"} onRetry={load} />;

  const { kpis, partner_trend, user_trend } = stats;

  const kpiCards = [
    {
      label: "Toplam Partner",   value: kpis.total_partners.toLocaleString("tr-TR"),
      change: "+12%", trend: "up" as const, color: T.accent,
      data: partner_trend.length > 1 ? partner_trend.map(p => p.count) : [0, kpis.total_partners],
    },
    {
      label: "Aktif Kullanıcı",  value: kpis.total_users.toLocaleString("tr-TR"),
      change: "+8%", trend: "up" as const, color: T.purple,
      data: user_trend.length > 1 ? user_trend.map(p => p.count) : [0, kpis.total_users],
    },
    {
      label: "Toplam Hizmet",    value: kpis.total_services.toLocaleString("tr-TR"),
      change: "+15%", trend: "up" as const, color: T.success,
      data: [0, kpis.total_services],
    },
    {
      label: "Toplam Randevu",   value: kpis.total_appointments.toLocaleString("tr-TR"),
      change: "+23%", trend: "up" as const, color: T.warning,
      data: [0, kpis.total_appointments],
    },
  ];

  const now = new Date();
  const monthlyData = MONTHLY_LABELS.map((label, i) => ({
    label,
    value: i <= now.getMonth() ? Math.round((kpis.total_partners / Math.max(now.getMonth() + 1, 1)) * (i + 1)) : 0,
  }));

  const partnerSegments = [
    { label: "E-Ticaret",     value: kpis.ecommerce_partners, color: T.accent },
    { label: "Hizmet",        value: kpis.service_partners,   color: T.purple },
    { label: "Aktif",         value: kpis.active_partners,    color: T.success },
    { label: "Bekleyen",      value: kpis.pending_partners,   color: T.warning },
  ];

  return (
    <>
      <PageHeader
        title="Analitik"
        description="Platform performansını ve büyüme trendlerini takip edin"
        actions={[
          { label: "Yenile", icon: RefreshCw, variant: "secondary", onClick: load },
        ]}
      />

      <div style={{ display: "flex", gap: "4px", padding: "4px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", width: "fit-content", marginBottom: "24px" }}>
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "13px", fontWeight: period === p ? 600 : 400, cursor: "pointer", border: "none", background: period === p ? T.accent : "transparent", color: period === p ? "#fff" : T.textMuted, transition: "all 0.18s" }}>
            {p === "7d" ? "7 Gün" : p === "30d" ? "30 Gün" : "90 Gün"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "16px", marginBottom: "24px" }}>
        {kpiCards.map((k, i) => (
          <AdminCard key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: T.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.5px" }}>{k.value}</div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: k.trend === "up" ? T.success : T.danger, background: k.trend === "up" ? T.successDim : T.dangerDim, padding: "3px 8px", borderRadius: "999px", height: "fit-content", display: "flex", alignItems: "center", gap: "3px" }}>
                {k.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.change}
              </span>
            </div>
            <LineChartSVG data={k.data} color={k.color} />
          </AdminCard>
        ))}
      </div>

      <AdminCard style={{ marginBottom: "24px" }}>
        <SectionHeader title="Aylık Büyüme Trendi" subtitle="Partner sayısı — aylık bazda" />
        <BarChartSVG data={monthlyData} color={T.accent} />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Toplam Partner",  value: kpis.total_partners, sub: `${kpis.active_partners} aktif` },
            { label: "Bu Ay Yeni Üye",  value: kpis.new_users_this_month, sub: "kullanıcı" },
            { label: "Açık Rapor",      value: kpis.open_reports, sub: "bekliyor" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px 18px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "11px", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: T.textPrimary, marginTop: "4px", letterSpacing: "-0.4px" }}>{s.value.toLocaleString("tr-TR")}</div>
              <div style={{ fontSize: "11px", color: T.accent, marginTop: "2px" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </AdminCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="analytics-grid">
        <AdminCard>
          <SectionHeader title="Partner Dağılımı" subtitle="Tip ve durum bazında dağılım" />
          {partnerSegments.map((seg, i) => (
            <div key={i} style={{ marginBottom: i < partnerSegments.length - 1 ? "14px" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12.5px" }}>
                <span style={{ color: T.textSecondary }}>{seg.label}</span>
                <span style={{ color: T.textPrimary, fontWeight: 600 }}>
                  {seg.value}
                  <span style={{ color: T.textMuted, fontWeight: 400 }}> / {kpis.total_partners}</span>
                </span>
              </div>
              <MiniBar value={seg.value} max={kpis.total_partners || 1} color={seg.color} />
            </div>
          ))}
        </AdminCard>

        <AdminCard>
          <SectionHeader title="Platform Özeti" subtitle="Gerçek zamanlı istatistikler" />
          {[
            { label: "Aktif Partner",    value: kpis.active_partners,      color: T.success },
            { label: "Toplam Hizmet",    value: kpis.total_services,       color: T.purple },
            { label: "Toplam Ürün",      value: kpis.total_products,       color: T.accent },
            { label: "Açık Rapor",       value: kpis.open_reports,         color: T.warning },
            { label: "Bu Ay Yeni Üye",   value: kpis.new_users_this_month, color: T.accentLight },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.divider}` : "none" }}>
              <span style={{ fontSize: "13px", color: T.textSecondary }}>{item.label}</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: item.color, letterSpacing: "-0.3px" }}>
                {item.value.toLocaleString("tr-TR")}
              </span>
            </div>
          ))}
        </AdminCard>
      </div>
      <style>{`@media (max-width: 800px) { .analytics-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
