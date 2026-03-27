import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  image?: string;
  lowestPrice: number;
  originalPrice?: number | null;
  storeCount: number;
  specs?: Record<string, string>;
  discount?: number | null;
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  columns = 3,
  isLoading,
  emptyMessage = "Ürün bulunamadı",
}: ProductGridProps) {
  const gridCols = {
    2: "sm:grid-cols-1 lg:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold mb-2">Ürün Bulunamadı</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          brand={product.brand}
          image={product.image}
          lowestPrice={product.lowestPrice}
          originalPrice={product.originalPrice}
          storeCount={product.storeCount}
          specs={product.specs}
          discount={product.discount}
        />
      ))}
    </div>
  );
}
