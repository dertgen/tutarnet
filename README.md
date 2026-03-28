# Tutarnet: Akıllı Fiyat ve Hizmet Karşılaştırma Platformu

![Tutarnet Banner](https://via.placeholder.com/1200x400?text=Tutarnet+Platform)

## 🚀 Proje Vizyonu

Tutarnet, kullanıcıların ürün ve hizmet fiyatlarını şeffaf bir şekilde karşılaştırmasına olanak tanıyan, mağazalar ve hizmet sağlayıcılar için güçlü yönetim panelleri sunan yenilikçi bir platformdur. Amacımız, tüketicilere en iyi fırsatları sunarken, işletmelerin de dijital dünyada daha geniş kitlelere ulaşmasını sağlamaktır. Modern teknolojilerle desteklenen Tutarnet, performans, güvenlik ve kullanıcı deneyimini ön planda tutarak dinamik bir pazar yeri oluşturmayı hedefler.

## ✨ Temel Özellikler

*   **Akıllı Fiyat Karşılaştırma:** Binlerce ürün ve hizmet için anlık fiyat takibi ve karşılaştırma.
*   **Kapsamlı Mağaza/Hizmet Panelleri:** İşletmelerin ürünlerini/hizmetlerini, siparişlerini ve müşteri ilişkilerini kolayca yönetebileceği sezgisel arayüzler.
*   **Gelişmiş Admin Paneli:** Platformun tüm yönlerini (kullanıcılar, mağazalar, hizmetler, içerikler, raporlar) yönetmek için merkezi bir kontrol noktası.
*   **Otomatik Feed Senkronizasyonu:** İşletmelerin ürün feed'lerini otomatik olarak içe aktararak güncel fiyat ve stok bilgilerini platforma yansıtma.
*   **Kullanıcı Hesap Yönetimi:** Favori ürünler, fiyat alarmları ve kişiselleştirilmiş deneyimler.
*   **Güvenli Kimlik Doğrulama:** Supabase Auth ile entegre, güvenli kullanıcı ve yönetici oturum yönetimi.
*   **SEO Dostu URL Yapısı:** Arama motorları için optimize edilmiş, anlamlı ve temiz URL'ler.
*   **Duyarlı Tasarım:** Tüm cihazlarda sorunsuz bir kullanıcı deneyimi sunan mobil uyumlu arayüz.

## 🛠️ Teknik Mimari

Tutarnet, modern web geliştirme standartlarına uygun, ölçeklenebilir ve yüksek performanslı bir mimari üzerine inşa edilmiştir.

### Ana Teknolojiler

| Kategori | Teknoloji | Açıklama |
| :--- | :--- |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | Hızlı geliştirme, sunucu tarafı render (SSR), statik site üretimi (SSG) ve güçlü tip güvenliği için. |
| **Veritabanı** | PostgreSQL (Supabase) | İlişkisel veri yönetimi, güvenilir ve ölçeklenebilir veri depolama. |
| **ORM** | Prisma 7 | Veritabanı etkileşimlerini basitleştiren, tip güvenli ve güçlü bir ORM. |
| **Kimlik Doğrulama** | Supabase Auth | Kullanıcı ve yönetici kimlik doğrulama ve yetkilendirme hizmetleri. |
| **API Katmanı** | Next.js API Routes | Sunucu tarafı mantık ve veri işleme için esnek ve hızlı API uç noktaları. |
| **Stil** | Tailwind CSS 4, Shadcn/ui | Hızlı ve tutarlı UI geliştirme için utility-first CSS framework ve yeniden kullanılabilir bileşen kütüphanesi. |

### Mimari Diyagramı

```mermaid
graph TD
    A[Kullanıcı/İşletme] -->|Tarayıcı| B(Next.js Frontend)
    B -->|API Çağrıları| C(Next.js API Routes)
    C -->|Veri İşleme| D(Prisma ORM)
    D -->|Sorgular| E[PostgreSQL Veritabanı]
    C -->|Kimlik Doğrulama| F[Supabase Auth]
    C -->|Harici Servisler| G(Feed Sağlayıcılar)
    G -->|XML/CSV Feed| C
    B -->|Statik İçerik| H[CDN]
```

## ⚙️ Kurulum

Projeyi yerel geliştirme ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Önkoşullar

*   Node.js (v18 veya üzeri)
*   npm veya Yarn (tercihen pnpm)
*   PostgreSQL veritabanı (yerel veya Supabase gibi bir servis sağlayıcı)
*   Git

### Adımlar

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/dertgen/tutarnet.git
    cd tutarnet
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    pnpm install
    # veya npm install
    # veya yarn install
    ```

3.  **Ortam Değişkenlerini Yapılandırın:**
    Proje kök dizininde `.env.local` adında bir dosya oluşturun ve aşağıdaki değişkenleri ekleyin. Değerleri kendi ortamınıza göre doldurun.

    ```env
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
    NEXT_PUBLIC_SUPABASE_URL="[SUPABASE_PROJECT_URL]"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="[SUPABASE_ANON_KEY]"
    ADMIN_SETUP_KEY="[GUVENLI_BIR_ANAHTAR]" # İlk admin kurulumu için kullanılacak gizli anahtar
    ```
    *   `DATABASE_URL`: PostgreSQL veritabanınızın bağlantı dizesi.
    *   `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase projenizin kimlik bilgileri. Supabase kullanmıyorsanız, kendi kimlik doğrulama çözümünüzü entegre etmeniz gerekir.
    *   `ADMIN_SETUP_KEY`: **Çok önemli!** Bu anahtar, ilk admin hesabını güvenli bir şekilde oluşturmak için kullanılacaktır. Güçlü ve tahmin edilemez bir değer atayın.

4.  **Veritabanını Hazırlayın:**
    Prisma şemasını veritabanınıza uygulayın ve gerekli tabloları oluşturun.
    ```bash
    pnpm prisma migrate dev --name init
    # veya npx prisma migrate dev --name init
    ```

5.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    pnpm dev
    # veya npm run dev
    # veya yarn dev
    ```
    Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

### İlk Admin Kurulumu

`ADMIN_SETUP_KEY` ortam değişkenini ayarladıktan sonra, tarayıcınızda oturum açmış bir kullanıcı olarak aşağıdaki URL'ye bir POST isteği göndererek ilk admin hesabını oluşturabilirsiniz:

`http://localhost:3000/api/admin/kurulum?key=[GUVENLI_BIR_ANAHTAR]`

**Önemli:** Bu işlem sadece veritabanında hiç `SUPER_ADMIN` rolüne sahip kullanıcı yoksa çalışır. Kurulum tamamlandıktan sonra `ADMIN_SETUP_KEY` ortam değişkenini üretim ortamında kaldırmanız veya erişimini kısıtlamanız şiddetle tavsiye edilir.

## 🗺️ URL Yapısı

Tutarnet, hem kullanıcı deneyimini hem de arama motoru optimizasyonunu (SEO) desteklemek amacıyla anlamlı ve hiyerarşik bir URL yapısı kullanır.

| Kategori | URL Yapısı | Açıklama |
| :--- | :--- | :--- |
| **Ana Sayfa** | `/` | Platformun ana sayfası. |
| **Ürün Detay** | `/m/[magazaslug]/[urunslug]` | Belirli bir mağazadaki ürünün detay sayfası. `[magazaslug]` ve `[urunslug]` dinamik değerlerdir. |
| **Mağaza Sayfası** | `/m/[magazaslug]` | Belirli bir mağazanın genel sayfası, ürünlerini listeler. |
| **Hizmet Detay** | `/h/[partnerslug]` | Belirli bir hizmet sağlayıcının hizmet detay sayfası. `[partnerslug]` dinamik bir değerdir. |
| **Kullanıcı Paneli** | `/kullanici/hesabim` | Kullanıcıların kendi hesaplarını yönettiği ana panel. |
| **Mağaza Paneli** | `/magaza/hesabim` | Mağaza sahiplerinin ürünlerini ve operasyonlarını yönettiği ana panel. |
| **Hizmet Paneli** | `/hizmet/hesabim` | Hizmet sağlayıcıların hizmetlerini ve operasyonlarını yönettiği ana panel. |
| **Admin Paneli** | `/admin/hesabim` | Platform yöneticilerinin tüm sistemi yönettiği ana panel. |
| **API Rotaları** | `/api/...` | Frontend ile etkileşim kuran tüm API uç noktaları. |

## 🔒 Güvenlik

Tutarnet, kullanıcı verilerinin ve platformun güvenliğini sağlamak için çeşitli önlemler almaktadır:

*   **Rol Tabanlı Erişim Kontrolü (RBAC):** `src/lib/admin/permissions.ts` ve `src/lib/admin/auth-guard.ts` dosyalarında tanımlanan yetkilendirme sistemi ile her kullanıcının (admin, mağaza sahibi, normal kullanıcı) sadece yetkili olduğu kaynaklara erişimi sağlanır.
*   **Güvenli Admin Kurulumu:** İlk admin hesabı, yalnızca `ADMIN_SETUP_KEY` ile erişilebilen özel bir API rotası üzerinden oluşturulur. Bu, yetkisiz admin oluşturulmasını engeller.
*   **SSL/TLS Şifrelemesi:** Veritabanı bağlantıları üretim ortamında `rejectUnauthorized: true` ayarı ile SSL/TLS şifrelemesi kullanılarak güvence altına alınır. Bu, veri iletimi sırasında olası dinlemeleri (eavesdropping) önler.
*   **Hata Mesajı Gizleme:** Kullanıcıya dönülen hata mesajları genelleştirilerek, sunucu iç yapısı hakkında bilgi sızdırılması engellenir.
*   **Çerez Güvenliği:** Oturum çerezleri `httpOnly` ve `secure` bayrakları ile korunur.

## ⚡ Performans ve Ölçeklenebilirlik İyileştirmeleri

Platformun yüksek trafik altında bile hızlı ve duyarlı kalmasını sağlamak için önemli optimizasyonlar yapılmıştır:

*   **Feed Senkronizasyonu Optimizasyonu:** `src/lib/services/feed-sync.ts` dosyasındaki `syncFeed` metodu, N+1 sorgu problemlerini azaltmak amacıyla toplu (batch) veritabanı işlemleri için hazırlandı. Gelecekte `upsert` veya ham SQL ile daha da optimize edilebilir.
*   **İstatistik API Optimizasyonu:** `src/app/api/admin/stats/route.ts` adresindeki istatistik API'si, tüm sorguları tek bir `prisma.$transaction` yerine `Promise.all` ile paralel olarak çalıştıracak şekilde yeniden düzenlendi. Bu, veritabanı yükünü dağıtır ve yanıt süresini kısaltır. Ayrıca Next.js'in `revalidate` özelliği ile 5 dakikalık önbellekleme eklendi.
*   **Veritabanı Bağlantı Havuzu:** `src/lib/db/prisma.ts` dosyasındaki bağlantı havuzu ayarları, sunucusuz ortamlar için optimize edilebilir. Yüksek trafik beklentisi olan durumlarda bir "Connection Pooler" (örn: Supabase PgBouncer) kullanılması önerilir.
*   **Görsel Optimizasyonu:** `ProductCard` gibi bileşenlerde `loading="lazy"` özelliği ve hata durumunda gösterilecek placeholder görselleri eklenerek sayfa yükleme performansı ve kullanıcı deneyimi iyileştirildi.

## 📝 Kod Kalitesi ve Geliştirme Standartları

Projenin sürdürülebilirliğini ve geliştirilebilirliğini artırmak için aşağıdaki standartlar benimsenmiştir:

*   **TypeScript:** Tüm kod tabanı TypeScript ile yazılmıştır. Bu, geliştirme sürecinde hataları erken yakalamayı ve kodun daha anlaşılır olmasını sağlar.
*   **Gelişmiş Slug Oluşturma:** `src/lib/services/feed-sync.ts` içindeki `generateSlug` fonksiyonu, Türkçe karakterleri (ç, ğ, ı, ö, ş, ü) doğru bir şekilde Latin karakterlere dönüştürerek SEO dostu ve benzersiz URL'ler oluşturur. Aynı zamanda slug çakışmalarını önlemek için rastgele son ekler kullanır.
*   **Hata Yönetimi:** API rotalarında ve servis katmanlarında daha genel hata mesajları döndürülerek hassas sistem bilgilerinin dışarı sızması engellenir.
*   **Modüler Yapı:** Kod, Next.js'in App Router yapısına uygun olarak modüler bir şekilde düzenlenmiştir. Bu, kodun okunabilirliğini ve bakımını kolaylaştırır.

## 🤝 Katkıda Bulunma

Tutarnet projesine katkıda bulunmak ister misiniz? Geliştirme sürecine dahil olmak için lütfen aşağıdaki adımları izleyin:

1.  Depoyu Fork edin.
2.  Yeni bir özellik veya hata düzeltmesi için dal (branch) oluşturun (`git checkout -b feature/yeni-ozellik`).
3.  Değişikliklerinizi yapın ve commit mesajlarınızı açıklayıcı tutun.
4.  Değişikliklerinizi ana depoya (upstream) gönderin.
5.  Bir Pull Request (PR) açın ve değişikliklerinizi detaylı bir şekilde açıklayın.

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 📞 İletişim

Sorularınız, önerileriniz veya işbirliği talepleriniz için lütfen [destek@tutarnet.com](mailto:destek@tutarnet.com) adresinden bizimle iletişime geçin.

---

**Manus AI** tarafından oluşturulmuştur.
