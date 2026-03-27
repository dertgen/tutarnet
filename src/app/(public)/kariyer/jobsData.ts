export interface Job {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export const jobsData: Job[] = [
  {
    id: "1",
    slug: "senior-frontend-developer",
    title: "Senior Frontend Developer (Next.js & React)",
    department: "Yazılım & Veri",
    location: "Uzaktan (Remote)",
    type: "Tam Zamanlı",
    description: "Tutar.net'in arayüz mimarisini yönetecek, performanslı ve ölçeklenebilir bir kullanıcı deneyimi sunmak üzere çalışacak kıdemli Frontend Geliştirici arıyoruz. Modern web standartlarına hakim, kullanıcı odaklı düşünen ve büyük veriyi sorunsuz bir UI ile birleştirebilen bir takım arkadaşı arıyoruz.",
    responsibilities: [
      "Next.js ve React kullanarak sıfırdan ölçeklenebilir frontend mimarileri kurmak ve mevcut sistemleri iyileştirmek.",
      "Milyonlarca ürünün listelendiği sayfalarda performans (Core Web Vitals) optimizasyonları yapmak.",
      "Tasarım ekibiyle dirsek teması çalışarak UI/UX tasarımlarını piksel mükemmelliğinde hayata geçirmek.",
      "Kapsayıcı (Inclusive) ve erişilebilir (a11y) kod yazım standartlarını belirlemek ve ekibe liderlik etmek.",
      "Yeni teknolojileri araştırıp, projeye entegrasyonu konusunda inisiyatif almak."
    ],
    requirements: [
      "En az 5 yıl Frontend geliştirme tecrübesi (Tercihen e-ticaret veya yüksek trafikli projelerde).",
      "React ve Next.js (App Router, SSR, SSG) konularında derinlemesine bilgi sahibi.",
      "TypeScript ile tip güvenli ve sürdürülebilir kod mimarisi kurabilme.",
      "State management (Zustand, Redux, Jotai vb.) konularında tecrübeli.",
      "Modern CSS (TailwindCSS, CSS Modules) ve animasyon (Framer Motion) araçlarına hakimiyet.",
      "Git versiyon kontrol sistemi ve CI/CD süreçlerini aktif kullanabilen.",
      "Problem çözme odaklı ve takım çalışmasına yatkın."
    ],
    benefits: [
      "Tamamen uzaktan çalışma esnekliği.",
      "Rekabetçi maaş ve performansa dayalı prim sistemi.",
      "Özel sağlık sigortası ve yemek kartı.",
      "Eğitim ve kişisel gelişim bütçesi.",
      "Yeni teknoloji ekipman desteği (MacBook Pro, Monitör vb.)."
    ]
  },
  {
    id: "2",
    slug: "backend-ai-engineer",
    title: "Backend AI Engineer (Go & Python)",
    department: "Yazılım & Veri",
    location: "İstanbul (Hibrit) / Uzaktan",
    type: "Tam Zamanlı",
    description: "Sistemimizin kalbi olan veri işleme, fiyat karşılaştırma algoritmaları ve LLM (Büyük Dil Modelleri) entegrasyonlarını üstlenecek yetenekli bir Backend + AI mühendisi arıyoruz. Milyonlarca isteği anında karşılayabilen, yapay zeka ile kullanıcı aramasını birleştiren bir ürün geliştiriyoruz.",
    responsibilities: [
      "Python ve Go dillerini kullanarak yüksek performanslı ve dağıtık (distributed) mikroservisler tasarlamak.",
      "Yapay zeka modellerinin (OpenAI, DeepSeek, yerel LLMs) uygulamaya API üzerinden kusursuz entegrasyonunu sağlamak.",
      "Fiyat tahmin algoritmaları ve otomatik ürün eşleştirme sistemlerini optimize etmek.",
      "PostgreSQL ve Redis kullanarak saniyelik veri akışlarını hatasız yönetmek.",
      "Sistem monitörizasyonu, hata ayıklama ve sürekli iyileştirme yapmak."
    ],
    requirements: [
      "Python (FastAPI, Django) ve Go (Golang) dillerinde en az 3 yıl profesyonel tecrübe.",
      "Mikroservis mimarileri, Docker, Kubernetes gibi konteyner teknolojilerine hakimiyet.",
      "LLM entegrasyonları, Prompt Engineering veya Vector Database (Pinecone, Milvus) konularına aşinalık.",
      "İlişkisel ve ilişkisel olmayan veri tabanlarında (PostgreSQL, MongoDB, ElasticSearch) yüksek performans optimizasyonu tecrübesi.",
      "Büyük veri veya e-ticaret platformu geçmişine sahip olmak tercih sebebidir."
    ],
    benefits: [
      "Hibrit veya tamamen uzaktan çalışma seçeneği.",
      "Yüksek hızla büyüyen bir startup ortamında öncü rolde olma imkanı.",
      "Esnek çalışma saatleri.",
      "Sınırsız kahve, atıştırmalık ve ofis içi etkinlikler (İstanbul'daki günler için).",
      "Konferans ve global sertifika destekleri."
    ]
  },
  {
    id: "3",
    slug: "senior-product-designer",
    title: "Senior Product Designer (UI/UX)",
    department: "Ürün Tasarımı",
    location: "Uzaktan (Remote)",
    type: "Tam Zamanlı",
    description: "Tutar.net'in kullanıcılarına ve satıcılarına kusursuz, pürüzsüz ve vizyoner bir arayüz deneyimi yaşatacak, tasarım sistemlerini sıfırdan oluşturup yönetecek bir Kıdemli Ürün Tasarımcısı arıyoruz.",
    responsibilities: [
      "Mobil, tablet ve masaüstü platformlar için uçtan uca kullanıcı deneyimi tasarlamak ve test etmek.",
      "Tutar.net markasının 'Premium' hissini her piksele taşımak ve tasarım dili kılavuzunu (Design System) sürdürmek.",
      "Kullanıcı araştırmaları, A/B testleri ve ısı haritası verilerini inceleyerek dönüşüm optimizasyonu (CRO) sağlamak.",
      "Geliştirme ekibi ile sürekli işbirliği içinde olarak tasarımların teknik uygulanabilirliğini denetlemek.",
      "Prototip araçları kullanarak interaktif mockup hazırlamak."
    ],
    requirements: [
      "Figma ve modern UI/UX tasarım araçlarında ileri seviyede yetkinlik.",
      "En az 4 yıl e-ticaret veya SaaS ürünü tasarım deneyimi (Portfolyo zorunludur).",
      "Kullanıcı davranışı algısı yüksek; Data-driven (veri odaklı) kararlar alabilen.",
      "Cam efekti (Glassmorphism), modern tipografi, dark-mode konseptlerine çok iyi derece hakimiyet.",
      "İletişim yeteneği güçlü ve geri bildirim döngülerine açık olan."
    ],
    benefits: [
      "Remote çalışma imkanı.",
      "Kapsamlı yan haklar (Yemek, Özel İnternet ve Elektrik Desteği).",
      "Kendi tasarım setuplarınızı özgürce seçebilmeniz için donanım bütçesi."
    ]
  }
];

export const groupedJobs = [
  {
    category: "Yazılım & Veri",
    openings: jobsData.filter(job => job.department === "Yazılım & Veri")
  },
  {
    category: "Ürün Tasarımı",
    openings: jobsData.filter(job => job.department === "Ürün Tasarımı")
  },
  {
    category: "Büyüme & Satış (Growth)",
    openings: jobsData.filter(job => job.department === "Büyüme & Satış (Growth)") // Dummy if empty for now
  }
];
