"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";

export default function MağazaGirişPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Mağaza girişi yakında aktif olacaktır.");
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.5px", textAlign: "center", color: "var(--fg)" }}>
          Mağaza Girişi
        </h1>
        <p style={{ fontSize: "15px", color: "var(--muted-fg)", marginBottom: "32px", textAlign: "center" }}>
          Hesabınıza giriş yapın ve mağazanızı yönetin.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div style={{
              padding: "12px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#dc2626",
            }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--fg)" }}>
              E-posta
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--fg)" }}>
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              display: "inline-block",
              padding: "13px 32px",
              backgroundColor: "var(--primary)",
              color: "var(--primary-fg)",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            Giriş Yap
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--muted-fg)" }}>
          Hala mağaza açmadınız mı?{" "}
          <Link href="/magaza-ol" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Başvuru yapın
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
