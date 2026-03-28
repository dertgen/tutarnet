"use client";

import { useEffect } from "react";

export default function MagazaPaneliError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MagazaPaneliError]", error);
  }, [error]);

  return (
    <div style={{ padding: "48px", textAlign: "center" }}>
      <p style={{ color: "var(--muted-fg)", marginBottom: "16px", fontSize: "14px" }}>
        Hata: {error.message}
      </p>
      <button
        onClick={reset}
        style={{ padding: "9px 20px", background: "var(--teal)", color: "var(--dark-text)", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
