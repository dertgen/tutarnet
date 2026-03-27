import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      <div style={{ textAlign: "center", padding: "32px" }}>
        <div style={{ fontSize: "80px", fontWeight: 900, color: "var(--teal)", lineHeight: 1, marginBottom: "16px" }}>404</div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "var(--fg)" }}>Sayfa bulunamadı</h1>
        <p style={{ color: "var(--muted-fg)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6, maxWidth: "380px" }}>
          Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "10px 24px", background: "var(--teal)", color: "var(--dark-text)", borderRadius: "8px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
            Ana Sayfaya Dön
          </Link>
          <Link href="/ara" style={{ padding: "10px 24px", background: "var(--muted-bg)", color: "var(--fg)", borderRadius: "8px", fontWeight: 600, textDecoration: "none", fontSize: "14px" }}>
            Ürün Ara
          </Link>
        </div>
      </div>
    </div>
  );
}
