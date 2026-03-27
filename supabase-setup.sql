-- ============================================
-- TUTAR.NET DATABASE SETUP
-- Supabase PostgreSQL için SQL komutları
-- ============================================

-- Enum Types
CREATE TYPE "PartnerType" AS ENUM ('E_COMMERCE', 'SERVICE');
CREATE TYPE "ServiceSector" AS ENUM ('E_COMMERCE', 'BARBER', 'HAIRDRESSER', 'PLUMBER', 'ELECTRICIAN', 'PAINTER', 'SPA', 'CLINIC', 'CLEANING', 'MOVING', 'REPAIR', 'OTHER');
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED');
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE "ConversationType" AS ENUM ('BOOKING', 'QUOTE', 'SUPPORT');

-- ============================================
-- KULLANICILAR
-- ============================================
CREATE TABLE "User" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash TEXT,
    avatar_url TEXT,
    phone VARCHAR(50),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "User"(email);

-- ============================================
-- PARTNER
-- ============================================
CREATE TABLE "Partner" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type "PartnerType" NOT NULL,
    sector "ServiceSector" NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    neighborhood VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    status "PartnerStatus" DEFAULT 'PENDING',
    is_verified BOOLEAN DEFAULT false,
    subscription_status "SubscriptionStatus" DEFAULT 'TRIAL',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    rating_average DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    package_type VARCHAR(50) DEFAULT 'starter',
    bank_account TEXT,
    tax_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX idx_partner_slug ON "Partner"(slug);
CREATE INDEX idx_partner_type ON "Partner"(type);
CREATE INDEX idx_partner_sector ON "Partner"(sector);
CREATE INDEX idx_partner_city_district ON "Partner"(city, district);
CREATE INDEX idx_partner_status ON "Partner"(status);
CREATE INDEX idx_partner_subscription ON "Partner"(subscription_status);
CREATE INDEX idx_partner_rating ON "Partner"(rating_average);

-- ============================================
-- KATEGORİLER
-- ============================================
CREATE TABLE "Category" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    parent_id UUID REFERENCES "Category"(id) ON DELETE SET NULL,
    typical_duration INTEGER,
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_category_slug ON "Category"(slug);
CREATE INDEX idx_category_parent ON "Category"(parent_id);
CREATE INDEX idx_category_type ON "Category"(type);

-- ============================================
-- ÜRÜNLER
-- ============================================
CREATE TABLE "Product" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    description TEXT,
    specs JSONB,
    images TEXT[] DEFAULT '{}',
    barcode VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category_id UUID REFERENCES "Category"(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_slug ON "Product"(slug);
CREATE INDEX idx_product_category ON "Product"(category_id);
CREATE INDEX idx_product_partner ON "Product"(partner_id);
CREATE INDEX idx_product_brand ON "Product"(brand);

-- ============================================
-- FİYATLAR
-- ============================================
CREATE TABLE "Price" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'TRY',
    url TEXT,
    in_stock BOOLEAN DEFAULT true,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, partner_id)
);

CREATE INDEX idx_price_product ON "Price"(product_id);
CREATE INDEX idx_price_partner ON "Price"(partner_id);
CREATE INDEX idx_price_value ON "Price"(price);

-- ============================================
-- FİYAT GEÇMİŞİ
-- ============================================
CREATE TABLE "PriceHistory" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pricehistory_product ON "PriceHistory"(product_id, recorded_at);
CREATE INDEX idx_pricehistory_partner ON "PriceHistory"(partner_id);

-- ============================================
-- HİZMETLER
-- ============================================
CREATE TABLE "Service" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    category_id UUID NOT NULL REFERENCES "Category"(id),
    buffer_time INTEGER DEFAULT 0,
    max_booking INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_partner ON "Service"(partner_id);
CREATE INDEX idx_service_category ON "Service"(category_id);
CREATE INDEX idx_service_active ON "Service"(is_active);

-- ============================================
-- HİZMET VARYASYONLARI
-- ============================================
CREATE TABLE "ServiceVariation" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_variation_service ON "ServiceVariation"(service_id);

-- ============================================
-- PERSONEL
-- ============================================
CREATE TABLE "Staff" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_staff_partner ON "Staff"(partner_id);
CREATE INDEX idx_staff_active ON "Staff"(is_active);

-- ============================================
-- PERSONEL-HİZMET İLİŞKİSİ
-- ============================================
CREATE TABLE "StaffService" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES "Staff"(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
    UNIQUE(staff_id, service_id)
);

CREATE INDEX idx_staffservice_staff ON "StaffService"(staff_id);
CREATE INDEX idx_staffservice_service ON "StaffService"(service_id);

-- ============================================
-- ÇALIŞMA SAATLERİ
-- ============================================
CREATE TABLE "WorkingHours" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    is_open BOOLEAN DEFAULT true,
    open_time VARCHAR(10) NOT NULL,
    close_time VARCHAR(10) NOT NULL,
    break_start VARCHAR(10),
    break_end VARCHAR(10),
    UNIQUE(partner_id, day_of_week)
);

CREATE INDEX idx_workinghours_partner ON "WorkingHours"(partner_id);

-- ============================================
-- PERSONEL ÇALIŞMA SAATLERİ
-- ============================================
CREATE TABLE "StaffWorkingHours" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES "Staff"(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    is_open BOOLEAN DEFAULT true,
    open_time VARCHAR(10) NOT NULL,
    close_time VARCHAR(10) NOT NULL,
    break_start VARCHAR(10),
    break_end VARCHAR(10),
    UNIQUE(staff_id, day_of_week)
);

CREATE INDEX idx_staffhours_staff ON "StaffWorkingHours"(staff_id);

-- ============================================
-- RANDEVULAR
-- ============================================
CREATE TABLE "Appointment" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES "Staff"(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
    variation_id UUID,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    status "AppointmentStatus" DEFAULT 'PENDING',
    price DECIMAL(10,2),
    notes TEXT,
    customer_notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_customer ON "Appointment"(customer_id);
CREATE INDEX idx_appointment_partner ON "Appointment"(partner_id);
CREATE INDEX idx_appointment_staff ON "Appointment"(staff_id);
CREATE INDEX idx_appointment_date ON "Appointment"(date);
CREATE INDEX idx_appointment_status ON "Appointment"(status);
CREATE INDEX idx_appointment_service ON "Appointment"(service_id);

-- ============================================
-- HİZMET TALEPLERİ (RFQ)
-- ============================================
CREATE TABLE "ServiceRequest" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES "Category"(id),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    deadline TIMESTAMP WITH TIME ZONE,
    photos TEXT[] DEFAULT '{}',
    status "RequestStatus" DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_request_customer ON "ServiceRequest"(customer_id);
CREATE INDEX idx_request_category ON "ServiceRequest"(category_id);
CREATE INDEX idx_request_location ON "ServiceRequest"(city, district);
CREATE INDEX idx_request_status ON "ServiceRequest"(status);
CREATE INDEX idx_request_created ON "ServiceRequest"(created_at);

-- ============================================
-- TEKLİFLER
-- ============================================
CREATE TABLE "Quote" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES "ServiceRequest"(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER,
    description TEXT NOT NULL,
    status "QuoteStatus" DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, request_id)
);

CREATE INDEX idx_quote_request ON "Quote"(request_id);
CREATE INDEX idx_quote_partner ON "Quote"(partner_id);
CREATE INDEX idx_quote_status ON "Quote"(status);
CREATE INDEX idx_quote_created ON "Quote"(created_at);

-- ============================================
-- KONUŞMALAR
-- ============================================
CREATE TABLE "Conversation" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type "ConversationType" NOT NULL,
    customer_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES "Appointment"(id) ON DELETE SET NULL,
    request_id UUID REFERENCES "ServiceRequest"(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES "Quote"(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_text TEXT,
    customer_unread_count INTEGER DEFAULT 0,
    partner_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_customer ON "Conversation"(customer_id);
CREATE INDEX idx_conversation_partner ON "Conversation"(partner_id);
CREATE INDEX idx_conversation_appointment ON "Conversation"(appointment_id);
CREATE INDEX idx_conversation_request ON "Conversation"(request_id);
CREATE INDEX idx_conversation_quote ON "Conversation"(quote_id);
CREATE INDEX idx_conversation_last ON "Conversation"(last_message_at);

-- ============================================
-- MESAJLAR
-- ============================================
CREATE TABLE "Message" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_conversation ON "Message"(conversation_id);
CREATE INDEX idx_message_sender ON "Message"(sender_id);
CREATE INDEX idx_message_created ON "Message"(created_at);

-- ============================================
-- YORUMLAR & DEĞERLENDİRMELER
-- ============================================
CREATE TABLE "Review" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    service_id UUID REFERENCES "Service"(id) ON DELETE SET NULL,
    product_id UUID REFERENCES "Product"(id) ON DELETE SET NULL,
    appointment_id UUID UNIQUE REFERENCES "Appointment"(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    partner_reply TEXT,
    partner_replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_review_author ON "Review"(author_id);
CREATE INDEX idx_review_partner ON "Review"(partner_id);
CREATE INDEX idx_review_service ON "Review"(service_id);
CREATE INDEX idx_review_product ON "Review"(product_id);
CREATE INDEX idx_review_rating ON "Review"(rating);
CREATE INDEX idx_review_created ON "Review"(created_at);

-- ============================================
-- MEDYA
-- ============================================
CREATE TABLE "Media" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_partner ON "Media"(partner_id);
CREATE INDEX idx_media_type ON "Media"(type);

-- ============================================
-- FEED YÖNETİMİ
-- ============================================
CREATE TABLE "Feed" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES "Partner"(id) ON DELETE CASCADE,
    feed_url TEXT NOT NULL,
    feed_format VARCHAR(50) DEFAULT 'google_shopping_xml',
    sync_frequency VARCHAR(50) DEFAULT 'daily',
    sync_schedule TIMESTAMP WITH TIME ZONE,
    last_fetch TIMESTAMP WITH TIME ZONE,
    last_sync_count INTEGER DEFAULT 0,
    fetch_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_map_products BOOLEAN DEFAULT true,
    mapping_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_partner ON "Feed"(partner_id);
CREATE INDEX idx_feed_active ON "Feed"(is_active);
CREATE INDEX idx_feed_status ON "Feed"(fetch_status);

-- ============================================
-- FEED ÜRÜNLERİ
-- ============================================
CREATE TABLE "FeedItem" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID NOT NULL REFERENCES "Feed"(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    product_url TEXT NOT NULL,
    image_url TEXT,
    additional_images TEXT[] DEFAULT '{}',
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'TRY',
    availability VARCHAR(50) DEFAULT 'in_stock',
    condition VARCHAR(50) DEFAULT 'new',
    brand VARCHAR(255),
    gtin VARCHAR(255),
    mpn VARCHAR(255),
    google_category_id VARCHAR(255),
    product_type VARCHAR(255),
    shipping_weight VARCHAR(50),
    attributes JSONB,
    sync_status VARCHAR(50) DEFAULT 'pending',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    product_id UUID REFERENCES "Product"(id) ON DELETE SET NULL,
    UNIQUE(feed_id, external_id)
);

CREATE INDEX idx_feeditem_product ON "FeedItem"(product_id);
CREATE INDEX idx_feeditem_status ON "FeedItem"(sync_status);

-- ============================================
-- FEED SENKRONİZASYON LOGLARI
-- ============================================
CREATE TABLE "FeedSyncLog" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID NOT NULL REFERENCES "Feed"(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    items_total INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_feedsynclog_feed ON "FeedSyncLog"(feed_id);
CREATE INDEX idx_feedsynclog_started ON "FeedSyncLog"(started_at);

-- ============================================
-- FIRSATLAR
-- ============================================
CREATE TABLE "Deal" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES "Product"(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_hot BOOLEAN DEFAULT false,
    is_frontpage BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deal_hot ON "Deal"(is_hot);
CREATE INDEX idx_deal_frontpage ON "Deal"(is_frontpage);
CREATE INDEX idx_deal_upvotes ON "Deal"(upvotes);
CREATE INDEX idx_deal_created ON "Deal"(created_at);

-- ============================================
-- YORUMLAR
-- ============================================
CREATE TABLE "Comment" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES "Deal"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comment_deal ON "Comment"(deal_id);
CREATE INDEX idx_comment_user ON "Comment"(user_id);

-- ============================================
-- OYLAR
-- ============================================
CREATE TABLE "Vote" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES "Deal"(id) ON DELETE CASCADE,
    vote_type BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, deal_id)
);

CREATE INDEX idx_vote_deal ON "Vote"(deal_id);

-- ============================================
-- FİYAT ALARMLARI
-- ============================================
CREATE TABLE "Alert" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    target_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_user ON "Alert"(user_id);
CREATE INDEX idx_alert_product ON "Alert"(product_id);
CREATE INDEX idx_alert_active ON "Alert"(is_active);

-- ============================================
-- ABONELİK PAKETLERİ
-- ============================================
CREATE TABLE "SubscriptionPackage" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    max_products INTEGER NOT NULL,
    max_services INTEGER NOT NULL,
    max_staff INTEGER NOT NULL,
    max_appointments_monthly INTEGER NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_package_name ON "SubscriptionPackage"(name);
CREATE INDEX idx_package_active ON "SubscriptionPackage"(is_active);

-- ============================================
-- ÖRNEK VERİLER
-- ============================================

-- Abonelik Paketleri
INSERT INTO "SubscriptionPackage" (name, display_name, price_monthly, max_products, max_services, max_staff, max_appointments_monthly, features) VALUES
('starter', 'Başlangıç', 0, 50, 5, 2, 50, '{"product_feed": true, "basic_analytics": true}'::jsonb),
('basic', 'Temel', 199, 500, 20, 5, 200, '{"product_feed": true, "advanced_analytics": true, "priority_support": true}'::jsonb),
('pro', 'Profesyonel', 499, 5000, 100, 20, 1000, '{"product_feed": true, "advanced_analytics": true, "api_access": true, "white_label": false}'::jsonb),
('enterprise', 'Kurumsal', 1499, NULL, NULL, NULL, NULL, '{"product_feed": true, "advanced_analytics": true, "api_access": true, "white_label": true, "dedicated_support": true}'::jsonb);

-- Kategoriler (Ana)
INSERT INTO "Category" (name, slug, type, description) VALUES
('Elektronik', 'elektronik', 'product', 'Bilgisayar, telefon, tablet ve diğer elektronik ürünler'),
('Moda', 'moda', 'product', 'Giyim, ayakkabı, aksesuar ve takı'),
('Ev & Yaşam', 'ev-yasam', 'product', 'Mobilya, dekorasyon ve ev eşyaları'),
('Spor & Outdoor', 'spor-outdoor', 'product', 'Spor ekipmanları ve outdoor malzemeleri'),
('Saç Bakım', 'sac-bakim', 'service', 'Kuaför, berber ve saç bakım hizmetleri'),
('Tesisat', 'tesisat', 'service', 'Su tesisatı, doğalgaz ve tesisat hizmetleri'),
('Elektrikçi', 'elektrikci', 'service', 'Elektrik tesisatı ve tamir hizmetleri'),
('Temizlik', 'temizlik', 'service', 'Ev ve ofis temizlik hizmetleri'),
('Nakliyat', 'nakliyat', 'service', 'Ev ve ofis taşıma hizmetleri'),
('Boyacı', 'boyaci', 'service', 'İç ve dış cephe boya hizmetleri');

-- Admin kullanıcısı (şifre: admin123 - bcrypt hash)
INSERT INTO "User" (email, name, is_admin, password_hash) VALUES
('admin@tutar.net', 'Admin', true, '$2a$10$YourBcryptHashHere');

-- Örnek Partner (Mağaza)
INSERT INTO "Partner" (type, sector, name, slug, email, phone, city, district, address, status, subscription_status, user_id) 
SELECT 
  'E_COMMERCE'::"PartnerType",
  'E_COMMERCE'::"ServiceSector",
  'TechStore',
  'techstore',
  'info@techstore.com',
  '0212 555 0000',
  'İstanbul',
  'Kadıköy',
  'Caferağa Mah. No:123',
  'ACTIVE'::"PartnerStatus",
  'ACTIVE'::"SubscriptionStatus",
  id
FROM "User" WHERE email = 'admin@tutar.net';

COMMIT;