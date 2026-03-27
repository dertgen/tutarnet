"use client";

import { useEffect, useState } from "react";
import { MousePointerClick, Eye, Package, Calendar, TrendingUp, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalClicks: number;
  totalViews: number;
  activeProducts: number;
  activeServices: number;
  totalAppointments: number;
  lastSync: string | null;
}

export default function MagazaAnalitikPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setLoading(false); return; }
      const res = await fetch("/api/magaza/stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      } else {
        setError("Veriler yüklenemedi");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fmt = (n: number) => n.toLocaleString("tr-TR");

  const cards = stats
    ? [
        { label: "Toplam Tıklama", value: fmt(stats.totalClicks), icon: MousePointerClick, color: "#6366f1", bg: "#ede9fe" },
        { label: "Sayfa Görüntüleme", value: fmt(stats.totalViews), icon: Eye, color: "#8b5cf6", bg: "#ede9fe" },
        { label: "Aktif Ürün", value: fmt(stats.activeProducts), icon: Package, color: "#0ea5e9", bg: "#e0f2fe" },
        { label: "Randevu", value: fmt(stats.totalAppointments), icon: Calendar, color: "#22c55e", bg: "#dcfce7" },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", margin: 0 }}>Tıklama & Analitik</h2>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>
            {stats?.lastSync
              ? `Son güncelleme: ${new Date(stats.lastSync).toLocaleString("tr-TR")}`
              : "Mağazanızın performans metrikleri"}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "var(--muted-bg)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", cursor: "pointer", color: "var(--fg)" }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Yenile
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--muted-fg)" }}>Yükleniyor…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#ef4444" }}>{error}</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {cards.map((c, i) => (
              <div key={i} style={{ padding: "20px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <c.icon size={18} color={c.color} />
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--muted-fg)" }}>{c.label}</span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.5px" }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <TrendingUp size={18} color="#6366f1" />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)", margin: 0 }}>Performans Özeti</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted-fg)", lineHeight: 1.6 }}>
              Mağazanız toplam <strong style={{ color: "var(--fg)" }}>{fmt(stats?.totalClicks ?? 0)}</strong> tıklama ve{" "}
              <strong style={{ color: "var(--fg)" }}>{fmt(stats?.totalViews ?? 0)}</strong> görüntüleme aldı.
              Detaylı analitik için ilerleyen dönemde grafik tabanlı raporlama eklenecektir.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
