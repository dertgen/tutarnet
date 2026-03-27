"use client";

import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <p className="text-admin-text-muted text-sm">Bir hata oluştu: {error.message}</p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-admin-accent text-[#0f0f0f] border-none rounded-lg font-bold cursor-pointer text-[13px]"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
