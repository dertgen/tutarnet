"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricePoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  productName: string;
  priceHistory: PricePoint[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

type TimeRange = "6m" | "1y" | "2y";

export function PriceHistoryChart({
  productName,
  priceHistory,
  lowestPrice,
  highestPrice,
  averagePrice,
}: PriceHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");

  const timeRangeLabels: Record<TimeRange, string> = {
    "6m": "6 Ay",
    "1y": "1 Yıl",
    "2y": "2 Yıl",
  };

  // Calculate price change
  const firstPrice = priceHistory[0]?.price || 0;
  const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
  const priceChange = firstPrice - lastPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPriceDown = priceChange > 0;

  // Simple bar chart representation
  const maxPrice = Math.max(...priceHistory.map((p) => p.price));
  const minPrice = Math.min(...priceHistory.map((p) => p.price));
  const priceRange = maxPrice - minPrice || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Fiyat Geçmişi</CardTitle>
          <div className="flex gap-1">
            {(["6m", "1y", "2y"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-8 text-xs"
              >
                {timeRangeLabels[range]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Change Indicator */}
        <div className="mb-4 flex items-center gap-2">
          <Badge
            variant={isPriceDown ? "default" : "destructive"}
            className="text-xs"
          >
            {isPriceDown ? "↓" : "↑"} {priceChangePercent.toFixed(1)}%
          </Badge>
          <span className="text-sm text-muted-foreground">
            {timeRangeLabels[timeRange]} içinde
          </span>
        </div>

        {/* Chart Area */}
        <div className="h-48 relative bg-muted/50 rounded-lg overflow-hidden">
          {/* Average line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-primary/50 z-10"
            style={{
              top: `${((maxPrice - averagePrice) / priceRange) * 100}%`,
            }}
          >
            <div className="absolute -left-1 -top-2 text-xs bg-primary text-primary-foreground px-1 rounded">
              Ort
            </div>
          </div>

          {/* Price bars */}
          <div className="absolute inset-0 flex items-end justify-around px-2 pb-2">
            {priceHistory.map((point, index) => {
              const height = ((point.price - minPrice) / priceRange) * 80 + 10;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1"
                  title={`${point.date}: ${point.price.toLocaleString("tr-TR")} ₺`}
                >
                  <div
                    className="w-4 bg-primary/70 hover:bg-primary rounded-t transition-colors"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground rotate-45 origin-top-left">
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-muted-foreground">En Düşük</div>
            <div className="font-bold text-green-600">
              {lowestPrice.toLocaleString("tr-TR")} ₺
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Ortalama</div>
            <div className="font-bold">
              {averagePrice.toLocaleString("tr-TR")} ₺
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">En Yüksek</div>
            <div className="font-bold text-red-600">
              {highestPrice.toLocaleString("tr-TR")} ₺
            </div>
          </div>
        </div>

        {/* Alert Button */}
        <Button variant="outline" className="w-full mt-4">
          🔔 Fiyat Düşünce Bildir
        </Button>
      </CardContent>
    </Card>
  );
}
