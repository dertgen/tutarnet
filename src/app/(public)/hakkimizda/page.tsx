"use client";

import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";

const achievements = [
  { label: "Aktif Mağazalar", value: "500+" },
  { label: "Listelenen Ürün", value: "10M+" },
  { label: "Doğruluk Oranı", value: "%99" },
  { label: "Aylık Tekil Ziyaretçi", value: "2M+" },
];

const contentSections = [
  {
    title: "Vizyonumuz",
    content: "Yıllar boyunca e-ticaret siteleri arasında fiyat karşılaştırmak meşakkatli bir süreç olarak kaldı. Bugün pek çok pazaryeri var ancak tüketicinin en iyi fiyata ulaşması hala yüzlerce sayfayı dolaşmayı ve yorucu bir araştırmayı gerektiriyor.\n\nBiz, saniyeler içinde binlerce satıcıyı tarayarak en şeffaf fiyatı önünüze getiren bir ekosistem yarattık.\n\nTutar.net ile fiyat aramak bir yük olmaktan çıkıyor, her alışverişte tasarruf etmek kalıcı bir alışkanlık haline geliyor. Tüketicilerin güvenle işlem yaptığı bu şeffaf pazarda tüm veri elinizin altında."
  },
  {
    title: "Hikayemiz",
    content: "Şirketimiz, on yılı aşkın süredir web teknolojileri ve veri madenciliği üzerine odaklanmış kuruculardan oluşuyor. Kendi ihtiyaçlarımız için kurduğumuz özel bot ağları, zamanla herkesin erişimine açık eşsiz bir platforma dönüştü.\n\nBugün yüzlerce mağaza ve milyonlarca veriyi anlık olarak işliyor, sadece fiyatları değil, indirim geçmişlerini de analiz ediyoruz.\n\nHer ölçekten kullanıcının karmaşık teknik detaylara boğulmadan net bilgiye ulaşmasını sağlayan bir yapı kurmaktan gurur duyuyoruz. Amacımız, teknolojiyi kullanarak adaleti ve erişilebilirliği sağlamak."
  }
];

const logos = [
  { name: "OpenAi", img: "https://cdn.worldvectorlogo.com/logos/openai-logo-1.svg" },
  { name: "Microsoft Copilot", img: "https://cdn.worldvectorlogo.com/logos/microsoft-copilot-logo.svg" },
  { name: "Deepseek Ai", img: "https://cdn.worldvectorlogo.com/logos/deepseek-ai-seeklogo.svg" },
  { name: "Gemini", img: "https://cdn.worldvectorlogo.com/logos/gemini-ai.svg" },
  { name: "Grok", img: "https://cdn.worldvectorlogo.com/logos/grok-3.svg" },
  { name: "Lovable", img: "https://cdn.worldvectorlogo.com/logos/lovable.svg" },
];

export default function HakkimizdaPage() {
  const W = "1400px";
  const PX = "clamp(16px, 3vw, 48px)";

  return (
    <PageLayout>
      <div style={{ maxWidth: W, margin: "0 auto", padding: `80px ${PX}` }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "64px", maxWidth: "800px" }}>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 800, color: "var(--fg)", letterSpacing: "-2px", lineHeight: 1.1 }}>
            Hakkımızda
          </h1>
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "var(--muted-fg)", lineHeight: 1.6 }}>
            Tutar.net, tüketicilerin ve dijital perakendecilerin aynı şeffaflıkla buluşmasına güç veren, yenilikçi fiyatlandırma ekosistemine adanmış tutkulu bir ekiptir. 
          </p>
        </div>

        {/* 3-Column / 2-Column Grid Area */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          marginBottom: "80px",
        }} className="about-hero-grid">
          <style>{`
            @media (min-width: 1024px) {
              .about-hero-grid {
                grid-template-columns: 2fr 1fr !important;
              }
            }
          `}</style>
          
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
            alt="Tutar.net Ekip"
            style={{ width: "100%", height: "100%", minHeight: "400px", maxHeight: "620px", objectFit: "cover", borderRadius: "24px" }}
          />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ 
              padding: "32px", 
              backgroundColor: "var(--muted-bg)", 
              borderRadius: "24px", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between",
              gap: "32px",
              flex: 1
            }}>
              <img src="/logo.svg" alt="Tutar.net Logo" style={{ height: "48px", width: "auto", alignSelf: "flex-start" }} />
              <div>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-0.5px" }}>
                  Yüzlerce Partner Mağaza
                </p>
                <p style={{ color: "var(--muted-fg)", fontSize: "15px", lineHeight: 1.6 }}>
                  Sektördeki iş gücünü kolaylaştıran, üretkenliği artıran ve büyümeyi teşvik eden sistemlerle iş ortaklarımızı destekliyoruz.
                </p>
              </div>
              <Link href="/magazalar" style={{ 
                padding: "12px 24px", 
                alignSelf: "flex-start", 
                border: "1px solid var(--border)", 
                borderRadius: "8px", 
                color: "var(--fg)", 
                fontWeight: 600, 
                fontSize: "14px", 
                textDecoration: "none",
                display: "inline-block",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Mağazaları Keşfet
              </Link>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Ofis Çalışması" 
              style={{ width: "100%", flex: 1, minHeight: "200px", objectFit: "cover", borderRadius: "24px" }} 
            />
          </div>
        </div>

        {/* Marquee Companies */}
        <div style={{ padding: "32px 0 80px", overflow: "hidden" }}>
          <style>{`
            @keyframes slideAbout {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-about {
              display: flex;
              width: 200%;
              animation: slideAbout 40s linear infinite;
            }
          `}</style>
          <div style={{
            position: "relative",
            maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}>
            <div className="marquee-about">
              {[...logos, ...logos].map((logo, idx) => (
                <div key={idx} style={{ flex: "1 0 auto", width: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={logo.img} alt={logo.name} style={{ height: "32px", opacity: 0.6, filter: "grayscale(100%)", transition: "all 0.3s ease" }} 
                       onMouseOver={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.filter = "grayscale(0)"; }}
                       onMouseOut={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.filter = "grayscale(100%)"; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ 
          position: "relative", 
          overflow: "hidden", 
          borderRadius: "24px", 
          backgroundColor: "var(--muted-bg)", 
          padding: "clamp(32px, 5vw, 64px)",
          marginBottom: "80px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px", maxWidth: "600px" }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "var(--fg)", letterSpacing: "-1px" }}>Rakamlarla Bizim Etkimiz</h2>
            <p style={{ fontSize: "16px", color: "var(--muted-fg)", lineHeight: 1.6 }}>
              Veri ağımızın gücünü her gün daha da büyütüyor ve tüketicilere paha biçilemez bir değer önerisi sunuyoruz.
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "32px",
            borderTop: "1px solid var(--border)",
            paddingTop: "48px"
          }}>
            {achievements.map((item, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 800, fontFamily: "monospace", color: "var(--fg)", letterSpacing: "-1.5px" }}>
                  {item.value}
                </span>
                <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--muted-fg)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {contentSections && contentSections.length > 0 && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", 
            gap: "64px", 
            maxWidth: "1000px", 
            margin: "0 auto",
            paddingBottom: "40px"
          }}>
            {contentSections.map((section, idx) => (
              <div key={idx}>
                <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px", color: "var(--fg)", letterSpacing: "-0.5px" }}>
                  {section.title}
                </h2>
                <p style={{ whiteSpace: "pre-line", fontSize: "16px", lineHeight: 1.8, color: "var(--muted-fg)" }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageLayout>
  );
}
