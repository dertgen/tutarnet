"use client";

import { useEffect, useState } from "react";
import { Heart, TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface FavoriteProduct {
  id: string;
  name: string;
  images: string[];
  slug: string;
  prices: { price: string; partner: { name: string } }[];
}

export default function FavorilerPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setLoading(false); return; }
      try {
        const res = await fetch("/api/user/favoriler", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(data.favorites ?? []);
        }
      } catch { /* ağ hatası */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", margin: 0 }}>Favori Ürünlerim</h2>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>
            Takip ettiğiniz ürünler ve güncel fiyatları
          </p>
        </div>
        <span style={{ fontSize: "13px", color: "var(--muted-fg)", background: "var(--muted-bg)", padding: "4px 12px", borderRadius: "20px" }}>
          {loading ? "…" : `${favorites.length} ürün`}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted-fg)" }}>Yükleniyor…</div>
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed var(--border)", borderRadius: "12px" }}>
          <Heart size={40} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--fg)", display: "block" }} />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Henüz favori ürününüz yok</p>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "20px" }}>
            Ürün sayfalarındaki kalp ikonuna tıklayarak ürünleri favorilere ekleyebilirsiniz.
          </p>
          <Link href="/" style={{ padding: "10px 20px", background: "var(--fg)", color: "var(--bg)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
          {favorites.map((p) => {
            const price = p.prices?.[0]?.price;
            const img = p.images?.[0];
            return (
              <div key={p.id} style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", background: "var(--bg)" }}>
                <div style={{ height: "160px", background: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {img ? (
                    <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <Heart size={32} style={{ opacity: 0.15, color: "var(--fg)" }} />
                  )}
                </div>
                <div style={{ padding: "14px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "6px", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</p>
                  {price && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <TrendingDown size={14} color="#22c55e" />
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--fg)" }}>
                        {Number(price).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </span>
                    </div>
                  )}
                  <Link href={`/urunler/${p.slug}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
                    Ürüne Git <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
