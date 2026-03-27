import { PageLayout } from "@/components/shared/PageLayout";

export default function GizlilikPage() {
  return (
    <PageLayout>
      <div className="page-container">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.5px" }}>
          Gizlilik Politikasi
        </h1>
        <div style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--fg)" }}>
          <p style={{ marginBottom: "20px" }}>
            Son güncelleme: 1 Ocak 2024
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "28px", marginBottom: "12px" }}>
            1. Toplanan Bilgiler
          </h2>
          <p style={{ marginBottom: "16px" }}>
            tutar.net olarak, kullanıcı deneyimini iyileştirmek amacıyla aşağıdaki bilgileri toplayabiliriz:
          </p>
          <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>Arama sorguları ve tercihleri</li>
            <li style={{ marginBottom: "8px" }}>Ziyaret edilen sayfalar ve etkileşimler</li>
            <li style={{ marginBottom: "8px" }}>Cihaz ve tarayıcı bilgileri</li>
            <li style={{ marginBottom: "8px" }}>Çerezler aracılığıyla elde edilen veriler</li>
          </ul>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "28px", marginBottom: "12px" }}>
            2. Bilgilerin Kullanımı
          </h2>
          <p style={{ marginBottom: "16px" }}>
            Toplanan bilgiler aşağıdaki amaçlarla kullanılır:
          </p>
          <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>Hizmet kalitesini artırmak</li>
            <li style={{ marginBottom: "8px" }}>Kişiselleştirilmiş içerik ve öneri sunmak</li>
            <li style={{ marginBottom: "8px" }}>Web sitesi trafiğini analiz etmek</li>
            <li style={{ marginBottom: "8px" }}>Yasal yükümlülükleri yerine getirmek</li>
          </ul>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "28px", marginBottom: "12px" }}>
            3. İletişim
          </h2>
          <p>
            Gizlilik politikamız hakkında sorularınız için{" "}
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
