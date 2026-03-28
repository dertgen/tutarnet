"use client";

import { useEffect, useState } from "react";
import { BellRing, TrendingDown, Trash2, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PriceAlert {
  id: string;
  target_price: string;
  is_active: boolean;
  notified_at: string | null;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    prices: { price: string; partner: { name: string } }[];
  };
}

export default function FiyatAlarmlariPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setLoading(false); return; }
      setToken(session.access_token);
      try {
        const res = await fetch("/api/user/alarmlar", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts ?? []);
        }
      } catch { /* ağ hatası */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/user/alarmlar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", margin: 0 }}>Fiyat Alarmları</h2>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>
            Hedef fiyata düşünce bildirim alacağınız ürünler
          </p>
        </div>
        <span style={{ fontSize: "13px", color: "var(--muted-fg)", background: "var(--muted-bg)", padding: "4px 12px", borderRadius: "20px" }}>
          {loading ? "…" : `${alerts.filter(a => a.is_active).length} aktif alarm`}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted-fg)" }}>Yükleniyor…</div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed var(--border)", borderRadius: "12px" }}>
          <BellRing size={40} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--fg)", display: "block" }} />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Aktif fiyat alarmınız yok</p>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "20px" }}>
            Ürün sayfalarında hedef fiyat belirleyerek alarm oluşturabilirsiniz.
          </p>
          <Link href="/" style={{ padding: "10px 20px", background: "var(--fg)", color: "var(--bg)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            Ürünlere Göz At
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((a) => {
            const currentPrice = a.product.prices?.[0]?.price;
            const isTriggered = a.notified_at !== null;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", border: "1px solid var(--border)", borderRadius: "12px", background: isTriggered ? "#f0fdf4" : "var(--bg)" }}>
                <div style={{ width: "48px", height: "48px", background: "var(--muted-bg)", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                  {a.product.images?.[0] ? (
                    <img src={a.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <BellRing size={20} style={{ margin: "14px", opacity: 0.2, color: "var(--fg)" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--fg)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.product.name}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--muted-fg)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Bell size={11} />
                      Hedef: {Number(a.target_price).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </span>
                    {currentPrice && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: isTriggered ? "#16a34a" : undefined }}>
                        <TrendingDown size={11} />
                        Güncel: {Number(currentPrice).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isTriggered ? (
                    <span style={{ fontSize: "11px", background: "#dcfce7", color: "#16a34a", padding: "3px 8px", borderRadius: "20px", fontWeight: 600 }}>Tetiklendi</span>
                  ) : (
                    <span style={{ fontSize: "11px", background: "var(--muted-bg)", color: "var(--muted-fg)", padding: "3px 8px", borderRadius: "20px" }}>
                      {a.is_active ? <BellRing size={11} /> : <BellOff size={11} />}
                    </span>
                  )}
                  <button onClick={() => handleDelete(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }} title="Alarmı sil">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
