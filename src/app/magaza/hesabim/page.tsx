"use client";

import { useEffect, useState } from "react";
import { MousePointerClick, PackageSearch, TrendingUp, Package, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PartnerStats {
  totalClicks: number;
  totalViews: number;
  activeProducts: number;
  activeServices: number;
  totalAppointments: number;
  lastSync: string | null;
}

interface PartnerInfo {
  id: string;
  name: string;
  type: string;
  status: string;
  subscription_status: string;
  _count: {
    products: number;
    services: number;
    appointments: number;
  };
}

export default function MagazaPaneliPage() {
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${session.access_token}` };

      try {
        const [meRes, statsRes] = await Promise.all([
          fetch("/api/magaza/me", { headers }),
          fetch("/api/magaza/stats", { headers }),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          setPartner(data.partner);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch {
        // Ağ hatası — boş state ile devam et
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatNumber = (n: number) => n.toLocaleString("tr-TR");

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>

        <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "border-color 0.2s", cursor: "default" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 500 }}>Toplam Yönlendirme</div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(0, 229, 188, 0.15)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MousePointerClick size={18} />
            </div>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-1px" }}>
            {loading ? "—" : formatNumber(stats?.totalClicks ?? 0)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span style={{ color: "var(--muted-fg)" }}>Toplam mağaza yönlendirmesi</span>
          </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "border-color 0.2s", cursor: "default" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 500 }}>Aktif Ürünler</div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PackageSearch size={18} />
            </div>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-1px" }}>
            {loading ? "—" : formatNumber(partner?._count.products ?? 0)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            {stats?.lastSync ? (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--muted-fg)" }}>
                <RefreshCw size={12} />
                {new Date(stats.lastSync).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--muted-fg)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--teal)" }}></span>
                Senkronize
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "border-color 0.2s", cursor: "default" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 500 }}>Toplam Görüntülenme</div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-1px" }}>
            {loading ? "—" : formatNumber(stats?.totalViews ?? 0)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span style={{ color: "var(--muted-fg)" }}>Mağaza profil görüntülemesi</span>
          </div>
        </div>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", overflow: "hidden" }}>

        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)" }}>Mağaza Özeti</h2>
            <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>Güncel mağaza durumu ve istatistikler.</div>
          </div>
          <Link href="/m/hesabim/analitik" style={{ fontSize: "13px", fontWeight: 600, color: "var(--teal)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
            Detaylı Analitik <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--muted-bg)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "14px 24px", color: "var(--muted-fg)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Metrik</th>
                <th style={{ padding: "14px 24px", color: "var(--muted-fg)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Değer</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Toplam Ürün", icon: <Package size={16} />, value: loading ? "—" : formatNumber(partner?._count.products ?? 0) },
                { label: "Aktif Hizmet", icon: <PackageSearch size={16} />, value: loading ? "—" : formatNumber(partner?._count.services ?? 0) },
                { label: "Toplam Randevu", icon: <TrendingUp size={16} />, value: loading ? "—" : formatNumber(partner?._count.appointments ?? 0) },
                { label: "Mağaza Durumu", icon: null, value: loading ? "—" : (
                  <span style={{
                    display: "inline-flex",
                    padding: "4px 10px",
                    backgroundColor: partner?.status === "ACTIVE" ? "rgba(0, 229, 188, 0.15)" : "var(--muted-bg)",
                    color: partner?.status === "ACTIVE" ? "var(--teal)" : "var(--muted-fg)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}>
                    {partner?.status === "ACTIVE" ? "Aktif" :
                     partner?.status === "PENDING" ? "Onay Bekliyor" :
                     partner?.status === "SUSPENDED" ? "Askıya Alındı" : partner?.status ?? "—"}
                  </span>
                )},
                { label: "Abonelik", icon: null, value: loading ? "—" : (
                  <span style={{
                    display: "inline-flex",
                    padding: "4px 10px",
                    backgroundColor: partner?.subscription_status === "ACTIVE" ? "rgba(59, 130, 246, 0.1)" : "var(--muted-bg)",
                    color: partner?.subscription_status === "ACTIVE" ? "#3b82f6" : "var(--muted-fg)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}>
                    {partner?.subscription_status === "ACTIVE" ? "Aktif" :
                     partner?.subscription_status === "TRIAL" ? "Deneme" :
                     partner?.subscription_status === "EXPIRED" ? "Süresi Doldu" : partner?.subscription_status ?? "—"}
                  </span>
                )},
              ].map((row, index) => (
                <tr
                  key={index}
                  style={{ borderBottom: index < 4 ? "1px solid var(--border)" : "none", transition: "background-color 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--muted-bg)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg)", fontWeight: 500 }}>
                      {row.icon && <span style={{ color: "var(--muted-fg)" }}>{row.icon}</span>}
                      {row.label}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--fg)", fontWeight: 700, textAlign: "right" }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
