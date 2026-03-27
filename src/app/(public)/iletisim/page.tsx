"use client";

import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { Phone, Mail, Globe, Loader2 } from "lucide-react";

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const W = "1400px";
  const PX = "clamp(16px, 3vw, 48px)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // API gecikmesini simüle ediyoruz
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
      
      // 5 saniye sonra başarı bildirimini kaybet
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg)",
    color: "var(--fg)",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s"
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "var(--fg)"
  };

  return (
    <PageLayout>
      <div style={{ padding: "96px 0", minHeight: "80vh" }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: `0 ${PX}` }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "64px", maxWidth: "1150px", margin: "0 auto" }}>
            
            {/* Sol - Bilgiler Sütunu */}
            <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "48px" }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "var(--fg)", letterSpacing: "-1px", marginBottom: "20px" }}>
                  Bize Ulaşın
                </h1>
                <p style={{ fontSize: "18px", color: "var(--muted-fg)", lineHeight: 1.6 }}>
                  Aklınıza takılan bir soru mu var veya bizimle çalışmak mı istiyorsunuz? Aşağıdaki formu doldurun, en kısa sürede size dönüş yapalım.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <a href="tel:+908501234567" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none", color: "var(--fg)", transition: "opacity 0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"} onMouseOut={(e) => e.currentTarget.style.opacity = "1"}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg)" }}>
                    <Phone size={22} />
                  </div>
                  <span style={{ fontSize: "17px", fontWeight: 500 }}>+90 (850) 123 45 67</span>
                </a>
                
                <a href="mailto:destek@tutar.net" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none", color: "var(--fg)", transition: "opacity 0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"} onMouseOut={(e) => e.currentTarget.style.opacity = "1"}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg)" }}>
                    <Mail size={22} />
                  </div>
                  <span style={{ fontSize: "17px", fontWeight: 500 }}>destek@tutar.net</span>
                </a>

                <a href="https://tutar.net" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none", color: "var(--fg)", transition: "opacity 0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"} onMouseOut={(e) => e.currentTarget.style.opacity = "1"}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg)" }}>
                    <Globe size={22} />
                  </div>
                  <span style={{ fontSize: "17px", fontWeight: 500 }}>tutar.net</span>
                </a>
              </div>
            </div>

            {/* Sağ - İletişim Formu */}
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ 
                backgroundColor: "var(--muted-bg)", 
                borderRadius: "24px", 
                padding: "clamp(24px, 5vw, 48px)",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                border: "1px solid var(--border)"
              }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px" }}>Bize Mesaj Gönderin</h2>
                  <p style={{ fontSize: "15px", color: "var(--muted-fg)" }}>Mesai saatleri içerisinde en geç 24 saatte yanıtlıyoruz.</p>
                </div>

                {isSubmitted && (
                  <div style={{
                    padding: "16px",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    borderRadius: "12px",
                    color: "#16a34a",
                    fontSize: "15px",
                    fontWeight: 600,
                    textAlign: "center"
                  }}>
                    Teşekkürler! Mesajınız başarıyla ekibimize iletildi.
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label htmlFor="firstName" style={labelStyle}>Ad <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span></label>
                      <input 
                        required id="firstName" type="text" placeholder="Ahmet" style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                        value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" style={labelStyle}>Soyad <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span></label>
                      <input 
                        required id="lastName" type="text" placeholder="Yılmaz" style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                        value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" style={labelStyle}>E-posta <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span></label>
                    <input 
                      required id="email" type="email" placeholder="ornek@posta.com" style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" style={labelStyle}>Konu <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span></label>
                    <input 
                      required id="subject" type="text" placeholder="Nasıl yardımcı olabiliriz?" style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" style={labelStyle}>Mesajınız <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span></label>
                    <textarea 
                      required id="message" rows={5} placeholder="Lütfen projeniz veya sorunuz hakkında detayları bizimle paylaşın..." 
                      style={{...inputStyle, resize: "vertical"}}
                      onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--fg)",
                      color: "var(--bg)",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "16px",
                      fontWeight: 700,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      marginTop: "8px",
                      opacity: isSubmitting ? 0.8 : 1,
                      transition: "transform 0.1s ease"
                    }}
                    onMouseDown={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(0.98)")}
                    onMouseUp={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(1)")}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                        Gönderiliyor...
                      </>
                    ) : (
                      "Mesajı Gönder"
                    )}
                  </button>
                  <style>{`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </form>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
