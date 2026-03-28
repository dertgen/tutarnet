"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Users, ShoppingBag, Calendar, AlertCircle, ArrowUpRight, RefreshCw, TrendingUp } from "lucide-react";
import { LoadingSpinner, ErrorState } from "@/components/admin/feedback";
import { Badge } from "@/components/admin/badge";
import type { StatsResponse } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Sparkline({ values, colorClass }: { values: number[]; colorClass: string }) {
  if (values.length < 2) return null;
  const W = 88, H = 36;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const area = `0,${H} ${pts.join(" ")} ${W},${H}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible block">
      <defs>
        <linearGradient id={`sg-sparkline`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={`${colorClass} opacity-25`} stopColor="currentColor" />
          <stop offset="100%" className={`${colorClass} opacity-0`} stopColor="currentColor" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-sparkline)`} />
      <polyline points={pts.join(" ")} fill="none" className={colorClass} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ProgressBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-[800ms] ${colorClass}`} style={{ width: `${pct}%` }} />
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

  const statCards = [
    { title: "Toplam Partner",   value: kpis.total_partners,    icon: Store,       link: "/admin/hesabim/partnerler",   spark: partner_trend.map(p => p.count) },
    { title: "Toplam Kullanıcı", value: kpis.total_users,       icon: Users,       link: "/admin/hesabim/kullanicilar", spark: user_trend.map(p => p.count) },
    { title: "Toplam Ürün",      value: kpis.total_products,    icon: ShoppingBag, link: "/admin/hesabim/partnerler",   spark: [] },
    { title: "Toplam Randevu",   value: kpis.total_appointments,icon: Calendar,    link: "/admin/hesabim/partnerler",   spark: [] },
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
            <Link href="/admin/hesabim/partnerler?status=PENDING">
              İncele <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <Link key={i} href={c.link} className="outline-none focus:ring-2 focus:ring-ring rounded-xl block">
            <StatKpiCard {...c} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card shadow-sm border-admin-border rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Partner Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "E-Ticaret",       value: kpis.ecommerce_partners, total: kpis.total_partners },
              { label: "Hizmet",          value: kpis.service_partners,   total: kpis.total_partners },
              { label: "Aktif",           value: kpis.active_partners,    total: kpis.total_partners },
              { label: "Onay Bekliyor",   value: kpis.pending_partners,   total: kpis.total_partners },
            ].map((seg, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="text-muted-foreground font-medium">{seg.label}</span>
                  <span className="font-semibold">{seg.value}<span className="text-muted-foreground font-normal"> / {seg.total}</span></span>
                </div>
                <ProgressBar value={seg.value} max={seg.total || 1} colorClass="bg-admin-accent" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-admin-border rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              Platform Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {[
              { label: "Aktif Partner",      value: kpis.active_partners },
              { label: "Toplam Hizmet",      value: kpis.total_services },
              { label: "Açık Rapor",         value: kpis.open_reports },
              { label: "Bu Ay Yeni Üye",     value: kpis.new_users_this_month },
            ].map((item, i, w) => (
              <div key={i} className={`flex justify-between items-center py-2.5 ${i < w.length - 1 ? "border-b" : ""}`}>
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-base font-bold">{item.value.toLocaleString("tr-TR")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {pending_reports.length > 0 && (
        <Card className="bg-card shadow-sm border-admin-border rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold">Bekleyen Raporlar</CardTitle>
            <Link href="/admin/hesabim/moderasyon" className="text-xs font-semibold text-admin-accent flex items-center gap-1 hover:underline">
              Tümünü Gör <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col">
            {pending_reports.map((r, i, arr) => (
              <div key={r.id} className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b" : ""}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${r.severity === "HIGH" ? "bg-red-500" : r.severity === "MEDIUM" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-sm font-medium truncate">{r.reason}</span>
                  <span className="text-xs text-muted-foreground truncate">{r.target_label}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card shadow-sm border-admin-border rounded-xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b">
          <div>
            <h3 className="text-sm font-bold m-0 text-foreground">Son Eklenen Partnerler</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Gerçek zamanlı veriler</p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex text-admin-accent hover:text-admin-accent hover:bg-admin-accent/10 border-admin-accent/20 gap-1.5 h-8">
            <Link href="/admin/hesabim/partnerler">
              Tümünü Gör <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
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
              {recent_partners.map((p) => {
                const st = STATUS_MAP[p.status] ?? { label: p.status, variant: "gray" as const };
                const ty = TYPE_MAP[p.type] ?? { label: p.type, variant: "gray" as const };
                return (
                  <TableRow key={p.id}>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-admin-accent/10 flex items-center justify-center border border-admin-accent/20 shrink-0 text-admin-accent font-extrabold text-sm uppercase">
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground truncate">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{p.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4"><Badge variant={ty.variant}>{ty.label}</Badge></TableCell>
                    <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">{p.city ?? "—"}</TableCell>
                    <TableCell className="py-3 px-4"><Badge variant={st.variant} dot>{st.label}</Badge></TableCell>
                    <TableCell className="py-3 px-4 text-[12px] text-muted-foreground whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
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

function StatKpiCard({ title, value, icon: Icon, spark }: { title: string; value: number; icon: React.ElementType; spark: number[] }) {
  return (
    <div className="bg-card border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:bg-accent/5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-admin-accent/10 border border-admin-accent/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-admin-accent" strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-[28px] font-bold text-foreground tracking-tight leading-none mb-1">
        {value.toLocaleString("tr-TR")}
      </div>
      <div className={`text-[13px] text-muted-foreground ${spark.length > 1 ? "mb-4" : "mb-0"}`}>
        {title}
      </div>
      {spark.length > 1 && <Sparkline values={spark} colorClass="text-admin-accent" />}
    </div>
  );
}
