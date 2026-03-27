import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { prisma } from "@/lib/db/prisma";
import { Store, MapPin, Package, ShoppingBag } from "lucide-react";

export const revalidate = 300;

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ECOMMERCE:  { label: "E-Ticaret",   color: "#6366f1", bg: "#ede9fe" },
  PHYSICAL:   { label: "Fiziksel",    color: "#10b981", bg: "#d1fae5" },
  HYBRID:     { label: "Hibrit",      color: "#f59e0b", bg: "#fef3c7" },
};

async function getPartners(page = 1) {
  const take = 48;
  const skip = (page - 1) * take;
  try {
    const [partners, total] = await prisma.$transaction([
      prisma.partner.findMany({
        where: { status: "ACTIVE" },
        orderBy: { click_count: "desc" },
        take,
        skip,
        select: {
          id: true, name: true, slug: true, logo_url: true,
          city: true, type: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.partner.count({ where: { status: "ACTIVE" } }),
    ]);
    return { partners, total, totalPages: Math.ceil(total / take) };
  } catch {
    return { partners: [], total: 0, totalPages: 0 };
  }
}

export default async function MagazalarPage({ searchParams }: { searchParams: Promise<{ sayfa?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.sayfa ?? "1", 10) || 1);
  const { partners, total, totalPages } = await getPartners(page);

  return (
    <PageLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ fontSize: "13px", color: "var(--muted-fg)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Ana Sayfa</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--fg)" }}>Mağazalar</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px", letterSpacing: "-0.3px", color: "var(--fg)" }}>Mağazalar</h1>
            <p style={{ fontSize: "14px", color: "var(--muted-fg)" }}>
              {total > 0
                ? `${total.toLocaleString("tr-TR")} aktif mağaza — fiyatları karşılaştırın`
                : "Tüm mağazaları keşfedin ve fiyatları karşılaştırın."}
            </p>
          </div>
          {total > 0 && (
            <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "var(--muted-fg)" }}>
              <Store size={15} style={{ marginTop: "1px" }} />
              Sayfa {page} / {Math.max(1, totalPages)}
            </div>
          )}
        </div>

        {partners.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted-fg)" }}>
            <ShoppingBag size={48} style={{ margin: "0 auto 16px", opacity: 0.15, display: "block" }} />
            <p style={{ fontSize: "15px", marginBottom: "8px", color: "var(--fg)" }}>Henüz aktif mağaza bulunmuyor.</p>
            <p style={{ fontSize: "14px" }}>Mağaza olmak için hemen başvurun.</p>
            <Link href="/magaza-ol" style={{ display: "inline-block", marginTop: "20px", padding: "10px 24px", backgroundColor: "var(--fg)", color: "var(--bg)", textDecoration: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600 }}>
              Mağaza Ol
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {partners.map((partner) => {
                const type = TYPE_LABELS[partner.type] ?? TYPE_LABELS.ECOMMERCE;
                return (
                  <Link
                    key={partner.id}
                    href={`/magaza/${partner.slug}`}
                    style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border)", borderRadius: "12px", textDecoration: "none", color: "var(--fg)", backgroundColor: "var(--bg)", transition: "box-shadow 0.2s, border-color 0.2s" }}
                  >
                    <div style={{ width: "100%", height: "110px", backgroundColor: "var(--muted-bg)", borderRadius: "8px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, color: "var(--fg)", overflow: "hidden" }}>
                      {partner.logo_url ? (
                        <img src={partner.logo_url} alt={partner.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }} />
                      ) : (
                        partner.name[0].toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.3, color: "var(--fg)" }}>{partner.name}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: type.bg, color: type.color }}>{type.label}</span>
                        {partner.city && (
                          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "var(--muted-fg)" }}>
                            <MapPin size={10} /> {partner.city}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--muted-fg)" }}>
                        <Package size={12} />
                        {partner._count.products.toLocaleString("tr-TR")} ürün
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {page > 1 && (
                  <Link href={`/magazalar?sayfa=${page - 1}`} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: 500, color: "var(--fg)", textDecoration: "none" }}>
                    Önceki
                  </Link>
                )}
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <Link key={p} href={`/magazalar?sayfa=${p}`} style={{ padding: "8px 14px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: p === page ? 700 : 400, color: p === page ? "var(--bg)" : "var(--fg)", backgroundColor: p === page ? "var(--fg)" : "transparent", textDecoration: "none" }}>
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link href={`/magazalar?sayfa=${page + 1}`} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: 500, color: "var(--fg)", textDecoration: "none" }}>
                    Sonraki
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
