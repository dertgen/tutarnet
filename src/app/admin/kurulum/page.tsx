"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function KurulumPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "needed" | "done" | "error">("checking");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/kurulum")
      .then((r) => r.json())
      .then((d) => setStatus(d.setupRequired ? "needed" : "done"))
      .catch(() => setStatus("error"));
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/kurulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Kurulum başarısız");
        return;
      }

      setStatus("done");
      setTimeout(() => router.push("/admin/hesabim"), 1500);
    } catch {
      setMessage("Beklenmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#0f1117",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "#1a1d27",
    border: "1px solid #2a2d3a",
    borderRadius: 16,
    padding: "2.5rem",
    width: "100%",
    maxWidth: 440,
    textAlign: "center",
  };

  if (status === "checking") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <Loader2 size={40} color="#6366f1" style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#8b8fa8" }}>Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ color: "#f1f5f9", marginBottom: 8 }}>Kurulum Tamamlandı</h2>
          <p style={{ color: "#8b8fa8" }}>Admin paneline yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ color: "#f1f5f9", marginBottom: 8 }}>Bağlantı Hatası</h2>
          <p style={{ color: "#8b8fa8" }}>Sunucuya bağlanılamadı. Sayfayı yenileyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <Shield size={32} color="#6366f1" />
        </div>
        <h1 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
          İlk Kurulum
        </h1>
        <p style={{ color: "#8b8fa8", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          Henüz hiç admin hesabı yok. Giriş yapmış hesabınız otomatik olarak
          <strong style={{ color: "#6366f1" }}> Süper Admin</strong> yetkisiyle atanacak.
        </p>

        <form onSubmit={handleSetup} style={{ textAlign: "left" }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: 6, fontWeight: 500 }}>
            Görünen Ad
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Süper Admin"
            required
            style={{ width: "100%", padding: "0.625rem 0.875rem", background: "#12141f", border: "1px solid #2a2d3a", borderRadius: 8, color: "#f1f5f9", fontSize: "0.9rem", outline: "none", marginBottom: "1.25rem", boxSizing: "border-box" }}
          />

          {message && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem" }}>{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", background: loading ? "#4338ca" : "#6366f1", border: "none", borderRadius: 8, color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Kuruluyor..." : "Süper Admin Olarak Kur"}
          </button>
        </form>

        <p style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: "1.5rem" }}>
          Bu sayfa yalnızca sistem hiç admin kaydı yokken erişilebilir.
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
