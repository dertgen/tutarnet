"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="tr">
      <body style={{ background: "#0a0a0a", color: "#f1f1f1", fontFamily: "system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Beklenmedik bir hata oluştu</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
            Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
          </p>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", background: "#00e5bc", color: "#0f0f0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
