import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";

const demoProduct = {
  id: "1",
  name: "Apple iPhone 15 Pro 256GB Natural Titanium",
  slug: "apple-iphone-15-pro-256gb",
  brand: "Apple",
  description: "iPhone 15 Pro, titanyum tasarım, A17 Pro çip, özelleştirilebilir Action düğmesi ve daha güçlü kamera sistemiyle geliyor.",
  category: { name: "Telefon", slug: "telefon" },
  prices: [
    { id: "1", store: { name: "Trendyol", slug: "trendyol", trustScore: 4.5 }, price: 64999, originalPrice: 74999, url: "#", inStock: true },
    { id: "2", store: { name: "Hepsiburada", slug: "hepsiburada", trustScore: 4.3 }, price: 65999, originalPrice: 72999, url: "#", inStock: true },
    { id: "3", store: { name: "Amazon", slug: "amazon", trustScore: 4.7 }, price: 67299, originalPrice: null, url: "#", inStock: true },
    { id: "4", store: { name: "n11", slug: "n11", trustScore: 4.1 }, price: 68999, originalPrice: 74999, url: "#", inStock: false },
  ],
  specs: {
    "Ekran": "6.1 inç Super Retina XDR",
    "İşlemci": "A17 Pro",
    "RAM": "8 GB",
    "Depolama": "256 GB",
    "Kamera": "48 MP + 12 MP + 12 MP",
    "Batarya": "4422 mAh",
    "5G": "Evet",
    "Face ID": "Evet",
  },
  averagePrice: 68999,
  lowestPrice: 64999,
  highestPrice: 74999,
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = demoProduct;

  const lowestPriceStore = product.prices.reduce((min, p) => p.price < min.price ? p : min);
  const priceStatus = lowestPriceStore.price < product.averagePrice ? "good" : "average";

  return (
    <PageLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Ana Sayfa</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/kategori/telefon" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>{product.category.name}</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--fg)" }}>{product.brand}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "48px" }}>
          <div>
            <div style={{
              width: "100%",
              height: "400px",
              backgroundColor: "var(--muted-bg)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "80px",
              marginBottom: "16px",
            }}>
              📱
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "40px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  height: "80px",
                  backgroundColor: "var(--muted-bg)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                }}>
                  📷
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.3px", color: "var(--fg)" }}>
                Teknik Özellikler
              </h2>
              <div style={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                overflow: "hidden",
              }}>
                {Object.entries(product.specs).map(([key, value], index, arr) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderBottom: index < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "var(--muted-fg)" }}>{key}</span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.3px", color: "var(--fg)" }}>
                Ürün Açıklaması
              </h2>
              <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--muted-fg)" }}>
                {product.description}
              </p>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: "var(--muted-fg)", marginBottom: "4px" }}>
                {product.brand}
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.3px", color: "var(--fg)" }}>
                {product.name}
              </h1>
            </div>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: priceStatus === "good" ? "#ecfdf5" : "#fef3c7",
              color: priceStatus === "good" ? "#059669" : "#d97706",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "20px",
            }}>
              {priceStatus === "good" ? "+ İyi Fiyat" : "o Ortalama Fiyat"}
            </div>

            <div style={{
              border: "1px solid var(--border)",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "20px",
              backgroundColor: "var(--bg)",
            }}>
              <div style={{
                padding: "14px 16px",
                backgroundColor: "var(--muted-bg)",
                borderBottom: "1px solid var(--border)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--fg)",
              }}>
                Fiyat Karşılaştırma
              </div>
              {product.prices.map((priceInfo) => (
                <div
                  key={priceInfo.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: priceInfo.price === lowestPriceStore.price ? "rgba(37, 99, 235, 0.03)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "var(--muted-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--fg)",
                    }}>
                      {priceInfo.store.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)" }}>{priceInfo.store.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>
                        ⭐ {priceInfo.store.trustScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>
                      {priceInfo.price.toLocaleString("tr-TR")} TL
                    </div>
                    {priceInfo.originalPrice && (
                      <div style={{ fontSize: "12px", color: "var(--muted-fg)", textDecoration: "line-through" }}>
                        {priceInfo.originalPrice.toLocaleString("tr-TR")}
                      </div>
                    )}
                    {!priceInfo.inStock && (
                      <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>
                        Stokta Yok
                      </div>
                    )}
                  </div>
                  {priceInfo.inStock && (
                    <a
                      href={priceInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-fg)",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Git
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}>
              <div style={{ textAlign: "center", padding: "16px 8px", backgroundColor: "var(--muted-bg)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--muted-fg)", marginBottom: "4px" }}>En Düşük</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#059669" }}>
                  {product.lowestPrice.toLocaleString("tr-TR")} TL
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "16px 8px", backgroundColor: "var(--muted-bg)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--muted-fg)", marginBottom: "4px" }}>Ortalama</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--fg)" }}>
                  {product.averagePrice.toLocaleString("tr-TR")} TL
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "16px 8px", backgroundColor: "var(--muted-bg)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--muted-fg)", marginBottom: "4px" }}>En Yüksek</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#dc2626" }}>
                  {product.highestPrice.toLocaleString("tr-TR")} TL
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={lowestPriceStore.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px",
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-fg)",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                En Düşük Fiyata Git
              </a>
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: "var(--bg)",
                  color: "var(--fg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                🔔 Fiyat Düşünce Bildir
              </button>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "12px" }}>Paylaş:</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["Twitter", "Facebook", "WhatsApp"].map((platform) => (
                  <button
                    key={platform}
                    style={{
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: "var(--muted-bg)",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "var(--fg)",
                    }}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
