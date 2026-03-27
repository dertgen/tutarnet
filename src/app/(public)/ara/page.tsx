import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";

const searchResults = [
  { id: "1", name: "iPhone 15 Pro 256GB", brand: "Apple", price: 74999, originalPrice: 79999, storeCount: 12 },
  { id: "2", name: "iPhone 15 Pro Max 256GB", brand: "Apple", price: 84999, originalPrice: 89999, storeCount: 10 },
  { id: "3", name: "iPhone 14 Pro 128GB", brand: "Apple", price: 54999, originalPrice: 59999, storeCount: 11 },
  { id: "4", name: "iPhone 15 128GB", brand: "Apple", price: 44999, originalPrice: 49999, storeCount: 12 },
  { id: "5", name: "iPhone 15 Plus 128GB", brand: "Apple", price: 52999, originalPrice: 57999, storeCount: 9 },
  { id: "6", name: "iPhone 13 128GB", brand: "Apple", price: 34999, originalPrice: 39999, storeCount: 10 },
  { id: "7", name: "iPhone SE 2022", brand: "Apple", price: 22999, originalPrice: 25999, storeCount: 8 },
  { id: "8", name: "iPhone 14 128GB", brand: "Apple", price: 44999, originalPrice: 49999, storeCount: 11 },
];

const brands = ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Sony", "Huawei"];
const stores = ["Trendyol", "Hepsiburada", "Amazon", "N11", "Teknosa", "Vatan", "MediaMarkt"];

export default async function AraPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q || "iPhone 15";

  return (
    <PageLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Ana Sayfa</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--fg)" }}>Arama Sonuçları</span>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "var(--fg)" }}>
            "{query}" için sonuçlar
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted-fg)" }}>
            {searchResults.length} ürün bulundu
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "40px" }}>
          <aside>
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: "12px" }}>
                Marka
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {brands.map((brand) => (
                  <label key={brand} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "var(--fg)" }}>
                    <input type="checkbox" style={{ width: "16px", height: "16px" }} />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: "12px" }}>
                Fiyat Araligi
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {["0 - 10.000 TL", "10.000 - 25.000 TL", "25.000 - 50.000 TL", "50.000 TL +"].map((range) => (
                  <label key={range} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "var(--fg)" }}>
                    <input type="radio" name="price" style={{ width: "16px", height: "16px" }} />
                    {range}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: "12px" }}>
                Mağaza
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stores.map((store) => (
                  <label key={store} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "var(--fg)" }}>
                    <input type="checkbox" style={{ width: "16px", height: "16px" }} />
                    {store}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: "12px" }}>
                Kargo
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "var(--fg)" }}>
                  <input type="checkbox" style={{ width: "16px", height: "16px" }} />
                  Ücretsiz Kargo
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "var(--fg)" }}>
                  <input type="checkbox" style={{ width: "16px", height: "16px" }} />
                  Hızlı Teslimat
                </label>
              </div>
            </div>

            <button style={{
              width: "100%",
              padding: "10px",
              fontSize: "13px",
              fontWeight: 500,
              backgroundColor: "var(--bg)",
              color: "var(--muted-fg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
              Filtreleri Temizle
            </button>
          </aside>

          <main>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <select style={{
                padding: "8px 12px",
                fontSize: "13px",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                outline: "none",
              }}>
                <option>Sıralama: Önerilen</option>
                <option>Fiyat: Düşükten Yükseğe</option>
                <option>Fiyat: Yüksekten Düşüğe</option>
                <option>En Yeni</option>
              </select>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}>
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={"/urun/" + product.id}
                  style={{
                    display: "block",
                    padding: "16px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--fg)",
                    backgroundColor: "var(--bg)",
                  }}
                >
                  <div style={{
                    width: "100%",
                    height: "120px",
                    backgroundColor: "var(--muted-bg)",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}>
                    📱
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted-fg)", marginBottom: "4px" }}>
                    {product.brand}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px", lineHeight: 1.4, color: "var(--fg)" }}>
                    {product.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>
                      {product.price.toLocaleString("tr-TR")} TL
                    </span>
                    {product.originalPrice && (
                      <span style={{ fontSize: "12px", color: "var(--muted-fg)", textDecoration: "line-through" }}>
                        {product.originalPrice.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>
                    {product.storeCount} mağazada karşılaştır
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
              <button style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                backgroundColor: "var(--muted-bg)",
                color: "var(--muted-fg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
                Önceki
              </button>
              <button style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "var(--primary)",
                color: "var(--primary-fg)",
                border: "none",
                borderRadius: "6px",
              }}>
                1
              </button>
              <button style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
                2
              </button>
              <button style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
                3
              </button>
              <span style={{ padding: "8px", color: "var(--muted-fg)" }}>...</span>
              <button style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
                16
              </button>
              <button style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                backgroundColor: "var(--muted-bg)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
                Sonraki
              </button>
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
