import Link from "next/link";
import { Star, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  image?: string;
  lowestPrice: number;
  originalPrice?: number | null;
  storeCount: number;
  specs?: Record<string, string>;
  showCompareButton?: boolean;
  discount?: number | null;
  rating?: number; // Optional olarak 5 üzerinden puan eklenebilir
}

export function ProductCard({
  name,
  slug,
  brand,
  image,
  lowestPrice,
  originalPrice,
  storeCount,
  showCompareButton = true,
  discount,
  rating = 4, // Varsayılan olarak 4 yıldız görünümü
}: ProductCardProps) {
  return (
    <Card className="flex flex-col group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <Link href={`/urun/${slug}`} className="relative aspect-square w-full overflow-hidden bg-muted p-4 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        )}
        
        {/* Mağaza Sayısı Rozeti */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold">
          {storeCount} Mağaza
        </div>

        {/* İndirim Rozeti */}
        {discount && discount > 0 ? (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-destructive text-white text-[11px] font-bold">
            -%{discount}
          </div>
        ) : null}
        
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <Link href={`/urun/${slug}`} className="flex-1">
          <h3 className="text-[15px] font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {name}
          </h3>
          {brand && <p className="text-[13px] text-muted-foreground mt-1">{brand}</p>}
        </Link>
        
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary leading-none">
              {lowestPrice.toLocaleString("tr-TR")} ₺
            </span>
            {originalPrice && originalPrice > lowestPrice && (
              <span className="text-[12px] text-muted-foreground line-through mt-1">
                {originalPrice.toLocaleString("tr-TR")} ₺
              </span>
            )}
          </div>

          {/* Yıldızlar */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <Star 
                key={starIdx} 
                className={`w-3.5 h-3.5 ${starIdx <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">({rating})</span>
          </div>
        </div>
      </CardContent>

      {showCompareButton && (
        <CardFooter className="px-4 pb-4 pt-0">
          <Button asChild variant="outline" className="w-full text-[13px] h-9" tabIndex={-1}>
            <Link href={`/urun/${slug}`}>
              Fiyatları Karşılaştır
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
