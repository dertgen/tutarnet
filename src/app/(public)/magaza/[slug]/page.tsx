import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";

const storeData: Record<string, {
  name: string;
  logo: string;
  description: string;
  productCount: number;
  trustScore: number;
  memberSince: string;
  categories: string[];
}> = {
  "trendyol": {
    name: "Trendyol",
    logo: "T",
    description: "Türkiye'nin en büyük e-ticaret platformlarından biri. Geniş ürün yelpazesi ve hızlı teslimat seçenekleri.",
    productCount: 125000,
    trustScore: 4.7,
    memberSince: "2019",
    categories: ["Elektronik", "Moda", "Ev & Yaşam", "Spor"],
  },
  "hepsiburada": {
    name: "Hepsiburada",
    logo: "H",
    description: "Türkiye'nin lider e-ticaret platformu. Binlerce satıcı ve milyonlarca ürün.",
    productCount: 98000,
    trustScore: 4.5,
    memberSince: "2018",
    categories: ["Elektronik", "Ev & Yaşam", "Moda", "SüperMarket"],
  },
  "amazon": {
    name: "Amazon",
    logo: "A",
    description: "Dünyamızın en büyük online perakende platformu. Global satışlar ve güvenilir hizmet.",
    productCount: 75000,
    trustScore: 4.6,
    memberSince: "2020",
    categories: ["Elektronik", "Kitap", "Ev & Yaşam", "Oyuncak"],
  },
  "n11": {
    name: "N11",
    logo: "N",
    description: "Doğan Holding'in e-ticaret platformu. Güvenilir alışveriş ve geniş ürün yelpazesi.",
    productCount: 52000,
    trustScore: 4.3,
    memberSince: "2019",
    categories: ["Elektronik", "Ev & Yaşam", "Moda"],
  },
  "ciceksepeti": {
    name: "ÇiçekSepeti",
    logo: "C",
    description: "Çiçek ve hediye kategorisinde Türkiye'nin lideri. Aynı gün teslimat.",
    productCount: 45000,
    trustScore: 4.4,
    memberSince: "2017",
    categories: ["Çiçek", "Hediye", "Ev & Yaşam", "SüperMarket"],
  },
  "teknosa": {
    name: "Teknosa",
    logo: "T",
    description: "Teknoloji ürünlerinde uzman. Yetkili satıcı garantisi ile alışveriş.",
    productCount: 38000,
    trustScore: 4.8,
    memberSince: "2016",
    categories: ["Elektronik", "Bilgisayar", "Telefon", "TV"],
  },
  "mediamarkt": {
    name: "MediaMarkt",
    logo: "M",
    description: "Avrupa'nın lider teknoloji perakendecisi. Fizik mağazaları ile online hizmet.",
    productCount: 25000,
    trustScore: 4.5,
    memberSince: "2018",
    categories: ["Elektronik", "Elektrikli Ev Aletleri", "Bilgisayar"],
  },
  "vatan": {
    name: "Vatan",
    logo: "V",
    description: "Teknoloji tutkunlarının adresi. Bilgisayar ve elektronik ürünlerde uzman.",
    productCount: 22000,
    trustScore: 4.6,
    memberSince: "2017",
    categories: ["Bilgisayar", "Telefon", "Oyun", "Elektronik"],
  },
};

const products = [
  { id: "1", name: "iPhone 15 Pro 256GB", price: 74999, originalPrice: 79999 },
  { id: "2", name: "Samsung Galaxy S24 Ultra", price: 64999, originalPrice: 69999 },
  { id: "3", name: "MacBook Air M3", price: 54999, originalPrice: 59999 },
  { id: "4", name: "Sony WH-1000XM5", price: 12999, originalPrice: 14999 },
];

export default async function MagazaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = storeData[slug] || storeData["trendyol"];

  return (
    <PageLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Ana Sayfa</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/magazalar" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Mağazalar</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--fg)" }}>{store.name}</span>
        </div>

        <div style={{
          display: "flex",
          gap: "24px",
          padding: "28px",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          marginBottom: "32px",
          backgroundColor: "var(--bg)",
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "12px",
            backgroundColor: "var(--muted-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 700,
          }}>
            {store.logo}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px", letterSpacing: "-0.3px", color: "var(--fg)" }}>
              {store.name}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted-fg)", marginBottom: "12px" }}>
              {store.description}
            </p>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--muted-fg)" }}>Güven Skoru:</span>{" "}
                <span style={{ fontWeight: 600, color: "var(--fg)" }}>{store.trustScore}/5</span>
              </div>
              <div>
                <span style={{ color: "var(--muted-fg)" }}>Ürün:</span>{" "}
                <span style={{ fontWeight: 600, color: "var(--fg)" }}>{store.productCount.toLocaleString("tr-TR")}</span>
              </div>
              <div>
                <span style={{ color: "var(--muted-fg)" }}>Üyelik:</span>{" "}
                <span style={{ fontWeight: 600, color: "var(--fg)" }}>{store.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--fg)" }}>Kategoriler</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {store.categories.map((cat) => (
              <span
                key={cat}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "var(--muted-bg)",
                  borderRadius: "16px",
                  fontSize: "13px",
                  color: "var(--fg)",
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--fg)" }}>
            Bu Mağazadaki Popüler Ürünler
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}>
            {products.map((product) => (
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
                  📦
                </div>
                <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px", lineHeight: 1.4, color: "var(--fg)" }}>
                  {product.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>
                    {product.price.toLocaleString("tr-TR")} TL
                  </span>
                  {product.originalPrice && (
                    <span style={{ fontSize: "12px", color: "var(--muted-fg)", textDecoration: "line-through" }}>
                      {product.originalPrice.toLocaleString("tr-TR")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
