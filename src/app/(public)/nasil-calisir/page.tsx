import { PageLayout } from "@/components/shared/PageLayout";

export default function NasılÇalışırPage() {
  return (
    <PageLayout>
      <div className="page-container">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.5px" }}>
          Nasıl Çalışır
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {[
            {
              step: "01",
              title: "Arama Yapın",
              desc: "Arama çubuğuna aradığınız ürünün adını, markasını veya modelini yazın. Binlerce ürün arasından size en uygun sonuçları anında bulun.",
            },
            {
              step: "02",
              title: "Fiyatları Karşılaştırın",
              desc: "Aynı ürünün farklı mağazalardaki fiyatlarını yan yana görün. En düşük fiyatı, kargo maliyetlerini ve toplam tutarı kolayca karşılaştırın.",
            },
            {
              step: "03",
              title: "En İyi Fiyatı Seçin",
              desc: "Beğendiğiniz mağazayı seçin ve ürün sayfasına yönlenin. Tüm bilgiler orijinal mağazadan güncel olarak alınır.",
            },
            {
              step: "04",
              title: "Tasarruf Edin",
              desc: "En iyi fiyatı bulun ve para biriktirin. Fiyat alarmı kurarak ürünün fiyatı düştüğünde haberdar olun.",
            },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
              <div style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "var(--accent)",
                minWidth: "50px",
              }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--fg)" }}>{item.title}</h3>
                <p style={{ fontSize: "15px", color: "var(--muted-fg)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
