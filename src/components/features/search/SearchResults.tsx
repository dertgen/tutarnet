import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  image: string;
  lowestPrice: number;
  originalPrice: number | null;
  storeCount: number;
  specs: Record<string, string>;
}

interface SearchResultsProps {
  products: ProductResult[];
  total: number;
  query: string;
  page: number;
  pageSize: number;
  isLoading?: boolean;
}

export function SearchResults({
  products,
  total,
  query,
  page,
  pageSize,
  isLoading,
}: SearchResultsProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
        <p className="text-muted-foreground mb-4">
          &quot;{query}&quot; için arama sonucu bulunamadı.
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Aramalarınızı kontrol edin veya:</p>
          <ul className="mt-2 space-y-1">
            <li>• Farklı anahtar kelimeler deneyin</li>
            <li>• Daha genel terimler kullanın</li>
            <li>• Yazım hatalarını kontrol edin</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        <span>&quot;{query}&quot;</span> için{" "}
        <span className="font-bold text-foreground">{total}</span> sonuç bulundu
        (Sayfa {page} / {totalPages})
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group">
            <Link href={`/urun/${product.slug}`}>
              <div className="relative aspect-square bg-muted">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {product.storeCount} mağaza
                </Badge>
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/urun/${product.slug}`}>
                <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              {product.brand && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.brand}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {product.specs["Ekran"]} • {product.specs["Depolama"]}
              </p>
              <div className="mt-3">
                <span className="text-xl font-bold text-primary">
                  {product.lowestPrice.toLocaleString("tr-TR")} ₺
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    {product.originalPrice.toLocaleString("tr-TR")} ₺
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" variant="outline" size="sm" asChild>
                <Link href={`/urun/${product.slug}`}>Karşılaştır</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
