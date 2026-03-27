"use client";

import Link from "next/link";
import { useState, use } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { ProductCard } from "@/components/features/product/ProductCard";

const categoryData: Record<string, {
  name: string;
  description: string;
  subcategories: string[];
  productCount: number;
}> = {
  "telefon": {
    name: "Telefon",
    description: "Akıllı telefonlar, cep telefonları ve aksesuarları",
    subcategories: ["Cep Telefonları", "Akıllı Telefonlar", "Telefon Kılıfları", "Şarj Aletleri", "Kulaklıklar"],
    productCount: 12500,
  },
  "bilgisayar": {
    name: "Bilgisayar",
    description: "Dizüstü bilgisayarlar, masaüstü bilgisayarlar ve aksesuarları",
    subcategories: ["Dizüstü Bilgisayar", "Masaüstü Bilgisayar", "Monitör", "Klavye Mouse", "Laptop Aksesuarları"],
    productCount: 8900,
  },
  "tv-ses": {
    name: "TV & Ses",
    description: "Televizyonlar, ses sistemleri ve ev sineması",
    subcategories: ["Televizyonlar", "Soundbarlar", "Ev Sinema Sistemleri", "Bluetooth Hoparlörler"],
    productCount: 5600,
  },
  "giyim": {
    name: "Giyim & Moda",
    description: "Tişört, Pantolon, Ceket, Elbise, Ayakkabı ve Aksesuarlar",
    subcategories: ["Tişörtler", "Ceketler", "Pantolonlar", "Aksesuarlar", "Ayakkabılar", "Çantalar"],
    productCount: 85200,
  }
};

const mockProducts = [
  { id: "1", slug: "iphone-15-pro-256gb", name: "iPhone 15 Pro 256GB Titanyum", brand: "Apple", price: 74999, originalPrice: 79999, storeCount: 12, rating: 5, image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Fırsat" },
  { id: "2", slug: "samsung-galaxy-s24-ultra", name: "Samsung Galaxy S24 Ultra 512GB", brand: "Samsung", price: 64999, originalPrice: 69999, storeCount: 10, rating: 5, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Yeni" },
  { id: "3", slug: "macbook-air-m3", name: "Apple MacBook Air 13 M3 8GB 256GB", brand: "Apple", price: 35999, originalPrice: 39999, storeCount: 8, rating: 4, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "4", slug: "sony-wh-1000xm5", name: "Sony WH-1000XM5 Gürültü Engellemeli Kablosuz Kulaklık", brand: "Sony", price: 12999, originalPrice: 14999, storeCount: 11, rating: 5, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Popüler" },
  { id: "5", slug: "dyson-v15", name: "Dyson V15 Detect Absolute Kablosuz Dikey Süpürge", brand: "Dyson", price: 24999, originalPrice: 26999, storeCount: 6, rating: 4, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Çok Satan" },
  { id: "6", slug: "airpods-pro-2", name: "Apple AirPods Pro (2. Nesil) MagSafe", brand: "Apple", price: 8999, originalPrice: 9999, storeCount: 14, rating: 5, image: "https://images.unsplash.com/photo-1606220838315-056192d5e927?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
];

export default function KategoriPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const category = categoryData[slug] || categoryData["telefon"];

  const [minPrice, setMinPrice] = useState("100");
  const [maxPrice, setMaxPrice] = useState("150000");

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--fg)",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s"
  };

  const checkboxStyle = {
    accentColor: "var(--teal)",
    width: "16px",
    height: "16px",
    cursor: "pointer"
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 24px 80px" }}>
        
        {/* Breadcrumb */}
        <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "32px", display: "flex", gap: "8px" }}>
          <Link href="/" style={{ color: "var(--muted-fg)", textDecoration: "none" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--fg)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--muted-fg)"}>Ana Sayfa</Link>
          <span>/</span>
          <span style={{ color: "var(--fg)", fontWeight: 500 }}>{category.name}</span>
        </div>

        {/* Ust Header Grid Layout */}
        <div className="cat-layout-grid" style={{ display: "grid", gap: "32px", marginBottom: "24px" }}>
          <div className="cat-sidebar-placeholder" style={{ display: "none" }}></div>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.5px" }}>
                {category.name} Ürünleri
              </h2>
              <p style={{ fontSize: "14px", color: "var(--muted-fg)", marginTop: "4px" }}>
                {category.productCount.toLocaleString("tr-TR")} adet ürün listeleniyor
              </p>
            </div>
            
            <select style={{ ...inputStyle, width: "auto", minWidth: "200px", fontWeight: 500, cursor: "pointer" }}>
              <option>Sıralama: Öne Çıkanlar</option>
              <option>Fiyat: Düşükten Yükseğe</option>
              <option>Fiyat: Yüksekten Düşüğe</option>
              <option>En Yeni Ürünler</option>
              <option>Müşteri Değerlendirmesi</option>
            </select>
          </header>
        </div>

        {/* Ana İcerik Grid */}
        <div className="cat-layout-grid" style={{ display: "grid", gap: "40px" }}>
          <style>{`
            @media (min-width: 1024px) {
              .cat-layout-grid {
                grid-template-columns: 260px 1fr !important;
              }
              .cat-sidebar-placeholder {
                display: block !important;
              }
            }
          `}</style>

          {/* Sol Sütun - Filtreler */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* Filter Group: Arama */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted-fg)", display: "flex", justifyContent: "space-between" }}>
                Anahtar Kelime
              </div>
              <input type="text" placeholder="İçinde ara..." style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            </div>

            {/* Filter Group: Fiyat */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted-fg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Fiyat</span>
                <span style={{ fontSize: "12px", textTransform: "none", fontWeight: 400, color: "var(--fg)" }}>
                  {Number(minPrice).toLocaleString("tr")} ₺ - {Number(maxPrice).toLocaleString("tr")} ₺
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={inputStyle} min={0} />
                <span style={{ color: "var(--muted-fg)" }}>-</span>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={inputStyle} min={0} />
              </div>
            </div>

            {/* Filter Group: Kategoriler */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted-fg)" }}>
                Alt Kategoriler
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {category.subcategories.map((item, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                    <input type="checkbox" id={`cat-${i}`} style={checkboxStyle} title={item} />
                    <span style={{ fontSize: "14px", color: "var(--fg)", fontWeight: 500 }}>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Markalar (Önceden Colors) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted-fg)" }}>
                Öne Çıkan Markalar
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Apple", "Samsung", "Dyson", "Sony", "Philips"].map((brand, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                    <input type="checkbox" name="brand_filter" style={checkboxStyle} title={brand} />
                    <span style={{ fontSize: "14px", color: "var(--fg)", fontWeight: 500 }}>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Mağazalar (Önceden Sizes) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted-fg)" }}>
                Karşılaştırılan Mağazalar
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Amazon", "Hepsiburada", "Trendyol", "Vatan Bilgisayar", "Teknosa"].map((store, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                    <input type="checkbox" style={checkboxStyle} title={store} />
                    <span style={{ fontSize: "14px", color: "var(--fg)", fontWeight: 500 }}>{store}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Sağ Sütun - Ürün Grid */}
          <main>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "24px",
              alignItems: "stretch"
            }}>
              {mockProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  brand={product.brand}
                  image={product.image}
                  lowestPrice={product.price}
                  originalPrice={product.originalPrice}
                  storeCount={product.storeCount}
                  rating={product.rating}
                  discount={Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}
                />
              ))}
            </div>
          </main>
          
        </div>
      </div>
    </PageLayout>
  );
}
