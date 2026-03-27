"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { groupedJobs } from "./jobsData";

export default function KariyerPage() {
  return (
    <PageLayout>
      <section style={{ padding: "40px 24px 80px", minHeight: "80vh" }}>
        <style>{`
          .career-layout { display: grid; gap: 48px; align-items: start; }
          .career-sidebar { margin-bottom: 16px; }
          @media (min-width: 1024px) {
            .career-layout { grid-template-columns: 360px 1fr; gap: 80px; }
            .career-sidebar { position: sticky; top: 140px; margin-bottom: 0; }
          }
        `}</style>
        <div className="career-layout" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          
          <header className="career-sidebar" style={{ textAlign: "left" }}>
            <h1 style={{ 
              fontSize: "clamp(32px, 5vw, 42px)", 
              fontWeight: 800, 
              color: "var(--fg)",
              letterSpacing: "-1px",
              marginBottom: "16px"
            }}>
              Kariyer Fırsatları
            </h1>
            <p style={{ fontSize: "18px", color: "var(--muted-fg)", lineHeight: 1.6 }}>
              Tutar.net ailesine katılın! Türkiye'nin öncü fiyat karşılaştırma ve yapay zeka entegre algoritmik pazar yeri platformunu birlikte inşa edelim.
            </p>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
            {groupedJobs.map((jobCategory) => {
              if (jobCategory.openings.length === 0) return null;
              
              return (
              <div key={jobCategory.category}>
                <h2 style={{ 
                  fontSize: "20px", 
                  fontWeight: 700, 
                  color: "var(--fg)", 
                  paddingBottom: "16px", 
                  borderBottom: "2px solid var(--border)",
                  marginBottom: "8px",
                  letterSpacing: "-0.5px"
                }}>
                  {jobCategory.category}
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {jobCategory.openings.map((job) => (
                    <Link
                      key={job.title}
                      href={`/kariyer/${job.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "24px 0",
                        borderBottom: "1px solid var(--border)",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                      }}
                      onMouseOver={(e) => {
                        const titleEl = e.currentTarget.querySelector('.job-title') as HTMLElement;
                        const iconEl = e.currentTarget.querySelector('.job-icon') as HTMLElement;
                        if (titleEl) titleEl.style.color = "var(--teal)";
                        if (iconEl) iconEl.style.transform = "translateX(5px)";
                      }}
                      onMouseOut={(e) => {
                        const titleEl = e.currentTarget.querySelector('.job-title') as HTMLElement;
                        const iconEl = e.currentTarget.querySelector('.job-icon') as HTMLElement;
                        if (titleEl) titleEl.style.color = "var(--fg)";
                        if (iconEl) iconEl.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, paddingRight: "16px" }}>
                        <h3 className="job-title" style={{ fontSize: "16px", fontWeight: 600, color: "var(--fg)", transition: "color 0.2s" }}>
                          {job.title}
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--muted-fg)" }}>
                          {job.location}
                        </p>
                      </div>
                      <div className="job-icon" style={{ color: "var(--muted-fg)", transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                        <ArrowRight size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              );
            })}

            {/* Listenin Bitişinde Genel Başvuru Modülü (Artık Listenin Altında, İkinci Sütunda) */}
            <div style={{ 
              marginTop: "20px", 
              padding: "40px 32px", 
              borderRadius: "20px", 
              backgroundColor: "rgba(0, 229, 188, 0.05)", 
              border: "1px solid rgba(0, 229, 188, 0.1)",
              textAlign: "center" 
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px" }}>
                Aradığınız pozisyonu bulamadınız mı?
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted-fg)", marginBottom: "24px", lineHeight: 1.6 }}>
                Açık pozisyon olmasa bile yetenekli iş arkadaşlarıyla tanışmaktan her zaman mutluluk duyarız. Ekibimize dahil olmak için CV'nizi iletebilirsiniz.
              </p>
              <a href="mailto:ik@tutar.net" style={{ 
                display: "inline-flex", 
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 28px", 
                backgroundColor: "var(--fg)", 
                color: "var(--bg)", 
                fontWeight: 600, 
                fontSize: "14px", 
                borderRadius: "100px", 
                textDecoration: "none",
                transition: "transform 0.2s ease"
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                ik@tutar.net'e Özgeçmiş Gönder
              </a>
            </div>

          </div>

        </div>
      </section>
    </PageLayout>
  );
}
