import Link from "next/link";
import { Star, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  rating?: number;
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
  rating = 4,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="flex flex-col group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <Link 
        href={`/urun/${slug}`} 
        className="relative aspect-square w-full overflow-hidden bg-muted p-4 flex items-center justify-center"
        aria-label={`${name} ürün detayları`}
      >
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
            <ImageIcon className="w-12 h-12" />
            <span className="text-[10px] uppercase font-medium">Görsel Yok</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold z-10">
          {storeCount} Mağaza
        </div>

        {discount && discount > 0 ? (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-destructive text-white text-[11px] font-bold z-10">
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

          <div className="flex items-center gap-0.5" aria-label={`Puan: ${rating} / 5`}>
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <Star 
                key={starIdx} 
                className={`w-3.5 h-3.5 ${starIdx <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">({rating})</span>
          </div>
        </div>
      </CardContent>

      {showCompareButton && (
        <CardFooter className="px-4 pb-4 pt-0">
          <Button asChild variant="outline" className="w-full text-[13px] h-9 font-medium" tabIndex={0}>
            <Link href={`/urun/${slug}`}>
              Fiyatları Karşılaştır
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
