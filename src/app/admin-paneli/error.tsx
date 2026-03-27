"use client";

import { useEffect } from "react";
import { T } from "@/components/admin/tokens";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
      <p style={{ color: T.textMuted, fontSize: "14px" }}>Bir hata oluştu: {error.message}</p>
      <button
        onClick={reset}
        style={{ padding: "9px 20px", background: T.accent, color: "#0f0f0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
