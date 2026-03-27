// Prisma şemasından türetilmiş alan tipleri

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  url: string;
  trust_score: number;
  is_active: boolean;
  package_type: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string | null;
  created_at: Date;
  updated_at: Date;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  specs: Record<string, unknown> | null;
  images: string[];
  barcode: string | null;
  created_at: Date;
  updated_at: Date;
  category_id: string | null;
  category?: Category;
}

export interface Price {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  original_price: number | null;
  currency: string;
  url: string;
  in_stock: boolean;
  last_checked: Date;
  created_at: Date;
  updated_at: Date;
  product?: Product;
  store?: Store;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  recorded_at: Date;
  product?: Product;
  store?: Store;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Alert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  is_active: boolean;
  notified_at: Date | null;
  created_at: Date;
  updated_at: Date;
  user?: User;
  product?: Product;
}

export interface Deal {
  id: string;
  product_id: string | null;
  title: string;
  description: string | null;
  url: string;
  price: number | null;
  original_price: number | null;
  upvotes: number;
  downvotes: number;
  is_hot: boolean;
  is_frontpage: boolean;
  is_verified: boolean;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
  product?: Product | null;
}

export interface Comment {
  id: string;
  user_id: string;
  deal_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  user?: User;
  deal?: Deal;
}

export interface Vote {
  id: string;
  user_id: string;
  deal_id: string;
  vote_type: boolean;
  created_at: Date;
  user?: User;
  deal?: Deal;
}

// API Response Types
export interface ProductWithPrices extends Product {
  prices: PriceWithStore[];
  price_history?: PriceHistory[];
  lowest_price?: number;
  highest_price?: number;
  average_price?: number;
}

export interface PriceWithStore extends Price {
  store: Store;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
  product_count: number;
}

export interface SearchResults {
  products: ProductWithPrices[];
  total: number;
  page: number;
  page_size: number;
  query: string;
}

// Feed Types
export interface Feed {
  id: string;
  store_id: string;
  feed_url: string | null;
  feed_type: string;
  last_fetch: Date | null;
  fetch_status: string;
  error_message: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FeedItem {
  id: string;
  feed_id: string;
  external_id: string;
  product_name: string;
  product_url: string;
  price: number;
  currency: string;
  stock_status: string;
  image_url: string | null;
  brand: string | null;
  model: string | null;
  category_path: string | null;
  specs: Record<string, unknown> | null;
  last_updated: Date;
  created_at: Date;
  feed?: Feed;
  product?: Product | null;
  product_id: string | null;
}

// Store Package Types
export interface StorePackage {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  max_products: number;
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// UI Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
}
