"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactElement } from "react";
import { Link as LinkIcon, RefreshCw, CheckCircle, AlertCircle, Clock, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Feed {
  id: string;
  feed_url: string;
  feed_format: string;
  sync_frequency: string;
  fetch_status: string;
  last_fetch: string | null;
  last_sync_count: number;
  error_message: string | null;
  is_active: boolean;
  created_at: string;
  _count: { items: number };
}

export default function EntegrasyonPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedFormat, setNewFeedFormat] = useState("google_shopping_xml");
  const [syncingFeedId, setSyncingFeedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const tokenRef = useRef<string | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (tokenRef.current) return tokenRef.current;
    const { data: { session } } = await supabase.auth.getSession();
    tokenRef.current = session?.access_token ?? null;
    return tokenRef.current;
  }, []);

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }, [getToken]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadFeeds = useCallback(async (pid?: string) => {
    const id = pid ?? partnerId;
    if (!id) return;
    const headers = await authHeaders();
    try {
      const res = await fetch(`/api/feeds?store_id=${id}`, { headers });
      const data = await res.json();
      setFeeds(data.feeds ?? []);
    } catch {
      showMsg("error", "Feed listesi yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [partnerId, authHeaders]);

  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      const res = await fetch("/api/magaza/me", { headers });
      if (res.ok) {
        const data = await res.json();
        setPartnerId(data.partner.id);
        loadFeeds(data.partner.id);
      } else {
        showMsg("error", "Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
      }
    })();
  }, []);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.trim() || !partnerId) return;
    const headers = await authHeaders();
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers,
        body: JSON.stringify({ partner_id: partnerId, feed_url: newFeedUrl, feed_format: newFeedFormat }),
      });
      if (res.ok) {
        showMsg("success", "Feed başarıyla eklendi");
        setNewFeedUrl("");
        setShowAddForm(false);
        loadFeeds();
      } else {
        const d = await res.json();
        showMsg("error", d.error ?? "Feed eklenemedi");
      }
    } catch {
      showMsg("error", "Bir hata oluştu");
    }
  };

  const handleSync = async (feedId: string) => {
    setSyncingFeedId(feedId);
    const headers = await authHeaders();
    try {
      const res = await fetch(`/api/feeds/${feedId}/sync`, { method: "POST", headers });
      const data = await res.json();
      if (data.success) {
        showMsg("success", `Senkronizasyon tamamlandı: ${data.result?.totalItems ?? 0} ürün`);
        loadFeeds();
      } else {
        showMsg("error", data.message ?? "Senkronizasyon hatası");
      }
    } catch {
      showMsg("error", "Senkronizasyon sırasında hata oluştu");
    } finally {
      setSyncingFeedId(null);
    }
  };

  const handleDelete = async (feedId: string) => {
    if (!confirm("Bu feed'i silmek istediğinize emin misiniz?")) return;
    const headers = await authHeaders();
    try {
      const res = await fetch(`/api/feeds/${feedId}`, { method: "DELETE", headers });
      if (res.ok) {
        showMsg("success", "Feed silindi");
        setFeeds((prev) => prev.filter((f) => f.id !== feedId));
      } else {
        showMsg("error", "Feed silinemedi");
      }
    } catch {
      showMsg("error", "Bir hata oluştu");
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString("tr-TR") : "Hiç senkronize edilmedi";

  const STATUS_CONFIG: Record<string, { icon: ReactElement; label: string; color: string }> = {
    success: { icon: <CheckCircle size={15} />, label: "Başarılı", color: "#16a34a" },
    error:   { icon: <AlertCircle size={15} />, label: "Hata", color: "#dc2626" },
    partial: { icon: <AlertCircle size={15} />, label: "Kısmi", color: "#d97706" },
    pending: { icon: <Clock size={15} />, label: "Bekliyor", color: "#64748b" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", margin: 0 }}>XML Entegrasyonu</h2>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginTop: "4px" }}>Ürün feed'lerinizi ekleyin ve senkronize edin</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "var(--fg)", color: "var(--bg)", borderRadius: "8px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Yeni Feed Ekle
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: message.type === "success" ? "#dcfce7" : "#fee2e2", border: `1px solid ${message.type === "success" ? "#16a34a" : "#dc2626"}`, color: message.type === "success" ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddFeed} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px", background: "var(--muted-bg)", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Feed URL</label>
            <input type="url" value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} placeholder="https://magazam.com/google-shopping.xml" required
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Format</label>
            <select value={newFeedFormat} onChange={(e) => setNewFeedFormat(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: "14px", outline: "none", cursor: "pointer" }}
            >
              <option value="google_shopping_xml">Google Shopping XML</option>
              <option value="google_shopping_csv">Google Shopping CSV</option>
              <option value="google_shopping_tsv">Google Shopping TSV</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ padding: "10px 22px", background: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
            <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: "10px 20px", background: "transparent", color: "var(--fg)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>İptal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--muted-fg)" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
          Yükleniyor…
        </div>
      ) : feeds.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px", border: "1px dashed var(--border)", borderRadius: "12px" }}>
          <LinkIcon size={40} style={{ margin: "0 auto 16px", opacity: 0.2, color: "var(--fg)", display: "block" }} />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--fg)", marginBottom: "8px" }}>Henüz feed eklenmemiş</p>
          <p style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "20px" }}>Google Shopping XML, CSV veya TSV formatındaki feed URL'inizi ekleyin.</p>
          <button onClick={() => setShowAddForm(true)} style={{ padding: "10px 20px", background: "var(--fg)", color: "var(--bg)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Feed Ekle</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {feeds.map((feed) => {
            const st = STATUS_CONFIG[feed.fetch_status] ?? STATUS_CONFIG.pending;
            const syncing = syncingFeedId === feed.id;
            return (
              <div key={feed.id} style={{ padding: "18px 20px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--fg)", margin: "0 0 6px", wordBreak: "break-all" }}>{feed.feed_url}</p>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--muted-fg)", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ textTransform: "uppercase", fontWeight: 500 }}>{feed.feed_format.replace(/_/g, " ")}</span>
                      <span>·</span>
                      <span>{feed._count.items.toLocaleString("tr-TR")} ürün</span>
                      <span>·</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: st.color, fontWeight: 600 }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => handleSync(feed.id)}
                      disabled={syncing}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "var(--muted-bg)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: syncing ? "not-allowed" : "pointer", opacity: syncing ? 0.7 : 1, color: "var(--fg)" }}
                    >
                      <RefreshCw size={14} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
                      {syncing ? "Senkronize…" : "Sync"}
                    </button>
                    <button onClick={() => handleDelete(feed.id)} style={{ padding: "8px 10px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", color: "#dc2626" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "var(--muted-bg)", borderRadius: "8px", fontSize: "12px", color: "var(--muted-fg)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span><strong style={{ color: "var(--fg)" }}>Son Sync:</strong> {formatDate(feed.last_fetch)}</span>
                  {feed.last_sync_count > 0 && <span><strong style={{ color: "var(--fg)" }}>Son İşlem:</strong> {feed.last_sync_count} ürün</span>}
                  {feed.error_message && <span style={{ color: "#dc2626" }}><strong>Hata:</strong> {feed.error_message}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
