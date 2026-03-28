"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Clock, Search, Filter, ChevronDown } from "lucide-react";

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price_min: number | null;
    price_max: number | null;
    category: {
        name: string;
        slug: string;
    };
    partner: {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        city: string;
        district: string;
        rating_average: number;
        review_count: number;
    };
    variations: {
        id: string;
        name: string;
        price: number;
        duration: number;
    }[];
    _count: {
        reviews: number;
    };
}

function HizmetlerContent() {
    const searchParams = useSearchParams();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchServices();
    }, [category]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category) params.append("category", category);
            if (city) params.append("city", city);
            if (minPrice) params.append("min_price", minPrice);
            if (maxPrice) params.append("max_price", maxPrice);
            if (search) params.append("search", search);

            const response = await fetch(`/api/services?${params}`);
            const data = await response.json();
            setServices(data.services || []);
        } catch (error) {
            console.error("Hizmetler yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchServices();
    };

    const formatPrice = (min: number | null, max: number | null) => {
        if (!min && !max) return "Fiyat bilgisi yok";
        if (min === max || !max) return `${min} ₺`;
        return `${min} - ${max} ₺`;
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
            {/* Header */}
            <div style={{ backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px" }}>
                        Hizmet Keşfet
                    </h1>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                            <Search size={20} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-fg)" }} />
                            <input
                                type="text"
                                placeholder="Hizmet ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px 12px 12px 44px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                    fontSize: "15px",
                                }}
                            />
                        </div>
                        <div style={{ width: "200px" }}>
                            <input
                                type="text"
                                placeholder="Şehir"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--bg)",
                                    color: "var(--fg)",
                                    fontSize: "15px",
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                padding: "12px 20px",
                                backgroundColor: "var(--muted-bg)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                color: "var(--fg)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                            }}
                        >
                            <Filter size={18} />
                            Filtreler
                            <ChevronDown size={16} style={{ transform: showFilters ? "rotate(180deg)" : "none" }} />
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "var(--teal)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--dark-text)",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Ara
                        </button>
                    </form>

                    {/* Filters */}
                    {showFilters && (
                        <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "var(--muted-fg)", fontSize: "14px" }}>Fiyat:</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    style={{
                                        width: "80px",
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg)",
                                        color: "var(--fg)",
                                    }}
                                />
                                <span style={{ color: "var(--muted-fg)" }}>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    style={{
                                        width: "80px",
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg)",
                                        color: "var(--fg)",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "48px", color: "var(--muted-fg)" }}>
                        Yükleniyor...
                    </div>
                ) : services.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px", color: "var(--muted-fg)" }}>
                        Hizmet bulunamadı.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
                        {services.map((service) => (
                            <Link
                                key={service.id}
                                href={`/h/${service.id}`}
                                style={{
                                    backgroundColor: "var(--card-bg)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "16px",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {/* Partner Info */}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            backgroundColor: "var(--muted-bg)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {service.partner.logo_url ? (
                                            <img src={service.partner.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--teal)" }}>
                                                {service.partner.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: "var(--fg)" }}>{service.partner.name}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--muted-fg)" }}>
                                            <MapPin size={14} />
                                            {service.partner.city}, {service.partner.district}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Star size={16} fill="var(--teal)" color="var(--teal)" />
                                        <span style={{ fontWeight: 600 }}>{service.partner.rating_average}</span>
                                        <span style={{ fontSize: "13px", color: "var(--muted-fg)" }}>({service.partner.review_count})</span>
                                    </div>
                                </div>

                                {/* Service Info */}
                                <div>
                                    <div style={{ fontSize: "13px", color: "var(--teal)", fontWeight: 500, marginBottom: "4px" }}>
                                        {service.category.name}
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--fg)", marginBottom: "8px" }}>
                                        {service.name}
                                    </h3>
                                    {service.description && (
                                        <p style={{ fontSize: "14px", color: "var(--muted-fg)", lineHeight: 1.5, margin: 0 }}>
                                            {service.description.length > 100 ? service.description.substring(0, 100) + "..." : service.description}
                                        </p>
                                    )}
                                </div>

                                {/* Price & Duration */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted-fg)", fontSize: "14px" }}>
                                        <Clock size={16} />
                                        {service.duration} dk
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--teal)" }}>
                                            {formatPrice(service.price_min, service.price_max)}
                                        </div>
                                        {service.variations.length > 0 && (
                                            <div style={{ fontSize: "12px", color: "var(--muted-fg)" }}>
                                                {service.variations.length} seçenek
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HizmetlerPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><div>Yükleniyor...</div></div>}>
            <HizmetlerContent />
        </Suspense>
    );
}
