// Enum tanımları — Prisma migration tamamlandığında @prisma/client eşdeğerleriyle uyumludur

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "EDITOR" | "VIEWER";
export type ReportType = "REVIEW" | "CONTENT" | "PARTNER" | "USER" | "DEAL" | "SPAM";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BannerPlacement = "HOME" | "CATEGORY" | "SEARCH" | "PARTNER_DETAIL" | "ALL";
export type PageStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

// ============================================
// DASHBOARD / STATS
// ============================================

export interface StatsKpi {
  total_partners: number;
  pending_partners: number;
  active_partners: number;
  suspended_partners: number;
  total_users: number;
  new_users_this_month: number;
  total_products: number;
  total_services: number;
  total_appointments: number;
  open_reports: number;
  ecommerce_partners: number;
  service_partners: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface RecentPartner {
  id: string;
  name: string;
  slug: string;
  type: string;
  sector: string;
  status: string;
  city: string | null;
  created_at: Date;
  user: { email: string; name: string | null };
  _count: { products: number; services: number; reviews: number };
}

export interface StatsResponse {
  kpis: StatsKpi;
  partner_trend: TrendPoint[];
  user_trend: TrendPoint[];
  recent_partners: RecentPartner[];
  pending_reports: PendingReportSummary[];
}

export interface PendingReportSummary {
  id: string;
  type: ReportType;
  reason: string;
  severity: ReportSeverity;
  target_label: string;
  created_at: Date;
}

// ============================================
// KULLANICI YÖNETİMİ
// ============================================

export interface UserAdminView {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  partner: { id: string; name: string; status: string } | null;
  admin_staff: { role: AdminRole } | null;
  _count: { appointments: number; reviews: number; filed_reports: number };
}

export interface UsersListResponse {
  users: UserAdminView[];
  total: number;
  page: number;
  page_size: number;
}

export interface UpdateUserBody {
  name?: string;
  is_admin?: boolean;
  phone?: string;
}

// ============================================
// KATEGORİ YÖNETİMİ
// ============================================

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  icon: string | null;
  description: string | null;
  parent_id: string | null;
  parent: { id: string; name: string } | null;
  _count: { products: number; services: number; children: number };
  created_at: Date;
}

export interface CategoriesListResponse {
  categories: CategoryListItem[];
}

export interface CreateCategoryBody {
  name: string;
  slug?: string;
  type: string;
  icon?: string;
  description?: string;
  parent_id?: string;
  price_range_min?: number;
  price_range_max?: number;
  typical_duration?: number;
}

export interface UpdateCategoryBody {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
  parent_id?: string | null;
  price_range_min?: number;
  price_range_max?: number;
  typical_duration?: number;
}

// ============================================
// RAPOR / MODERASYON
// ============================================

export interface ReportAdminView {
  id: string;
  type: ReportType;
  reason: string;
  description: string;
  status: ReportStatus;
  severity: ReportSeverity;
  reported_by: { id: string; name: string | null; email: string };
  target_type: string;
  target_id: string;
  target_label: string;
  resolved_by: { display_name: string } | null;
  resolution_note: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface ReportListResponse {
  reports: ReportAdminView[];
  total: number;
  counts: Record<ReportStatus, number>;
}

export interface CreateReportBody {
  type: ReportType;
  reason: string;
  description: string;
  severity: ReportSeverity;
  target_type: string;
  target_id: string;
  target_label: string;
}

export interface UpdateReportBody {
  status?: ReportStatus;
  severity?: ReportSeverity;
  resolution_note?: string;
}

// ============================================
// SİTE AYARLARI
// ============================================

export interface SettingItem {
  key: string;
  value: string;
  type: string;
  label: string;
  description: string | null;
  is_public: boolean;
  group: string;
}

export interface SiteSettingsResponse {
  settings: Record<string, SettingItem>;
}

export interface UpsertSettingsBody {
  settings: Array<{ key: string; value: string }>;
}

// ============================================
// ADMİN PERSONEL
// ============================================

export interface StaffListItem {
  id: string;
  user_id: string;
  role: AdminRole;
  display_name: string;
  avatar_url: string | null;
  is_active: boolean;
  last_login: Date | null;
  user: { email: string; name: string | null };
  _count: { permissions: number; audit_logs: number; resolved_reports: number };
  created_at: Date;
}

export interface StaffListResponse {
  staff: StaffListItem[];
}

export interface CreateStaffBody {
  user_id: string;
  role: AdminRole;
  display_name: string;
  permissions?: Array<{ resource: string; action: string; granted: boolean }>;
}

export interface UpdateStaffBody {
  role?: AdminRole;
  is_active?: boolean;
  display_name?: string;
  avatar_url?: string;
}

export interface UpdatePermissionsBody {
  permissions: Array<{ resource: string; action: string; granted: boolean }>;
}

export interface MeResponse {
  staff: { id: string; display_name: string; role: AdminRole; avatar_url: string | null } | null;
}

// ============================================
// BANNER YÖNETİMİ
// ============================================

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  placement: BannerPlacement;
  is_active: boolean;
  priority: number;
  start_at: Date | null;
  end_at: Date | null;
  target_blank: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BannersListResponse {
  banners: BannerItem[];
}

export interface CreateBannerBody {
  title: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
  placement?: BannerPlacement;
  priority?: number;
  start_at?: string;
  end_at?: string;
  target_blank?: boolean;
}

export interface UpdateBannerBody extends Partial<CreateBannerBody> {
  is_active?: boolean;
}

// ============================================
// SAYFA (CMS) YÖNETİMİ
// ============================================

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: PageStatus;
  template: string;
  seo_title: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PageDetail extends PageItem {
  content: string;
  seo_desc: string | null;
  og_image: string | null;
}

export interface PagesListResponse {
  pages: PageItem[];
}

export interface CreatePageBody {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  status?: PageStatus;
  template?: string;
  seo_title?: string;
  seo_desc?: string;
  og_image?: string;
}

export interface UpdatePageBody extends Partial<CreatePageBody> {}

// ============================================
// AKTİVİTE GÜNLÜĞÜ
// ============================================

export interface AuditLogView {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  old_value: unknown;
  new_value: unknown;
  metadata: unknown;
  ip_address: string | null;
  created_at: Date;
  staff: { display_name: string; role: AdminRole } | null;
}

export interface AuditLogResponse {
  logs: AuditLogView[];
  total: number;
  page: number;
}

// ============================================
// PARTNER YÖNETİMİ (admin)
// ============================================

export interface PartnerAdminView {
  id: string;
  name: string;
  slug: string;
  type: string;
  sector: string;
  status: string;
  city: string | null;
  district: string | null;
  subscription_status: string;
  package_type: string;
  rating_average: number;
  review_count: number;
  created_at: Date;
  user: { email: string; name: string | null };
  _count: { products: number; services: number; appointments: number; reviews: number };
}

export interface PartnersAdminListResponse {
  partners: PartnerAdminView[];
  total: number;
  page: number;
  page_size: number;
  counts: Record<string, number>;
}
