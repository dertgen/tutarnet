"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import {
  Smartphone, Laptop, Tv2, Headphones,
  Tablet, Watch, Camera, Gamepad2,
  Store, Package, TrendingUp, Globe,
  Eye, Activity, ArrowLeftRight
} from "lucide-react";

/* ── Data ─────────────────────────────────────────── */
const categories = [
  { name: "Telefon",      Icon: Smartphone, slug: "telefon" },
  { name: "Bilgisayar",  Icon: Laptop,      slug: "bilgisayar" },
  { name: "TV & Ses",    Icon: Tv2,         slug: "tv-ses" },
  { name: "Kulaklık",    Icon: Headphones,  slug: "kulaklik" },
  { name: "Tablet",      Icon: Tablet,      slug: "tablet" },
  { name: "Akıllı Saat", Icon: Watch,       slug: "akilli-saat" },
  { name: "Kamera",      Icon: Camera,      slug: "kamera" },
  { name: "Oyun",        Icon: Gamepad2,    slug: "oyun" },
];

// Partner logoları (AI & Tech)
const logos = [
  { name: "OpenAi", img: "https://cdn.worldvectorlogo.com/logos/openai-logo-1.svg" },
  { name: "Microsoft Copilot", img: "https://cdn.worldvectorlogo.com/logos/microsoft-copilot-logo.svg" },
  { name: "Deepseek Ai", img: "https://cdn.worldvectorlogo.com/logos/deepseek-ai-seeklogo.svg" },
  { name: "Gemini", img: "https://cdn.worldvectorlogo.com/logos/gemini-ai.svg" },
  { name: "Grok", img: "https://cdn.worldvectorlogo.com/logos/grok-3.svg" },
  { name: "Lovable", img: "https://cdn.worldvectorlogo.com/logos/lovable.svg" },
];

const STATIC_STATS = [
  { key: "partners" as const, label: "Mağaza",            Icon: Store,      fallback: "500+" },
  { key: "products" as const, label: "Ürün",              Icon: Package,    fallback: "10.000+" },
  { key: null,                label: "Fiyat Güncellemesi", Icon: TrendingUp, fallback: "500K+" },
  { key: null,                label: "Ülke",              Icon: Globe,      fallback: "32" },
];

const reasons = [
  {
    title: "Yüksek görünürlük",
    desc: "Ürünlerinizi tutar.net'e yerleştirerek, tekliflerinizle ilgilenen geniş bir kitlede görünürlük elde edersiniz.",
  },
  {
    title: "Nitelikli trafik oluşturun",
    desc: "Tutar.net, tüketicilerin en iyi fiyatlarda en iyi ürünleri bulmasına yardımcı olmak için tasarlanmıştır.",
  },
  {
    title: "Fiyatları karşılaştırın",
    desc: "Tüketicilere farklı mağazalardaki ürünler için hızlıca fiyat karşılaştırma imkânı sunarız.",
  },
  {
    title: "Uluslararası erişim",
    desc: "Binlerce mağazayla çalışıyoruz. Siz de katılın, müşterileriniz sizi kolayca bulsun.",
  },
];

const W = "1400px";
const PX = "clamp(16px, 3vw, 48px)";

interface SiteStats {
  partners: number;
  products: number;
  categories: number;
}

export default function HomePage() {
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: SiteStats) => setSiteStats(data))
      .catch(() => null);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1 }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <section style={{ backgroundColor: "var(--dark)", padding: "140px 0 0" }}>
          <div style={{ maxWidth: W, margin: "0 auto", padding: `0 ${PX}`, textAlign: "center" }}>

            <h1 style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "36px",
            }}>
              <img src="/logo.svg" alt="tutar.net" style={{ height: "clamp(48px, 10vw, 90px)", width: "auto" }} />
            </h1>

            <p style={{
              fontSize: "clamp(15px, 2vw, 20px)",
              color: "var(--white)",
              fontWeight: 600,
              marginBottom: "44px",
            }}>
              500&apos;den fazla mağazada favorilerinizi kolayca bulun
            </p>

            {/* Pill arama çubuğu */}
            <form action="/ara" method="get" style={{
              display: "flex",
              alignItems: "center",
              height: "64px",
              borderRadius: "999px",
              border: "1.5px solid var(--teal)",
              backgroundColor: "rgba(255,255,255,0.07)",
              overflow: "hidden",
              maxWidth: "760px",
              margin: "0 auto 80px",
            }}>
              <input
                type="text"
                name="q"
                placeholder="Ürün, marka veya kategori ara…"
                autoFocus
                style={{
                  flex: 1,
                  height: "100%",
                  padding: "0 28px",
                  fontSize: "16px",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: "var(--white)",
                }}
              />
              <button type="submit" className="search-icon-btn" aria-label="Ara">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>

          {/* 3-step — full container width */}
          <div style={{
            maxWidth: W,
            margin: "0 auto",
            padding: `0 ${PX} 80px`,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "48px",
          }} className="grid-3">
            {[
              {
                icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
                title: "Arayın",
                desc: "Binlerce mağazadaki fiyatları karşılaştırarak aradığınızı bulun.",
              },
              {
                icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                title: "Sipariş Verin",
                desc: "En düşük fiyatı sunan tercih ettiğiniz mağazadan kolayca sipariş verin.",
              },
              {
                icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 13s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
                title: "Keyfini Çıkarın",
                desc: "En iyi fiyata satın aldığınızı bilerek ürününüzün keyfini çıkarın.",
              },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--teal)", flexShrink: 0, marginTop: "2px" }}>{step.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "17px", color: "var(--white)", marginBottom: "10px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--white-dim)", lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── POPULAR CATEGORIES ───────────────────────── */}
        <section style={{ backgroundColor: "var(--dark-2)", padding: "72px 0" }}>
          <div style={{ maxWidth: W, margin: "0 auto", padding: `0 ${PX}` }}>
            <h2 style={{ fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, marginBottom: "32px" }}>
              Popüler Kategoriler
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "14px",
            }} className="grid-4">
              {categories.map(({ name, Icon, slug }) => (
                <Link key={slug} href={`/kategori/${slug}`} className="cat-card">
                  <Icon size={20} strokeWidth={1.5} />
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTNER LOGOS (MARQUEE) ─────────────── */}
        <section style={{ backgroundColor: "var(--sage-bg)", padding: "80px 0 72px", overflow: "hidden" }}>
          <style>{`
            @keyframes scrollMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-container {
              display: flex;
              width: 200%;
              animation: scrollMarquee 30s linear infinite;
            }
            .marquee-container:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div style={{ maxWidth: W, margin: "0 auto", padding: `0 ${PX}` }}>

            <h2 style={{
              textAlign: "center",
              fontSize: "clamp(22px,3vw,36px)",
              fontWeight: 400,
              color: "#1a1a1a",
              marginBottom: "52px",
              letterSpacing: "-0.3px",
            }}>
              Gücünü Aldığı Teknolojiler & Partnerler
            </h2>

            <div style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
              maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}>
              <div className="marquee-container">
                {/* 2 set kopya logoyu ard arda renderlıyoruz (kesintisiz loop) */}
                {[...logos, ...logos].map((logo, index) => (
                  <div key={index} style={{
                    flex: "1 0 auto",
                    width: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <img 
                      src={logo.img} 
                      alt={logo.name} 
                      style={{ 
                        width: "130px", 
                        filter: "grayscale(100%)", 
                        opacity: 0.6, 
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.filter = "grayscale(0%)"; e.currentTarget.style.opacity = "1"; }}
                      onMouseOut={(e) => { e.currentTarget.style.filter = "grayscale(100%)"; e.currentTarget.style.opacity = "0.6"; }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "56px" }}>
              <Link href="/magazalar" className="clients-cta-btn">
                Tüm partner mağazaları gör
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────── */}
        <section style={{ backgroundColor: "var(--dark)", padding: "80px 0" }}>
          <div style={{ maxWidth: W, margin: "0 auto", padding: `0 ${PX}` }}>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "40px",
              textAlign: "center",
              marginBottom: "80px",
              paddingBottom: "64px",
              borderBottom: "1px solid var(--border-dark)",
            }} className="grid-4">
              {STATIC_STATS.map((s, i) => {
                const realValue = s.key && siteStats && siteStats[s.key] > 0
                  ? siteStats[s.key].toLocaleString("tr-TR") + "+"
                  : s.fallback;
                return (
                  <div key={i}>
                    <div style={{ color: "var(--teal)", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                      <s.Icon size={32} strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, letterSpacing: "-1px" }}>
                      {realValue}
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--white-dim)", marginTop: "8px" }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Features (Neden Biz) - Yeni Tasarım */}
            <header style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "64px" }}>
              <div style={{
                display: "inline-block",
                padding: "6px 16px",
                border: "1px solid var(--teal)",
                color: "var(--teal)",
                borderRadius: "100px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "24px"
              }}>
                Avantajlar
              </div>
              <h2 style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "var(--white)",
                letterSpacing: "-1px",
                lineHeight: 1.2,
                marginBottom: "20px"
              }}>
                İşinizi büyütmek için güçlü araçlar
              </h2>
              <p style={{
                fontSize: "18px",
                color: "var(--white-dim)",
                lineHeight: 1.6
              }}>
                Binlerce mağazayla rekabet ederken öne çıkmanızı sağlayacak kapsamlı satış ve entegrasyon özelliklerimizle büyümenizi hızlandırın.
              </p>
            </header>

            <div style={{ width: "100%" }}>
              <dl style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "48px 64px"
              }}>
                {[
                  {
                    title: "Yüksek görünürlük",
                    desc: "Ürünlerinizi tutar.net'e yerleştirerek, tekliflerinizle ilgilenen geniş bir kitlede görünürlük elde edersiniz.",
                    Icon: Eye
                  },
                  {
                    title: "Nitelikli trafik oluşturun",
                    desc: "Tutar.net, tüketicilerin en iyi fiyatlarda en iyi ürünleri bulmasına yardımcı olmak için tasarlanmıştır.",
                    Icon: Activity
                  },
                  {
                    title: "Fiyatları karşılaştırın",
                    desc: "Tüketicilere farklı mağazalardaki ürünler için hızlıca fiyat karşılaştırma imkânı sunarız.",
                    Icon: ArrowLeftRight
                  },
                  {
                    title: "Uluslararası erişim",
                    desc: "Binlerce mağazayla çalışıyoruz. Siz de katılın, müşterileriniz sizi kolayca bulsun.",
                    Icon: Globe
                  }
                ].map((item, i) => (
                  <div key={i} style={{ position: "relative", paddingLeft: "64px" }}>
                    <dt style={{ fontSize: "18px", fontWeight: 700, color: "var(--white)", marginBottom: "8px" }}>
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "48px",
                        height: "48px",
                        backgroundColor: "rgba(0, 229, 188, 0.1)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--teal)"
                      }}>
                        <item.Icon size={24} />
                      </div>
                      {item.title}
                    </dt>
                    <dd style={{ fontSize: "15px", color: "var(--white-dim)", lineHeight: 1.7 }}>
                      {item.desc}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── CTA (PROMOTIONAL CARD) ────────────────────── */}
        <section style={{ padding: "80px 0", backgroundColor: "var(--sage-bg)" }}>
          <div style={{ maxWidth: W, margin: "0 auto", padding: `0 ${PX}` }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: "24px",
              padding: "80px 24px",
              backgroundImage: "url('https://images.unsplash.com/photo-1754357906539-7ae638a49740?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1426')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Daha okunabilir bir metin için çok hafif, dağıtılmış bir filtre eklendi */}
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255, 255, 255, 0.4)" }} />
              
              <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  color: "#000000",
                  letterSpacing: "-1px",
                  lineHeight: 1.15
                }}>
                  Hemen Yeni Müşteriler Kazanın
                </h2>
                <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "#000000", fontWeight: 500, lineHeight: 1.6 }}>
                  Geniş trafik ağımız sayesinde markanızı binlerce potansiyel alıcıyla buluşturun. Satışlarınızı otomatik olarak katlayın.
                </p>
              </div>
              
              <Link href="/magaza-ol" style={{
                position: "relative",
                zIndex: 1,
                padding: "16px 32px",
                backgroundColor: "#000000",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
                borderRadius: "100px",
                transition: "opacity 0.2s",
                boxShadow: "0 8px 16px rgba(0,0,0,0.15)"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              >
                Mağaza Olun (1 Yıl Ücretsiz)
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
