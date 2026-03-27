"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, User, Check } from "lucide-react";

interface Staff {
    id: string;
    name: string;
}

interface ServiceStaff {
    staff: Staff;
}

interface Variation {
    id: string;
    name: string;
    price: number;
    duration: number;
}

interface Partner {
    id: string;
    name: string;
}

interface Service {
    id: string;
    name: string;
    price_min: number;
    duration: number;
    partner: Partner;
    variations: Variation[];
    staff: ServiceStaff[];
}

export default function RandevuPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const serviceId = params.service_id as string;
    const variationId = searchParams.get("variation");

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [notes, setNotes] = useState("");
    const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", email: "" });
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchService();
    }, [serviceId]);

    const fetchService = async () => {
        try {
            const response = await fetch(`/api/services/${serviceId}`);
            const data = await response.json();
            setService(data.service);
        } catch (error) {
            console.error("Hizmet yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAvailableTimes = () => {
        // Saat aralıkları (örnek: 09:00 - 18:00)
        const times = [];
        for (let hour = 9; hour < 18; hour++) {
            times.push(`${String(hour).padStart(2, "0")}:00`);
            times.push(`${String(hour).padStart(2, "0")}:30`);
        }
        return times;
    };

    const handleSubmit = async () => {
        if (!service) return;

        setSubmitting(true);
        try {
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: "temp-user-id", // TODO: Auth ile değiştir
                    partner_id: service.partner.id,
                    service_id: serviceId,
                    staff_id: selectedStaff || null,
                    date: selectedDate,
                    start_time: selectedTime,
                    variation_id: variationId,
                    notes,
                }),
            });

            if (response.ok) {
                setSuccess(true);
            }
        } catch (error) {
            console.error("Randevu oluşturulamadı:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: 48, textAlign: "center" }}>Yükleniyor...</div>;
    if (!service) return <div style={{ padding: 48, textAlign: "center" }}>Hizmet bulunamadı</div>;

    const selectedVariation = service.variations.find((v) => v.id === variationId);
    const price = selectedVariation?.price || service.price_min;
    const duration = selectedVariation?.duration || service.duration;

    if (success) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ textAlign: "center", maxWidth: 400 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "var(--teal-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                        <Check size={40} color="var(--teal)" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Randevunuz Alındı!</h1>
                    <p style={{ color: "var(--muted-fg)", marginBottom: 24 }}>
                        {service.partner.name} için {selectedDate} tarihinde saat {selectedTime}'te randevunuz oluşturuldu.
                    </p>
                    <Link href="/" style={{ display: "inline-block", padding: "14px 32px", backgroundColor: "var(--teal)", color: "var(--dark-text)", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
            {/* Header */}
            <div style={{ backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 24px" }}>
                    <Link href={`/hizmet/${serviceId}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-fg)", textDecoration: "none" }}>
                        <ChevronLeft size={20} />
                        Geri
                    </Link>
                </div>
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
                {/* Progress */}
                <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step >= s ? "var(--teal)" : "var(--border)" }} />
                    ))}
                </div>

                {/* Service Summary */}
                <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>{service.partner.name}</div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{service.name}</div>
                            {selectedVariation && <div style={{ fontSize: 14, color: "var(--teal)" }}>{selectedVariation.name}</div>}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal)" }}>{price} ₺</div>
                            <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>{duration} dk</div>
                        </div>
                    </div>
                </div>

                {/* Step 1: Date & Time */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Tarih ve Saat Seçin</h2>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Tarih</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
                            />
                        </div>

                        {selectedDate && (
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Saat</label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                    {getAvailableTimes().map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            style={{
                                                padding: 12,
                                                borderRadius: 8,
                                                border: "1px solid",
                                                borderColor: selectedTime === time ? "var(--teal)" : "var(--border)",
                                                backgroundColor: selectedTime === time ? "var(--teal-dim)" : "var(--card-bg)",
                                                color: selectedTime === time ? "var(--teal)" : "var(--fg)",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {service.staff.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Personel (Opsiyonel)</label>
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    {service.staff.map((s) => (
                                        <button
                                            key={s.staff.id}
                                            onClick={() => setSelectedStaff(selectedStaff === s.staff.id ? "" : s.staff.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "8px 16px",
                                                borderRadius: 20,
                                                border: "1px solid",
                                                borderColor: selectedStaff === s.staff.id ? "var(--teal)" : "var(--border)",
                                                backgroundColor: selectedStaff === s.staff.id ? "var(--teal-dim)" : "var(--card-bg)",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <User size={16} />
                                            {s.staff.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedDate || !selectedTime}
                            style={{
                                width: "100%",
                                padding: 16,
                                backgroundColor: "var(--teal)",
                                color: "var(--dark-text)",
                                border: "none",
                                borderRadius: 10,
                                fontWeight: 700,
                                cursor: !selectedDate || !selectedTime ? "not-allowed" : "pointer",
                                opacity: !selectedDate || !selectedTime ? 0.5 : 1,
                            }}
                        >
                            Devam
                        </button>
                    </div>
                )}

                {/* Step 2: Customer Info */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>İletişim Bilgileri</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Ad Soyad *</label>
                                <input
                                    type="text"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Telefon *</label>
                                <input
                                    type="tel"
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>E-posta</label>
                                <input
                                    type="email"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Not (Opsiyonel)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Özel bir isteğiniz var mı?"
                                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--fg)", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{ flex: 1, padding: 16, backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--fg)", fontWeight: 600 }}
                            >
                                Geri
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!customerInfo.name || !customerInfo.phone}
                                style={{ flex: 2, padding: 16, backgroundColor: "var(--teal)", color: "var(--dark-text)", border: "none", borderRadius: 10, fontWeight: 700, cursor: !customerInfo.name || !customerInfo.phone ? "not-allowed" : "pointer", opacity: !customerInfo.name || !customerInfo.phone ? 0.5 : 1 }}
                            >
                                Devam
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Randevu Özeti</h2>

                        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <Calendar size={20} color="var(--teal)" />
                                    <div>
                                        <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>Tarih</div>
                                        <div style={{ fontWeight: 600 }}>{selectedDate}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <Clock size={20} color="var(--teal)" />
                                    <div>
                                        <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>Saat</div>
                                        <div style={{ fontWeight: 600 }}>{selectedTime}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <User size={20} color="var(--teal)" />
                                    <div>
                                        <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>İletişim</div>
                                        <div style={{ fontWeight: 600 }}>{customerInfo.name} • {customerInfo.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            <button
                                onClick={() => setStep(2)}
                                style={{ flex: 1, padding: 16, backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--fg)", fontWeight: 600 }}
                            >
                                Geri
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{ flex: 2, padding: 16, backgroundColor: "var(--teal)", color: "var(--dark-text)", border: "none", borderRadius: 10, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
                            >
                                {submitting ? "İşleniyor..." : "Randevuyu Onayla"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}