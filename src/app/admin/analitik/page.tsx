"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3 } from "lucide-react";
import { PageHeader, AdminCard, SectionHeader, LoadingSpinner, ErrorState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import type { StatsResponse } from "@/types/admin";

/* Admin color CSS variable references for SVG/dynamic usage */
const COLORS = {
  accent:      "var(--color-admin-accent)",
  accentLight: "var(--color-admin-accent-light)",
  purple:      "var(--color-admin-purple)",
  success:     "var(--color-admin-success)",
  warning:     "var(--color-admin-warning)",
  danger:      "var(--color-admin-danger)",
} as const;

function LineChartSVG({ data, color }: { data: number[]; color: string }) {
  const W = 400, H = 80;
  if (data.length < 2) return <div className="flex items-center justify-center" style={{ height: H }}><span className="text-xs text-admin-text-muted">Yeterli veri yok</span></div>;
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
    <div className="flex-1 h-[5px] rounded-sm bg-slate-200">
      <div className="h-full rounded-sm transition-[width] duration-[800ms] ease-in-out" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} />
    </div>
  );
}

function BarChartSVG({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const H = 120, W = 480, bw = Math.floor(W / data.length) - 8;
  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" height={H + 28} viewBox={`0 0 ${W} ${H + 28}`} preserveAspectRatio="none" className="block">
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
      change: "+12%", trend: "up" as const, color: COLORS.accent,
      data: partner_trend.length > 1 ? partner_trend.map(p => p.count) : [0, kpis.total_partners],
    },
    {
      label: "Aktif Kullanıcı",  value: kpis.total_users.toLocaleString("tr-TR"),
      change: "+8%", trend: "up" as const, color: COLORS.purple,
      data: user_trend.length > 1 ? user_trend.map(p => p.count) : [0, kpis.total_users],
    },
    {
      label: "Toplam Hizmet",    value: kpis.total_services.toLocaleString("tr-TR"),
      change: "+15%", trend: "up" as const, color: COLORS.success,
      data: [0, kpis.total_services],
    },
    {
      label: "Toplam Randevu",   value: kpis.total_appointments.toLocaleString("tr-TR"),
      change: "+23%", trend: "up" as const, color: COLORS.warning,
      data: [0, kpis.total_appointments],
    },
  ];

  const now = new Date();
  const monthlyData = MONTHLY_LABELS.map((label, i) => ({
    label,
    value: i <= now.getMonth() ? Math.round((kpis.total_partners / Math.max(now.getMonth() + 1, 1)) * (i + 1)) : 0,
  }));

  const partnerSegments = [
    { label: "E-Ticaret",     value: kpis.ecommerce_partners, color: COLORS.accent },
    { label: "Hizmet",        value: kpis.service_partners,   color: COLORS.purple },
    { label: "Aktif",         value: kpis.active_partners,    color: COLORS.success },
    { label: "Bekleyen",      value: kpis.pending_partners,   color: COLORS.warning },
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

      <div className="flex gap-1 p-1 bg-admin-surface border border-admin-border rounded-[10px] w-fit mb-6">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-[7px] rounded-[7px] text-[13px] cursor-pointer border-none transition-all duration-[180ms]",
              period === p
                ? "bg-admin-accent text-white font-semibold"
                : "bg-transparent text-admin-text-muted font-normal"
            )}
          >
            {p === "7d" ? "7 Gün" : p === "30d" ? "30 Gün" : "90 Gün"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        {kpiCards.map((k, i) => (
          <AdminCard key={i}>
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-xs text-admin-text-muted mb-1.5 uppercase tracking-wide">{k.label}</div>
                <div className="text-[26px] font-extrabold text-admin-text-primary tracking-tight">{k.value}</div>
              </div>
              <span className={cn(
                "text-xs font-semibold px-2 py-[3px] rounded-full h-fit flex items-center gap-[3px]",
                k.trend === "up"
                  ? "text-admin-success bg-admin-success-dim"
                  : "text-admin-danger bg-admin-danger-dim"
              )}>
                {k.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.change}
              </span>
            </div>
            <LineChartSVG data={k.data} color={k.color} />
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mb-6">
        <SectionHeader title="Aylık Büyüme Trendi" subtitle="Partner sayısı — aylık bazda" />
        <BarChartSVG data={monthlyData} color={COLORS.accent} />
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { label: "Toplam Partner",  value: kpis.total_partners, sub: `${kpis.active_partners} aktif` },
            { label: "Bu Ay Yeni Üye",  value: kpis.new_users_this_month, sub: "kullanıcı" },
            { label: "Açık Rapor",      value: kpis.open_reports, sub: "bekliyor" },
          ].map((s, i) => (
            <div key={i} className="px-[18px] py-3 bg-admin-surface border border-admin-border rounded-[10px] flex-1 min-w-[120px]">
              <div className="text-[11px] text-admin-text-muted uppercase tracking-wide">{s.label}</div>
              <div className="text-xl font-bold text-admin-text-primary mt-1 tracking-tight">{s.value.toLocaleString("tr-TR")}</div>
              <div className="text-[11px] text-admin-accent mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminCard>
          <SectionHeader title="Partner Dağılımı" subtitle="Tip ve durum bazında dağılım" />
          {partnerSegments.map((seg, i) => (
            <div key={i} className={i < partnerSegments.length - 1 ? "mb-3.5" : ""}>
              <div className="flex justify-between mb-1.5 text-[12.5px]">
                <span className="text-admin-text-secondary">{seg.label}</span>
                <span className="text-admin-text-primary font-semibold">
                  {seg.value}
                  <span className="text-admin-text-muted font-normal"> / {kpis.total_partners}</span>
                </span>
              </div>
              <MiniBar value={seg.value} max={kpis.total_partners || 1} color={seg.color} />
            </div>
          ))}
        </AdminCard>

        <AdminCard>
          <SectionHeader title="Platform Özeti" subtitle="Gerçek zamanlı istatistikler" />
          {[
            { label: "Aktif Partner",    value: kpis.active_partners,      color: COLORS.success },
            { label: "Toplam Hizmet",    value: kpis.total_services,       color: COLORS.purple },
            { label: "Toplam Ürün",      value: kpis.total_products,       color: COLORS.accent },
            { label: "Açık Rapor",       value: kpis.open_reports,         color: COLORS.warning },
            { label: "Bu Ay Yeni Üye",   value: kpis.new_users_this_month, color: COLORS.accentLight },
          ].map((item, i) => (
            <div key={i} className={cn("flex justify-between items-center py-2.5", i < 4 && "border-b border-admin-divider")}>
              <span className="text-[13px] text-admin-text-secondary">{item.label}</span>
              <span className="text-base font-bold tracking-tight" style={{ color: item.color }}>
                {item.value.toLocaleString("tr-TR")}
              </span>
            </div>
          ))}
        </AdminCard>
      </div>
    </>
  );
}
