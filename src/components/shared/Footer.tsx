import Link from "next/link";
import { Send } from "lucide-react";

const FOOTER_LINKS = {
  kesif: [
    { href: "/kategori/telefon",  label: "Popüler Telefonlar" },
    { href: "/magazalar",         label: "Tüm Mağazalar" },
    { href: "/nasil-calisir",     label: "Sistem Nasıl Çalışır?" },
    { href: "/magaza-ol",         label: "Satıcı Olun (1 Yıl Ücretsiz)" },
  ],
  kurumsal: [
    { href: "/hakkimizda",        label: "Hakkımızda" },
    { href: "/kariyer",           label: "Kariyer Fırsatları" },
    { href: "/iletisim",          label: "Bize Ulaşın" },
    { href: "/kullanim-kosullari",label: "Kullanım Koşulları" },
    { href: "/gizlilik",          label: "Gizlilik Politikası" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Col 1 — Logo + desc */}
          <div className="flex flex-col gap-4">
            <Link href="/">
              <img src="/logo.svg" alt="tutar.net" className="h-8 w-auto" />
            </Link>
            <p className="text-[14px] text-white/50 leading-relaxed max-w-[280px]">
              Milyonlarca ürünü tek bir platformdan inceleyin, en uygun fiyatı bulun.
            </p>
          </div>

          {/* Col 2 — Keşfet */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-white">Keşfet</h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.kesif.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Kurumsal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-white">Kurumsal & Yasal</h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.kurumsal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-white">E-Bülten</h3>
            <p className="text-[14px] text-white/50 leading-relaxed">
              İndirimlerden ve fiyat alarmlarından ilk siz haberdar olun.
            </p>
            <form className="flex h-11 max-w-[340px] rounded-lg overflow-hidden border border-white/15">
              <input
                type="email"
                placeholder="E-posta adresiniz..."
                required
                className="flex-1 px-4 bg-white/5 border-none outline-none text-white text-[14px] placeholder:text-white/30"
              />
              <button
                type="submit"
                className="px-4 flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-[#111] font-bold text-[13px] transition-colors"
              >
                <span>Katıl</span>
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>

        <div className="h-px bg-white/10 mb-6" />

        <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] text-white/40">
          <span>&copy; {new Date().getFullYear()} tutar.net. Tüm hakları saklıdır.</span>
          <div className="flex gap-5">
            <span className="cursor-pointer hover:text-white/70 transition-colors">KVKK Metni</span>
            <span className="cursor-pointer hover:text-white/70 transition-colors">Çerez Politikası</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
