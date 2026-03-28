"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Clock, Phone, Mail, Globe, Calendar, ChevronLeft } from "lucide-react";

export default function HizmetDetayPage() {
    const params = useParams();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState<any>(null);

    useEffect(() => {
        fetchService();
    }, [params.id]);

    const fetchService = async () => {
        try {
            const response = await fetch(`/api/services/${params.id}`);
            const data = await response.json();
            setService(data.service);
            if (data.service?.variations?.length > 0) {
                setSelectedVariation(data.service.variations[0]);
            }
        } catch (error) {
            console.error("Hizmet yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 48, textAlign: "center" }}>Yükleniyor...</div>;
    if (!service) return <div style={{ padding: 48, textAlign: "center" }}>Hizmet bulunamadı</div>;

    const currentPrice = selectedVariation?.price || service.price_min;
    const currentDuration = selectedVariation?.duration || service.duration;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
            {/* Header */}
            <div style={{ backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px" }}>
                    <Link href="/hizmetler" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-fg)", textDecoration: "none" }}>
                        <ChevronLeft size={20} />
                        Tüm Hizmetler
                    </Link>
                </div>
            </div>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
                {/* Left Column */}
                <div>
                    {/* Partner Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "var(--muted-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {service.partner.logo_url ? (
                                <img src={service.partner.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ fontSize: 32, fontWeight: 700, color: "var(--teal)" }}>{service.partner.name.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{service.partner.name}</h1>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-fg)" }}>
                                <MapPin size={16} />
                                {service.partner.city}, {service.partner.district}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                <Star size={16} fill="var(--teal)" color="var(--teal)" />
                                <span style={{ fontWeight: 600 }}>{service.partner.rating_average}</span>
                                <span style={{ color: "var(--muted-fg)" }}>({service.partner.review_count} yorum)</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Name */}
                    <div style={{ fontSize: 14, color: "var(--teal)", fontWeight: 500, marginBottom: 8 }}>{service.category.name}</div>
                    <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>{service.name}</h2>
                    <p style={{ color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: 32 }}>{service.description}</p>

                    {/* Varyasyonlar */}
                    {service.variations.length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Seçenekler</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {service.variations.map((v: any) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariation(v)}
                                        style={{
                                            padding: 16,
                                            borderRadius: 10,
                                            border: "2px solid",
                                            borderColor: selectedVariation?.id === v.id ? "var(--teal)" : "var(--border)",
                                            backgroundColor: selectedVariation?.id === v.id ? "var(--teal-dim)" : "var(--card-bg)",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{v.name}</div>
                                            <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>{v.duration} dk</div>
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--teal)" }}>{v.price} ₺</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* İletişim */}
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>İletişim</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {service.partner.phone && (
                                <a href={`tel:${service.partner.phone}`} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg)", textDecoration: "none" }}>
                                    <Phone size={20} color="var(--teal)" />
                                    {service.partner.phone}
                                </a>
                            )}
                            {service.partner.email && (
                                <a href={`mailto:${service.partner.email}`} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg)", textDecoration: "none" }}>
                                    <Mail size={20} color="var(--teal)" />
                                    {service.partner.email}
                                </a>
                            )}
                            {service.partner.website && (
                                <a href={service.partner.website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg)", textDecoration: "none" }}>
                                    <Globe size={20} color="var(--teal)" />
                                    Web Sitesi
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking Card */}
                <div>
                    <div style={{ position: "sticky", top: 24, backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>Fiyat</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--teal)" }}>{currentPrice} ₺</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>Süre</div>
                                <div style={{ fontSize: 20, fontWeight: 600 }}>{currentDuration} dk</div>
                            </div>
                        </div>

                        <Link
                            href={`/randevu/${service.id}?variation=${selectedVariation?.id || ""}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                width: "100%",
                                padding: "16px",
                                backgroundColor: "var(--teal)",
                                color: "var(--dark-text)",
                                borderRadius: 10,
                                fontWeight: 700,
                                textDecoration: "none",
                                marginBottom: 16,
                            }}
                        >
                            <Calendar size={20} />
                            Randevu Al
                        </Link>

                        <p style={{ fontSize: 13, color: "var(--muted-fg)", textAlign: "center", margin: 0 }}>
                            Ücretsiz iptal • Onay anında gelir
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}