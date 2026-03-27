"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, MapPin, Briefcase, Building, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { jobsData } from "../jobsData";
import { notFound } from "next/navigation";

export default function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const job = jobsData.find((j) => j.slug === slug);

  if (!job) {
    notFound();
  }

  return (
    <PageLayout>
      <section style={{ padding: "40px 24px 80px", minHeight: "80vh" }}>
        <style>{`
          .job-layout { display: grid; gap: 64px; align-items: start; }
          .job-main { width: 100%; max-width: 900px; }
          @media (min-width: 1024px) {
            .job-layout { grid-template-columns: 1fr 340px; gap: 80px; }
            .job-aside { position: sticky; top: 140px; }
          }
        `}</style>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          
          <Link href="/kariyer" style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            fontSize: "14px", 
            color: "var(--muted-fg)", 
            textDecoration: "none", 
            marginBottom: "32px", 
            fontWeight: 500, 
            transition: "all 0.2s ease" 
          }} 
          onMouseOver={(e) => { e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.transform = "translateX(-4px)"; }} 
          onMouseOut={(e) => { e.currentTarget.style.color = "var(--muted-fg)"; e.currentTarget.style.transform = "translateX(0)"; }}>
            <ArrowLeft size={16} /> Açık Pozisyonlara Dön
          </Link>

          <div className="job-layout">
            <div className="job-main">
              <header style={{ paddingBottom: "32px", borderBottom: "1px solid var(--border)", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 800, color: "var(--fg)", marginBottom: "20px", letterSpacing: "-1px", lineHeight: 1.2 }}>
              {job.title}
            </h1>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted-fg)", fontSize: "14px", fontWeight: 500 }}>
                <Building size={16} style={{ color: "var(--teal)" }} /> {job.department}
              </div>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "var(--border)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted-fg)", fontSize: "14px", fontWeight: 500 }}>
                <MapPin size={16} style={{ color: "var(--teal)" }} /> {job.location}
              </div>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "var(--border)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted-fg)", fontSize: "14px", fontWeight: 500 }}>
                <Briefcase size={16} style={{ color: "var(--teal)" }} /> {job.type}
              </div>
            </div>
          </header>

          <main style={{ display: "flex", flexDirection: "column", gap: "48px", color: "var(--fg)", lineHeight: 1.7, fontSize: "16px" }}>
            
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.5px" }}>İş Tanımı</h2>
              <p style={{ color: "var(--muted-fg)" }}>{job.description}</p>
            </div>

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.5px" }}>Sorumluluklar</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {job.responsibilities.map((res, i) => (
                  <li key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", color: "var(--muted-fg)" }}>
                    <CheckCircle2 size={20} style={{ color: "var(--teal)", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ flex: 1 }}>{res}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.5px" }}>Aranan Nitelikler</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {job.requirements.map((req, i) => (
                  <li key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", color: "var(--muted-fg)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--teal)", flexShrink: 0, marginTop: "8px", marginLeft: "6px" }} />
                    <span style={{ flex: 1 }}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {job.benefits.length > 0 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.5px" }}>Ayrıcalıklar & Yan Haklar</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {job.benefits.map((ben, i) => (
                    <li key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", color: "var(--muted-fg)" }}>
                      <div style={{ padding: "4px", backgroundColor: "rgba(0, 229, 188, 0.1)", borderRadius: "6px", display: "flex", alignItems: "center" }}>
                        <CheckCircle2 size={14} style={{ color: "var(--teal)", flexShrink: 0 }} />
                      </div>
                      <span style={{ flex: 1 }}>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </main>
          </div>

          <aside className="job-aside">
            <div style={{ 
              padding: "40px 32px", 
              backgroundColor: "rgba(0, 229, 188, 0.05)", 
              border: "1px solid rgba(0, 229, 188, 0.1)", 
              borderRadius: "24px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "24px", 
              alignItems: "center", 
              textAlign: "center" 
            }}>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--fg)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Bu pozisyon sana uygun mu?</h3>
                <p style={{ color: "var(--muted-fg)", fontSize: "15px" }}>Mükemmel iş arkadaşlarıyla çalışmak için CV'ni iletmeni bekliyoruz.</p>
              </div>
              <a href={`mailto:ik@tutar.net?subject=Başvuru: ${job.title}`} style={{ 
                display: "inline-flex", 
                width: "100%",
                justifyContent: "center",
                padding: "16px 20px", 
                backgroundColor: "var(--fg)", 
                color: "var(--bg)", 
                fontWeight: 700, 
                fontSize: "15px", 
                borderRadius: "100px", 
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Hemen Başvur
              </a>
            </div>
          </aside>

          </div>
        </div>
      </section>
    </PageLayout>
  );
}
