"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Github, Twitter, Loader2, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/db/supabase";

function setAuthCookie(token: string, expiresIn: number) {
  document.cookie = `sb-access-token=${token}; path=/; max-age=${expiresIn}; SameSite=Lax`;
}

function GirisYapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  // Ortak Bilgiler
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Kişisel / Yetkili Bilgileri
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  
  // Mağaza Kurumsal Bilgileri
  const [storeName, setStoreName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [infrastructure, setInfrastructure] = useState("");
  const [xmlLink, setXmlLink] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("professional");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"kisisel" | "magaza">("kisisel");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [registerStep, setRegisterStep] = useState(1);

  // Form submit işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Çok adımlı kayıt - son adım değilse ilerle
    if (authMode === "register") {
      if (activeTab === "kisisel" && registerStep < 2) {
        setRegisterStep(2);
        return;
      }
      if (activeTab === "magaza" && registerStep < 4) {
        setRegisterStep(registerStep + 1);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (authMode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message.includes("Invalid login credentials")
            ? "E-posta veya şifre hatalı."
            : signInError.message.includes("Email not confirmed")
              ? "E-postanızı doğrulamadınız. Gelen kutunuzu kontrol edin."
              : signInError.message);
          return;
        }
        if (data.session?.access_token) {
          setAuthCookie(data.session.access_token, data.session.expires_in ?? 3600);
          router.push(redirectTo);
          router.refresh();
        }
      } else if (activeTab === "kisisel") {
        const fullName = `${firstName} ${lastName}`.trim();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: fullName, phone, birth_date: birthDate } },
        });
        if (signUpError) {
          setError(signUpError.message.includes("already registered")
            ? "Bu e-posta adresi zaten kayıtlı."
            : signUpError.message);
          return;
        }
        const user = data.user;
        const session = data.session;
        if (session?.access_token) {
          setAuthCookie(session.access_token, session.expires_in ?? 3600);
          await fetch("/api/auth/kayit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ user_id: user!.id, email, name: fullName }),
          });
          router.push("/");
          router.refresh();
        } else {
          setSuccessMsg("Kayıt başarılı! E-postanıza bir doğrulama bağlantısı gönderdik.");
          setAuthMode("login");
          setRegisterStep(1);
        }
      } else {
        // Mağaza kaydı
        const fullName = `${firstName} ${lastName}`.trim();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: fullName, phone, role: "partner" } },
        });
        if (signUpError) {
          setError(signUpError.message.includes("already registered")
            ? "Bu e-posta adresi zaten kayıtlı."
            : signUpError.message);
          return;
        }
        const user = data.user;
        const session = data.session;
        const token = session?.access_token ?? "";
        if (user) {
          const partnerRes = await fetch("/api/auth/partner-kayit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              user_id: user.id,
              email,
              contact_name: fullName,
              store_name: storeName,
              phone,
              website,
              tax_number: taxNumber,
              infrastructure,
              xml_link: xmlLink,
              package_type: selectedPackage.toUpperCase(),
            }),
          });
          if (!partnerRes.ok) {
            const d = await partnerRes.json();
            setError(d.error ?? "Başvuru kaydedilemedi.");
            return;
          }
        }
        if (session?.access_token) {
          setAuthCookie(session.access_token, session.expires_in ?? 3600);
          router.push("/magaza-paneli");
          router.refresh();
        } else {
          setSuccessMsg("Başvurunuz alındı! E-postanızı doğruladıktan sonra incelemeye alınacaktır.");
          setAuthMode("login");
          setRegisterStep(1);
        }
      }
    } catch {
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (registerStep > 1) {
      setRegisterStep(registerStep - 1);
    }
  };

  const toggleAuthMode = (mode: "login" | "register") => {
    setAuthMode(mode);
    setRegisterStep(1); // Reset
  };

  const toggleTab = (tab: "kisisel" | "magaza") => {
    setActiveTab(tab);
    setRegisterStep(1); // Reset
    if (authMode === "register" && tab === "magaza") {
      // do nothing
    } else if (authMode === "register" && tab === "kisisel") {
      // do nothing
    } else {
      setAuthMode("login");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg)",
    color: "var(--fg)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--fg)",
    marginBottom: "4px"
  };

  const socialBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    backgroundColor: "transparent",
    color: "var(--fg)",
    cursor: "pointer",
    transition: "background-color 0.2s"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Geri Dön (Ana Sayfa) Butonu */}
      <Link href="/" style={{
        position: "absolute",
        top: "32px",
        left: "32px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--muted-fg)",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 600,
        zIndex: 10,
        transition: "color 0.2s"
      }}
      onMouseOver={(e) => e.currentTarget.style.color = "var(--fg)"}
      onMouseOut={(e) => e.currentTarget.style.color = "var(--muted-fg)"}>
        <ArrowLeft size={18} />
        Ana Sayfa
      </Link>

      {/* Sol Sütun - Form Alanı */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        maxHeight: "100vh",
        overflowY: "auto"
      }}>
        <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "28px", alignItems: "center", margin: "auto 0" }}>
          
          <Link href="/">
            <img src="/logo.svg" alt="Tutar Logo" style={{ height: "40px", width: "auto" }} />
          </Link>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, textAlign: "center", color: "var(--fg)", letterSpacing: "-0.5px" }}>
              {authMode === "login" 
                ? "Hesabınıza giriş yapın" 
                : (activeTab === "kisisel" ? "Bireysel Hesap Oluştur" : "Mağaza Başvurusu Yap")}
            </h1>

            <div style={{
              display: "flex",
              backgroundColor: "var(--muted-bg)",
              borderRadius: "12px",
              padding: "4px",
              width: "100%"
            }}>
              <button
                type="button"
                onClick={() => toggleTab("kisisel")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === "kisisel" ? "var(--bg)" : "transparent",
                  color: activeTab === "kisisel" ? "var(--fg)" : "var(--muted-fg)",
                  fontWeight: activeTab === "kisisel" ? 600 : 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === "kisisel" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Kişisel
              </button>
              <button
                type="button"
                onClick={() => toggleTab("magaza")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === "magaza" ? "var(--bg)" : "transparent",
                  color: activeTab === "magaza" ? "var(--fg)" : "var(--muted-fg)",
                  fontWeight: activeTab === "magaza" ? 600 : 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === "magaza" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Mağaza
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", fontSize: "13px", color: "#ef4444" }}>
                  {error}
                </div>
              )}
              {successMsg && (
                <div style={{ padding: "12px 16px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "10px", fontSize: "13px", color: "#34d399" }}>
                  {successMsg}
                </div>
              )}

              {/* === GİRİŞ (LOGIN) FORMU === */}
              {authMode === "login" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label htmlFor="email" style={labelStyle}>E-posta</label>
                    <input 
                      id="email" type="email" required placeholder="ornek@posta.com" style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Şifre</label>
                      <Link href="#" style={{ fontSize: "13px", color: "var(--muted-fg)", textDecoration: "underline", textUnderlineOffset: "4px" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--fg)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--muted-fg)"}>
                        Şifremi unuttum?
                      </Link>
                    </div>
                    <input 
                      id="password" type="password" required placeholder="••••••••" style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "var(--teal)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* === KAYIT (REGISTER) FORM ADIMLARI === */}
              {authMode === "register" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Step İndikatörü */}
                  <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                    {Array.from({ length: activeTab === "kisisel" ? 2 : 4 }).map((_, i) => (
                      <div key={i} style={{ 
                        flex: 1, 
                        height: "4px", 
                        borderRadius: "2px", 
                        backgroundColor: i + 1 <= registerStep ? "var(--teal)" : "var(--muted-bg)",
                        transition: "background-color 0.3s ease"
                      }} />
                    ))}
                  </div>

                  {/* BİREYSEL KAYIT ADIMLARI (2 Adım) */}
                  {activeTab === "kisisel" && (
                    <>
                      {/* Step 1: Profil Bilgileri */}
                      {registerStep === 1 && (
                        <>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Ad</label>
                              <input type="text" required placeholder="Ahmet" style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Soyad</label>
                              <input type="text" required placeholder="Yılmaz" style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Doğum Tarihi</label>
                            <input type="date" required style={inputStyle} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Cep Telefonu</label>
                            <input type="tel" required placeholder="0555..." style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
                          </div>
                        </>
                      )}
                      {/* Step 2: Güvenlik */}
                      {registerStep === 2 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>E-posta Adresiniz</label>
                            <input type="email" required placeholder="ornek@posta.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Güvenli Şifre Oluşturun</label>
                            <input type="password" required placeholder="••••••••" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* MAĞAZA KAYIT ADIMLARI (4 Adım) */}
                  {activeTab === "magaza" && (
                    <>
                      {/* Step 1: Yetkili Bilgileri */}
                      {registerStep === 1 && (
                        <>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Yetkili Ad</label>
                              <input type="text" required placeholder="İsim" style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Yetkili Soyad</label>
                              <input type="text" required placeholder="Soyisim" style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Doğum Tarihi</label>
                              <input type="date" required style={inputStyle} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Ünvanı</label>
                              <input type="text" required placeholder="Örn: Müdür" style={inputStyle} value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} />
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Cep Telefonu</label>
                            <input type="tel" required placeholder="0555..." style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
                          </div>
                        </>
                      )}
                      
                      {/* Step 2: Kurumsal Bilgiler */}
                      {registerStep === 2 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Mağaza/Marka Adı</label>
                            <input type="text" required placeholder="X Teknoloji A.Ş." style={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Vergi Numarası / TC Kimlik</label>
                            <input type="text" required placeholder="Sadece Rakam" style={inputStyle} value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Website Adresi</label>
                            <input type="url" required placeholder="https://..." style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} />
                          </div>
                        </>
                      )}

                      {/* Step 3: Güvenlik & Altyapı */}
                      {registerStep === 3 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Yetkili İş E-postası (Giriş için kullanılacak)</label>
                            <input type="email" required placeholder="iletisim@marka.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={labelStyle}>Hesap Şifresi</label>
                            <input type="password" required placeholder="••••••••" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
                          </div>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Altyapı</label>
                              <select required style={{ ...inputStyle, padding: "12px" }} value={infrastructure} onChange={(e) => setInfrastructure(e.target.value)}>
                                <option value="">Seçiniz...</option>
                                <option value="ideasoft">IdeaSoft</option>
                                <option value="ticimax">Ticimax</option>
                                <option value="tsoft">T-Soft</option>
                                <option value="diger">Diğer</option>
                              </select>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <label style={labelStyle}>Ürün XML Linki</label>
                              <input type="url" placeholder="https://..." style={inputStyle} value={xmlLink} onChange={(e) => setXmlLink(e.target.value)} />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Step 4: Paket Seçimi */}
                      {registerStep === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)", marginBottom: "4px" }}>Platform Paketleri</p>
                          
                          {[
                            { id: "starter", name: "Starter", price: "999 TL / ay", desc: "100 ürün beslemesi ve temel görünürlük" },
                            { id: "professional", name: "Professional", price: "İlk 1 Yıl Ücretsiz", desc: "1000 ürün ve lansman önceliği", popular: true },
                            { id: "enterprise", name: "Enterprise", price: "9.999 TL / ay", desc: "Sınırsız ürün ve marka yönetimi" },
                          ].map((pkg) => (
                            <div 
                              key={pkg.id} 
                              onClick={() => setSelectedPackage(pkg.id)}
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                padding: "12px 16px", 
                                borderRadius: "10px", 
                                border: selectedPackage === pkg.id ? "1.5px solid var(--teal)" : "1px solid var(--border)",
                                backgroundColor: selectedPackage === pkg.id ? "rgba(0, 229, 188, 0.05)" : "var(--bg)",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--fg)", display: "flex", alignItems: "center", gap: "8px" }}>
                                  {pkg.name}
                                  {pkg.popular && <span style={{ fontSize: "11px", backgroundColor: "var(--teal)", color: "var(--dark)", padding: "2px 8px", borderRadius: "100px", fontWeight: 800 }}>LANSMAN</span>}
                                </p>
                                <p style={{ fontSize: "12px", color: "var(--muted-fg)" }}>{pkg.desc}</p>
                              </div>
                              <div style={{ fontSize: "14px", fontWeight: 700, color: pkg.popular ? "var(--teal)" : "var(--fg)" }}>
                                {pkg.price}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ACTION BUTONLARI (SUBMIT & BACK) */}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                {authMode === "register" && registerStep > 1 && (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    style={{
                      padding: "0 14px",
                      backgroundColor: "var(--muted-bg)",
                      color: "var(--fg)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--muted-bg)"}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "14px",
                    backgroundColor: "var(--fg)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    opacity: isLoading ? 0.8 : 1,
                    transition: "transform 0.1s ease"
                  }}
                  onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : (
                    authMode === "login" ? "Giriş Yap" : (
                      (activeTab === "kisisel" && registerStep === 2) || (activeTab === "magaza" && registerStep === 4) 
                        ? "Kayıt İşlemini Tamamla" 
                        : "Sonraki Adım"
                    )
                  )}
                  {authMode === "register" && !isLoading && ((activeTab === "kisisel" && registerStep < 2) || (activeTab === "magaza" && registerStep < 4)) && <ChevronRight size={16} />}
                </button>
              </div>

            </form>

            {/* ALT YÖNLENDİRME YAZILARI */}
            <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted-fg)", marginTop: "-4px" }}>
              {authMode === "login" ? (
                <>
                  Hesabınız yok mu?{" "}
                  <button type="button" onClick={() => toggleAuthMode("register")} style={{ color: "var(--fg)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "4px", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit", fontFamily: "inherit" }}>
                    Ücretsiz kayıt olun
                  </button>
                </>
              ) : (
                <>
                  Zaten hesabınız var mı?{" "}
                  <button type="button" onClick={() => toggleAuthMode("login")} style={{ color: "var(--fg)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "4px", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit", fontFamily: "inherit" }}>
                    Giriş yapın
                  </button>
                </>
              )}
            </p>

            {/* SOSYAL MEDYA İLE GİRİŞ */}
            {authMode === "login" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "4px 0" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
                  <span style={{ fontSize: "12px", color: "var(--muted-fg)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>veya şununla devam edin</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <button aria-label="GitHub ile giriş yap" style={socialBtnStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--muted-bg)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <Github size={18} />
                  </button>
                  <button aria-label="Google ile giriş yap" style={socialBtnStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--muted-bg)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z"></path>
                    </svg>
                  </button>
                  <button aria-label="Twitter ile giriş yap" style={socialBtnStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--muted-bg)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <Twitter size={18} />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Sağ Sütun - Görsel */}
      <div className="login-cover-container" style={{ flex: 1, position: "relative", display: "none" }}>
        <style>{`
          @media (min-width: 1024px) {
            .login-cover-container {
              display: block !important;
            }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <img 
          src="https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1080" 
          alt="Giriş Ekranı"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--teal)", mixBlendMode: "multiply", opacity: 0.15 }} />
      </div>
    </div>
  );
}

export default function GirisYapPageWrapper() {
  return (
    <Suspense>
      <GirisYapPage />
    </Suspense>
  );
}
