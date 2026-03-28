"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store, Users, ShoppingBag, Calendar, AlertCircle, ArrowUpRight,
  RefreshCw, TrendingUp, TrendingDown, BarChart3, Shield, Activity,
  Clock, Minus, Eye,
} from "lucide-react";
import { LoadingSpinner, ErrorState } from "@/components/admin/feedback";
import { Badge } from "@/components/admin/badge";
import type { StatsResponse } from "@/types/admin";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Sparkline({ values, colorClass, height = 36, id = "sg" }: { values: number[]; colorClass: string; height?: number; id?: string }) {
  if (values.length < 2) return null;
  const W = 88, H = height;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const area = `0,${H} ${pts.join(" ")} ${W},${H}`;
  const gradientId = `${id}-sparkline`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible block">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={`${colorClass} opacity-25`} stopColor="currentColor" />
          <stop offset="100%" className={`${colorClass} opacity-0`} stopColor="currentColor" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline points={pts.join(" ")} fill="none" className={colorClass} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}


function SegmentedBar({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  return (
    <div className="flex h-2.5 rounded-full overflow-hidden bg-secondary gap-0.5">
      {segments.filter(s => s.value > 0).map((seg, i) => (
        <div
          key={i}
          className={cn("h-full rounded-full transition-all duration-700", seg.color)}
          style={{ width: `${Math.max((seg.value / total) * 100, 2)}%` }}
          title={`${seg.label}: ${seg.value}`}
        />
      ))}
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; variant: "green" | "yellow" | "red" | "gray" }> = {
  PENDING:   { label: "Onay Bekliyor", variant: "yellow" },
  ACTIVE:    { label: "Aktif",         variant: "green" },
  SUSPENDED: { label: "Askıya Alındı", variant: "red" },
  REJECTED:  { label: "Reddedildi",    variant: "red" },
};

const TYPE_MAP: Record<string, { label: string; variant: "blue" | "purple" }> = {
  E_COMMERCE: { label: "E-Ticaret", variant: "blue" },
  SERVICE:    { label: "Hizmet",    variant: "purple" },
};

const SEVERITY_MAP: Record<string, { label: string; variant: "red" | "orange" | "yellow" | "gray"; icon: React.ElementType }> = {
  CRITICAL: { label: "Kritik",  variant: "red",    icon: Shield },
  HIGH:     { label: "Yüksek",  variant: "orange", icon: AlertCircle },
  MEDIUM:   { label: "Orta",    variant: "yellow", icon: Activity },
  LOW:      { label: "Düşük",   variant: "gray",   icon: Eye },
};

const CARD_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-600 dark:text-blue-400", spark: "text-blue-500" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", spark: "text-emerald-500" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-600 dark:text-violet-400", spark: "text-violet-500" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-600 dark:text-amber-400", spark: "text-amber-500" },
];

function computeDelta(values: number[]): number | null {
  if (values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const first = values.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const second = values.slice(mid).reduce((a, b) => a + b, 0) / (values.length - mid);
  if (first === 0) return null;
  return Math.round(((second - first) / first) * 100);
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Veri alınamadı");
      setData(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState message={error ?? "Veri yüklenemedi"} onRetry={load} />;

  const { kpis, partner_trend, user_trend, recent_partners, pending_reports } = data;

  const partnerSpark = partner_trend.map(p => p.count);
  const userSpark = user_trend.map(p => p.count);

  const statCards = [
    { title: "Toplam Partner",   value: kpis.total_partners,    icon: Store,       link: "/admin-paneli/partnerler",   spark: partnerSpark,  delta: computeDelta(partnerSpark) },
    { title: "Toplam Kullanıcı", value: kpis.total_users,       icon: Users,       link: "/admin-paneli/kullanicilar", spark: userSpark,     delta: computeDelta(userSpark) },
    { title: "Toplam Ürün",      value: kpis.total_products,    icon: ShoppingBag, link: "/admin-paneli/partnerler",   spark: [] as number[], delta: null as number | null },
    { title: "Toplam Randevu",   value: kpis.total_appointments,icon: Calendar,    link: "/admin-paneli/partnerler",   spark: [] as number[], delta: null as number | null },
  ];

  return (
    <div className="max-w-[1300px] mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground m-0">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 font-medium">
          <RefreshCw className="w-4 h-4" /> Yenile
        </Button>
      </div>

      {kpis.pending_partners > 0 && (
        <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <AlertTitle className="m-0 font-medium">
              <strong className="font-bold">{kpis.pending_partners} partner</strong> onay bekliyor
            </AlertTitle>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/20">
            <Link href="/admin-paneli/partnerler?status=PENDING">
              İncele <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <Link key={i} href={c.link} className="outline-none focus:ring-2 focus:ring-ring rounded-xl block">
            <StatKpiCard {...c} colorIdx={i} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card shadow-sm border rounded-xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                </div>
                Partner Dağılımı
              </CardTitle>
              <span className="text-xs text-muted-foreground font-medium">{kpis.total_partners} toplam</span>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">Tip ve durum bazında dağılım</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <SegmentedBar segments={[
              { value: kpis.ecommerce_partners, color: "bg-blue-500", label: "E-Ticaret" },
              { value: kpis.service_partners, color: "bg-purple-500", label: "Hizmet" },
            ]} />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "E-Ticaret",     value: kpis.ecommerce_partners, color: "bg-blue-500",   textColor: "text-blue-600 dark:text-blue-400" },
                { label: "Hizmet",        value: kpis.service_partners,   color: "bg-purple-500",  textColor: "text-purple-600 dark:text-purple-400" },
                { label: "Aktif",         value: kpis.active_partners,    color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
                { label: "Onay Bekliyor", value: kpis.pending_partners,   color: "bg-amber-500",   textColor: "text-amber-600 dark:text-amber-400" },
              ].map((seg, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-transparent hover:border-border transition-colors">
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", seg.color)} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground truncate">{seg.label}</div>
                    <div className={cn("text-sm font-bold", seg.textColor)}>{seg.value}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {kpis.total_partners > 0 ? Math.round((seg.value / kpis.total_partners) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border rounded-xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              Platform Özeti
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">Anlık platform metrikleri</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-0 pt-2">
            {[
              { label: "Aktif Partner",      value: kpis.active_partners,      icon: Store,    color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Toplam Hizmet",      value: kpis.total_services,       icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Açık Rapor",         value: kpis.open_reports,         icon: Shield,   color: "text-red-500",     bg: "bg-red-500/10" },
              { label: "Bu Ay Yeni Üye",     value: kpis.new_users_this_month, icon: Users,    color: "text-violet-500",  bg: "bg-violet-500/10" },
            ].map((item, i, w) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} className={cn("flex items-center gap-3 py-3", i < w.length - 1 && "border-b")}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.bg)}>
                    <ItemIcon className={cn("w-4 h-4", item.color)} strokeWidth={1.8} />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-base font-bold tabular-nums">{item.value.toLocaleString("tr-TR")}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {pending_reports.length > 0 && (
        <Card className="bg-card shadow-sm border rounded-xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Bekleyen Raporlar</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{pending_reports.length} rapor inceleme bekliyor</CardDescription>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1 text-xs h-8">
              <Link href="/admin-paneli/moderasyon">
                Tümünü Gör <ArrowUpRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col">
            {pending_reports.map((r, i, arr) => {
              const sev = SEVERITY_MAP[r.severity] ?? { label: r.severity, variant: "gray" as const, icon: Eye };
              const SevIcon = sev.icon;
              return (
                <div key={r.id} className={cn("flex items-center gap-3 py-3 group", i < arr.length - 1 && "border-b")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                    sev.variant === "red" && "bg-red-500/10 border-red-500/20",
                    sev.variant === "orange" && "bg-orange-500/10 border-orange-500/20",
                    sev.variant === "yellow" && "bg-amber-500/10 border-amber-500/20",
                    sev.variant === "gray" && "bg-muted/50 border-border",
                  )}>
                    <SevIcon className={cn(
                      "w-4 h-4",
                      sev.variant === "red" && "text-red-500",
                      sev.variant === "orange" && "text-orange-500",
                      sev.variant === "yellow" && "text-amber-500",
                      sev.variant === "gray" && "text-muted-foreground",
                    )} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate">{r.reason}</span>
                      <Badge variant={sev.variant}>{sev.label}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground truncate block">{r.target_label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card shadow-sm border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Store className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Son Eklenen Partnerler</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Gerçek zamanlı veriler</CardDescription>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-8 text-xs">
            <Link href="/admin-paneli/partnerler">
              Tümünü Gör <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["Partner", "Tip", "Şehir", "Durum", "Tarih"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider h-10">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent_partners.map((p, idx) => {
                const st = STATUS_MAP[p.status] ?? { label: p.status, variant: "gray" as const };
                const ty = TYPE_MAP[p.type] ?? { label: p.type, variant: "gray" as const };
                const avatarColors = [
                  "from-blue-500 to-blue-600",
                  "from-emerald-500 to-emerald-600",
                  "from-violet-500 to-violet-600",
                  "from-amber-500 to-amber-600",
                  "from-rose-500 to-rose-600",
                ];
                const gradientClass = avatarColors[idx % avatarColors.length];
                return (
                  <TableRow key={p.id} className="group hover:bg-accent/50 transition-colors">
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 text-white font-bold text-sm uppercase shadow-sm", gradientClass)}>
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{p.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4"><Badge variant={ty.variant}>{ty.label}</Badge></TableCell>
                    <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">{p.city ?? "—"}</TableCell>
                    <TableCell className="py-3 px-4"><Badge variant={st.variant} dot>{st.label}</Badge></TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {new Date(p.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {recent_partners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-[13px] text-muted-foreground">Henüz partner yok</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StatKpiCard({ title, value, icon: Icon, spark, delta, colorIdx = 0 }: {
  title: string; value: number; icon: React.ElementType; spark: number[];
  delta?: number | null; colorIdx?: number;
}) {
  const colors = CARD_COLORS[colorIdx % CARD_COLORS.length];
  const DeltaIcon = delta !== null && delta !== undefined
    ? delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
    : null;

  return (
    <div className="bg-card border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-primary/10 hover:border-primary/20">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", colors.bg, colors.border)}>
          <Icon className={cn("w-5 h-5", colors.text)} strokeWidth={1.8} />
        </div>
        {delta !== null && delta !== undefined && DeltaIcon && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            delta > 0 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            delta < 0 && "bg-red-500/10 text-red-600 dark:text-red-400",
            delta === 0 && "bg-muted text-muted-foreground",
          )}>
            <DeltaIcon className="w-3 h-3" />
            {delta > 0 ? "+" : ""}{delta}%
          </div>
        )}
      </div>
      <div className="text-[28px] font-bold text-foreground tracking-tight leading-none mb-1 tabular-nums">
        {value.toLocaleString("tr-TR")}
      </div>
      <div className={cn("text-[13px] text-muted-foreground", spark.length > 1 ? "mb-4" : "mb-0")}>
        {title}
      </div>
      {spark.length > 1 && <Sparkline values={spark} colorClass={colors.spark} id={`kpi-${colorIdx}`} />}
    </div>
  );
}
