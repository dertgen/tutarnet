"use client";

import { useEffect, useState } from "react";
import { Package2, Heart, BellRing, Eye, ChevronRight, TrendingDown } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface RecentAlert {
  id: string;
  target_price: string;
  notified_at: string | null;
  created_at: string;
  product: {
    id: string;
    name: string;
    images: string[];
    prices: { price: string }[];
  };
}

interface UserStats {
  alerts: number;
  triggered: number;
  favorites: number;
  viewed: number;
}

export default function HesapPage() {
  const [stats, setStats] = useState<UserStats>({ alerts: 0, triggered: 0, favorites: 0, viewed: 0 });
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentAlerts(data.recentAlerts ?? []);
        }
      } catch {
        // Ağ hatası — boş state ile devam et
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>

        <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 500 }}>Fiyat Alarmları</div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(234, 179, 8, 0.1)", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BellRing size={18} />
            </div>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-1px" }}>
            {loading ? "—" : stats.alerts}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--teal)", fontWeight: 600 }}>
              {loading ? "" : `${stats.triggered} Üründe`}
            </span>
            <span style={{ color: "var(--muted-fg)" }}>{!loading && stats.triggered > 0 ? "fiyat düştü" : "aktif alarm"}</span>
          </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 500 }}>Favori Ürünler</div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={18} />
            </div>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-1px" }}>
            {loading ? "—" : stats.favorites}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span style={{ color: "var(--muted-fg)" }}>Koleksiyonda saklanıyor</span>
          </div>
        </div>

        <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 500 }}>İncelenen Ürünler</div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Eye size={18} />
            </div>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-1px" }}>
            {loading ? "—" : stats.viewed}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span style={{ color: "var(--muted-fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Son 30 gün içinde</span>
          </div>
        </div>

      </div>

      <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)" }}>Son Fiyat Hareketleri</h2>
            <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>Takip ettiğiniz ürünlerdeki anlık değişimler.</div>
          </div>
          <Link href="/kullanici/hesabim/fiyat-alarmlari" style={{ fontSize: "13px", fontWeight: 600, color: "var(--teal)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
            Tümünü Gör <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--muted-fg)", fontSize: "14px" }}>
              Yükleniyor...
            </div>
          ) : recentAlerts.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--muted-fg)", fontSize: "14px" }}>
              <BellRing size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p>Henüz aktif fiyat alarmınız bulunmuyor.</p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>Ürün sayfalarından alarm kurarak fiyat düşüşlerini takip edebilirsiniz.</p>
            </div>
          ) : (
            recentAlerts.map((alert, index) => {
              const currentPrice = alert.product.prices[0]?.price
                ? parseFloat(alert.product.prices[0].price)
                : null;
              const targetPrice = parseFloat(alert.target_price);
              const isTriggered = alert.notified_at !== null;
              const imgSrc = alert.product.images?.[0] ?? null;

              return (
                <div
                  key={alert.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    borderBottom: index < recentAlerts.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--muted-bg)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "10px", backgroundColor: "var(--muted-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-fg)", overflow: "hidden" }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={alert.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Package2 size={24} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--fg)", marginBottom: "4px" }}>
                        {alert.product.name}
                      </div>
                      {isTriggered ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--teal)", fontWeight: 600 }}>
                          <TrendingDown size={14} /> Hedef fiyata ulaştı!
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>
                          Hedef: {targetPrice.toLocaleString("tr-TR")} TL
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {currentPrice !== null && (
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.5px" }}>
                        {currentPrice.toLocaleString("tr-TR")} TL
                      </div>
                    )}
                    <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "2px" }}>
                      Alarm: {targetPrice.toLocaleString("tr-TR")} TL
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
