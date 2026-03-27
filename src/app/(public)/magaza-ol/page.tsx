"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";

const packages = [
  {
    name: "Starter",
    price: "999",
    period: "ay",
    features: ["100 ürün feed", "1 mağaza sayfası", "Temel analitik", "Email destek"],
    popular: false,
  },
  {
    name: "Professional",
    price: "Ücretsiz",
    period: "İlk 1 Yıl",
    features: ["1.000 ürün feed", "Öne çıkan ürünler", "Detaylı analitik", "Öncelikli destek", "API erişimi"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "9.999",
    period: "ay",
    features: ["Sınırsız ürün feed", "Öncelikli liste", "Özel mağaza sayfası", "7/24 destek", "Webhook entegrasyonu"],
    popular: false,
  },
];

export default function MagazaOlPage() {
  const [formData, setFormData] = useState({
    storeName: "",
    legalName: "",
    contactName: "",
    contactTitle: "",
    email: "",
    phone: "",
    website: "",
    taxOffice: "",
    taxNumber: "",
    infrastructure: "",
    productCount: "",
    xmlLink: "",
    notes: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    backgroundColor: "var(--bg)",
    color: "var(--fg)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "6px",
    color: "var(--fg)",
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.5px" }}>
            Tutar.net'te Mağaza Olun
          </h1>
          <p style={{ fontSize: "16px", color: "var(--muted-fg)", maxWidth: "600px", margin: "0 auto" }}>
            Milyonlarca potansiyel müşteriye ulaşın. İlk partner mağazalarımıza özel lansman kampanyasından yararlanarak hemen platformda yerinizi alın.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "64px",
        }}>
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              style={{
                padding: "32px 24px",
                border: pkg.popular ? "2px solid var(--teal)" : "1px solid var(--border)",
                borderRadius: "16px",
                position: "relative",
                backgroundColor: pkg.popular ? "rgba(0, 229, 188, 0.03)" : "var(--bg)",
                transition: "transform 0.2s"
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "var(--teal)",
                  color: "var(--dark)",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "4px 16px",
                  borderRadius: "100px",
                  boxShadow: "0 4px 12px rgba(0, 229, 188, 0.3)"
                }}>
                  LANSMANA ÖZEL
                </div>
              )}
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--fg)" }}>{pkg.name}</h3>
              <div style={{ marginBottom: "24px" }}>
                {pkg.popular ? (
                  <span style={{ fontSize: "36px", fontWeight: 800, color: "var(--teal)", letterSpacing: "-1px" }}>{pkg.price}</span>
                ) : pkg.name === "Starter" ? (
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--muted-fg)", textDecoration: "line-through", opacity: 0.6 }}>{pkg.price}</span>
                ) : (
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--fg)" }}>{pkg.price}</span>
                )}
                <span style={{ fontSize: "14px", color: "var(--muted-fg)", fontWeight: 600 }}> / {pkg.period}</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                {pkg.features.map((feature) => (
                  <li key={feature} style={{ fontSize: "14px", color: "var(--fg)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: pkg.popular ? "var(--teal)" : "var(--muted-fg)", fontWeight: 800 }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          padding: "40px",
          backgroundColor: "var(--muted-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
        }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "var(--fg)" }}>Resmi Satıcı Başvuru Formu</h2>
          <p style={{ fontSize: "14px", color: "var(--muted-fg)", marginBottom: "32px" }}>Lütfen aşağıdaki bilgileri şirket resmi kayıtlarınıza göre eksiksiz doldurun.</p>
          
          {submitted ? (
            <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "var(--bg)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--teal-dim)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 16px" }}>✓</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "var(--fg)" }}>
                Başvurunuz Alındı!
              </h3>
              <p style={{ fontSize: "15px", color: "var(--muted-fg)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
                Ekibimiz bilgilerinizi inceleyip onay sürecini tamamlamak için en kısa sürede sizinle iletişime geçecektir.
              </p>
              <Link href="/" style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", textDecoration: "none", borderRadius: "8px", fontWeight: 600 }}>
                Ana Sayfaya Dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Kurumsal Bilgiler */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", backgroundColor: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px" }}>Genel Kurumsal Bilgiler</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Tüketici Önünde Görünen Mağaza Adı</label>
                    <input type="text" required value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} style={inputStyle} placeholder="Örn: X Teknoloji" />
                  </div>
                  <div>
                    <label style={labelStyle}>Şirket Resmi Unvanı</label>
                    <input type="text" required value={formData.legalName} onChange={(e) => setFormData({ ...formData, legalName: e.target.value })} style={inputStyle} placeholder="X Teknoloji ve Bilişim San. Tic. A.Ş." />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Vergi Numarası / TC Kimlik No</label>
                    <input type="text" required value={formData.taxNumber} onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Vergi Dairesi</label>
                    <input type="text" required value={formData.taxOffice} onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", backgroundColor: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px" }}>Yetkili İletişim Bilgileri</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Yetkili Adı Soyadı</label>
                    <input type="text" required value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Yetkili Ünvanı / Pozisyonu</label>
                    <input type="text" required value={formData.contactTitle} onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })} style={inputStyle} placeholder="Örn: E-ticaret Müdürü" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Şirket Kurumsal E-posta</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>İletişim Numarası (Telefon)</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} placeholder="+90" />
                  </div>
                </div>
              </div>

              {/* Teknik & Operasyonel Bilgiler */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", backgroundColor: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px" }}>Teknik & Operasyonel Bilgiler</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>E-ticaret Sitenizin Adresi (URL)</label>
                    <input type="url" required value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={inputStyle} placeholder="https://" />
                  </div>
                  <div>
                    <label style={labelStyle}>Kullanılan E-ticaret Altyapısı</label>
                    <select required value={formData.infrastructure} onChange={(e) => setFormData({ ...formData, infrastructure: e.target.value })} style={inputStyle}>
                      <option value="">Seçiniz...</option>
                      <option value="ideasoft">IdeaSoft</option>
                      <option value="ticimax">Ticimax</option>
                      <option value="tsoft">T-Soft</option>
                      <option value="ikass">İkass</option>
                      <option value="woocommerce">WooCommerce</option>
                      <option value="shopify">Shopify</option>
                      <option value="opencart">OpenCart</option>
                      <option value="özel">Özel / Diğer</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Tahmini Ürün Kataloğu Boyutu</label>
                    <select required value={formData.productCount} onChange={(e) => setFormData({ ...formData, productCount: e.target.value })} style={inputStyle}>
                      <option value="">Seçiniz...</option>
                      <option value="0-1000">0 - 1.000 arası</option>
                      <option value="1000-5000">1.000 - 5.000 arası</option>
                      <option value="5000-20000">5.0000 - 20.000 arası</option>
                      <option value="20000+">20.000'den fazla</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>XML Çıktı Linki (Varsa)</label>
                    <input type="url" value={formData.xmlLink} onChange={(e) => setFormData({ ...formData, xmlLink: e.target.value })} style={inputStyle} placeholder="https://site.com/feed.xml" />
                  </div>
                </div>
                <div>
                   <label style={labelStyle}>Eklemek İstedikleriniz (Opsiyonel)</label>
                   <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{...inputStyle, resize: "vertical"}} placeholder="Müşteri hizmetleri veya teknik entegrasyon ekibimiz için ekstra talepler..."></textarea>
                </div>
              </div>

              <div style={{ padding: "16px", backgroundColor: "rgba(0, 229, 188, 0.05)", border: "1px solid var(--teal)", borderRadius: "8px", color: "var(--fg)", fontSize: "13px", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--teal)" }}>Not:</strong> "1 Yıl Ücretsiz" lansman kampanyasına kaydınız bu form onaylandığında otomatik olarak aktif hale getirilecektir. Başvurunuzu göndererek platform sözleşme koşullarını okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
              </div>

              <button
                type="submit"
                style={{
                  padding: "16px",
                  backgroundColor: "var(--fg)",
                  color: "var(--bg)",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "8px"
                }}
              >
                Resmi Satıcı Kaydını Gönder
              </button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
