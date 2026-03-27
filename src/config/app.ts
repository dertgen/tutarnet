const APP_CONFIG = {
  name: "tutar.net",
  tagline: "Hizmetleri Karşılaştır, Tasarruf Et",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://tutar.net",
  supportEmail: "destek@tutar.net",
  defaultLocale: "tr-TR",
  currency: "TRY",
  currencySymbol: "₺",
} as const;

const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

const CACHE_CONFIG = {
  shortTtlSeconds: 60,
  defaultTtlSeconds: 300,
  longTtlSeconds: 3600,
} as const;

const FEED_CONFIG = {
  syncIntervalMinutes: 60,
  maxProductsPerFeed: 50000,
  supportedFormats: ["xml", "csv", "tsv", "json"] as const,
} as const;

export { APP_CONFIG, PAGINATION_CONFIG, CACHE_CONFIG, FEED_CONFIG };
