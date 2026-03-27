"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package, Search, RefreshCw, Link as LinkIcon,
  ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  images: string[];
  barcode: string | null;
  updated_at: string;
  category: { name: string } | null;
  prices: { price: string; currency: string }[];
}

interface Pagination {
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async (pg: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setLoading(false); return; }
      const params = new URLSearchParams({ sayfa: String(pg), ...(q && { q }) });
      const res = await fetch(`/api/magaza/urunler?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
        setPagination(data.pagination ?? null);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Ürünler yüklenemedi");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const fmt = (price: string, currency = "TRY") =>
    Number(price).toLocaleString("tr-TR", { style: "currency", currency });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", margin: 0 }}>Ürün Kataloğu</h2>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>
            {pagination ? `${pagination.total.toLocaleString("tr-TR")} ürün` : "XML feed üzerinden senkronize edilir"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => load(page, search)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--muted-bg)", fontSize: "13px", cursor: "pointer", color: "var(--fg)" }}
          >
            <RefreshCw size={14} /> Yenile
          </button>
          <Link
            href="/magaza-paneli/entegrasyon"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "var(--fg)", color: "var(--bg)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
          >
            <LinkIcon size={14} /> XML Feed Ekle
          </Link>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-fg)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı, marka veya barkod ara…"
            style={{ width: "100%", padding: "9px 14px 9px 36px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", background: "var(--bg)", color: "var(--fg)", boxSizing: "border-box" }}
          />
        </div>
        <button type="submit" style={{ padding: "9px 18px", background: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Ara</button>
      </form>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--muted-fg)" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
          Yükleniyor…
        </div>
      ) : error ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px", border: "1px solid #fecaca", borderRadius: "10px", background: "#fee2e2", color: "#dc2626" }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: "14px" }}>{error}</span>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed var(--border)", borderRadius: "12px" }}>
          <Package size={40} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--fg)", display: "block" }} />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>
            {search ? "Arama sonucu bulunamadı" : "Henüz ürün yok"}
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "20px" }}>
            {search ? "Farklı anahtar kelimeler deneyin." : "XML feed ekleyerek ürünlerinizi otomatik senkronize edin."}
          </p>
          {!search && (
            <Link href="/magaza-paneli/entegrasyon" style={{ padding: "10px 20px", background: "var(--fg)", color: "var(--bg)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              XML Feed Ekle
            </Link>
          )}
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--muted-bg)", borderBottom: "1px solid var(--border)" }}>
                  {["Ürün", "Marka", "Kategori", "Fiyat", "Güncelleme"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--muted-fg)", letterSpacing: "0.03em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const price = p.prices[0];
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted-bg)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", background: "var(--muted-bg)", borderRadius: "6px", overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)" }}>
                            {p.images[0]
                              ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              : <Package size={16} style={{ margin: "10px", opacity: 0.2, color: "var(--fg)" }} />
                            }
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--fg)", margin: 0, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                            {p.barcode && <p style={{ fontSize: "11px", color: "var(--muted-fg)", margin: "2px 0 0", fontFamily: "monospace" }}>{p.barcode}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "var(--muted-fg)" }}>{p.brand ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "var(--muted-fg)" }}>{p.category?.name ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 600, color: "var(--fg)" }}>
                        {price ? fmt(price.price, price.currency) : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "var(--muted-fg)" }}>
                        {new Date(p.updated_at).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
              <span style={{ fontSize: "13px", color: "var(--muted-fg)" }}>
                {((page - 1) * pagination.take + 1)}–{Math.min(page * pagination.take, pagination.total)} / {pagination.total.toLocaleString("tr-TR")} ürün
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ padding: "7px 12px", border: "1px solid var(--border)", borderRadius: "7px", background: "var(--bg)", cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.4 : 1, color: "var(--fg)" }}
                >
                  <ChevronLeft size={15} />
                </button>
                <span style={{ padding: "7px 14px", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "13px", fontWeight: 600, color: "var(--fg)" }}>{page}</span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ padding: "7px 12px", border: "1px solid var(--border)", borderRadius: "7px", background: "var(--bg)", cursor: page >= pagination.totalPages ? "default" : "pointer", opacity: page >= pagination.totalPages ? 0.4 : 1, color: "var(--fg)" }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
