import { PageLayout } from "@/components/shared/PageLayout";

export default function KullanımKoşullariPage() {
  return (
    <PageLayout>
      <div className="page-container">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.5px" }}>
          Kullanım Koşulları
        </h1>
        <div style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--fg)" }}>
          <p style={{ marginBottom: "20px" }}>
            Son güncelleme: 1 Ocak 2024
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "28px", marginBottom: "12px" }}>
            1. Kabul Şartları
          </h2>
          <p style={{ marginBottom: "16px" }}>
            tutar.net web sitesini kullanarak, işbu kullanım koşullarını kabul etmiş sayılırsınız.
            Bu koşulları kabul etmiyorsanız, lütfen web sitemizi kullanmayın.
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "28px", marginBottom: "12px" }}>
            2. Hizmet Açıklaması
          </h2>
          <p style={{ marginBottom: "16px" }}>
            tutar.net, Türkiye'de faaliyet gösteren e-ticaret platformlarındaki ürün fiyatlarını
            karşılaştırmaya yarayan bir fiyat karşılaştırma hizmetidir.
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "28px", marginBottom: "12px" }}>
            3. İletişim
          </h2>
          <p>
            Kullanım koşulları hakkında sorularınız için{" "}
            <a href="/iletisim" style={{ color: "var(--accent)", textDecoration: "none" }}>
              iletişim sayfamız
            </a>{" "}
            üzerinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
