"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, MapPin, User, Building2, Scissors, Wrench, Paintbrush, Sparkles, Stethoscope, Car, Home, Briefcase } from "lucide-react";

const sectors = [
    { value: "E_COMMERCE", label: "E-Ticaret", icon: Store, description: "Online ürün satışı" },
    { value: "BARBER", label: "Berber", icon: User, description: "Erkek kuaförü" },
    { value: "HAIRDRESSER", label: "Kuaför", icon: Scissors, description: "Kadın kuaförü" },
    { value: "PLUMBER", label: "Tesisatçı", icon: Wrench, description: "Su ve doğalgaz tesisatı" },
    { value: "ELECTRICIAN", label: "Elektrikçi", icon: Sparkles, description: "Elektrik işleri" },
    { value: "PAINTER", label: "Boyacı", icon: Paintbrush, description: "İç ve dış boya" },
    { value: "SPA", label: "Spa & Wellness", icon: Sparkles, description: "Masaj ve spa hizmetleri" },
    { value: "CLINIC", label: "Klinik", icon: Stethoscope, description: "Sağlık ve güzellik merkezi" },
    { value: "CLEANING", label: "Temizlik", icon: Home, description: "Ev ve ofis temizliği" },
    { value: "MOVING", label: "Nakliyat", icon: Car, description: "Taşımacılık hizmetleri" },
    { value: "REPAIR", label: "Tamir", icon: Wrench, description: "Elektronik ve mobilya tamir" },
    { value: "OTHER", label: "Diğer", icon: Briefcase, description: "Diğer hizmetler" },
];

export default function PartnerOlPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        // Kullanıcı bilgileri
        email: "",
        password: "",
        confirmPassword: "",
        name: "",

        // Partner bilgileri
        partner_name: "",
        type: "SERVICE",
        sector: "",
        phone: "",
        partner_email: "",
        website: "",

        // Lokasyon
        address: "",
        city: "",
        district: "",
        neighborhood: "",

        // Açıklama
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const selectSector = (sector: string) => {
        setFormData({
            ...formData,
            sector,
            type: sector === "E_COMMERCE" ? "E_COMMERCE" : "SERVICE"
        });
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Şifre kontrolü
        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/partners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    partner_name: formData.partner_name,
                    type: formData.type,
                    sector: formData.sector,
                    phone: formData.phone,
                    partner_email: formData.partner_email || formData.email,
                    website: formData.website,
                    address: formData.address,
                    city: formData.city,
                    district: formData.district,
                    neighborhood: formData.neighborhood,
                    description: formData.description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Bir hata oluştu");
            }

            // Başarılı - giriş sayfasına yönlendir
            router.push("/giris-yap?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--fg)", marginBottom: "12px" }}>
                        Partner Ol
                    </h1>
                    <p style={{ fontSize: "16px", color: "var(--muted-fg)" }}>
                        İşletmenizi Tutar.net'e ekleyin, yeni müşterilere ulaşın
                    </p>
                </div>

                {/* Step Indicator */}
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "48px" }}>
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                backgroundColor: step >= s ? "var(--teal)" : "var(--muted-bg)",
                                color: step >= s ? "var(--dark-text)" : "var(--muted-fg)",
                            }}
                        >
                            {s}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: "16px",
                        backgroundColor: "var(--red-dim)",
                        border: "1px solid var(--red)",
                        borderRadius: "10px",
                        color: "var(--red)",
                        marginBottom: "24px",
                    }}>
                        {error}
                    </div>
                )}

                {/* Step 1: Sektör Seçimi */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", textAlign: "center" }}>
                            İşletme Türünüzü Seçin
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                            {sectors.map((sector) => {
                                const Icon = sector.icon;
                                return (
                                    <button
                                        key={sector.value}
                                        onClick={() => selectSector(sector.value)}
                                        style={{
                                            padding: "24px",
                                            backgroundColor: "var(--muted-bg)",
                                            border: "2px solid var(--border)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "12px",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "var(--teal)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "var(--border)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                    >
                                        <Icon size={32} color="var(--teal)" />
                                        <div style={{ fontWeight: 600, color: "var(--fg)" }}>{sector.label}</div>
                                        <div style={{ fontSize: "13px", color: "var(--muted-fg)", textAlign: "center" }}>
                                            {sector.description}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: Hesap Bilgileri */}
                {step === 2 && (
                    <form onSubmit={() => setStep(3)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
                            Hesap Bilgileriniz
                        </h2>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                Ad Soyad *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                E-posta Adresi *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                Şifre *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                Şifre Tekrar *
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    backgroundColor: "transparent",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    color: "var(--fg)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Geri
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    backgroundColor: "var(--teal)",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "var(--dark-text)",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Devam
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: İşletme Bilgileri */}
                {step === 3 && (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
                            İşletme Bilgileri
                        </h2>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                İşletme Adı *
                            </label>
                            <input
                                type="text"
                                name="partner_name"
                                value={formData.partner_name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                }}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                    Telefon *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg)",
                                        color: "var(--fg)",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                    Web Sitesi
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg)",
                                        color: "var(--fg)",
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                    İl *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg)",
                                        color: "var(--fg)",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                    İlçe *
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg)",
                                        color: "var(--fg)",
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                Adres *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                    resize: "vertical",
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--fg)" }}>
                                İşletme Açıklaması
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="İşletmenizi kısaca tanıtın..."
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                    resize: "vertical",
                                }}
                            />
                        </div>

                        {/* Lansman Kampanyası */}
                        <div style={{
                            padding: "16px",
                            backgroundColor: "var(--teal-dim)",
                            border: "1px solid var(--teal)",
                            borderRadius: "10px",
                            marginTop: "8px",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                <Sparkles size={20} color="var(--teal)" />
                                <span style={{ fontWeight: 700, color: "var(--teal)" }}>Lansmana Özel Kampanya</span>
                            </div>
                            <p style={{ fontSize: "14px", color: "var(--fg)", margin: 0 }}>
                                Şimdi kaydolun, <strong>1 yıl boyunca ücretsiz</strong> kullanın!
                                Kredi kartı gerektirmez.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    backgroundColor: "transparent",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    color: "var(--fg)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Geri
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    backgroundColor: "var(--teal)",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "var(--dark-text)",
                                    fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}