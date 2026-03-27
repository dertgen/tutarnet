"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Activity, Link as LinkIcon, Settings, LogOut, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV = [
  { name: "Kontrol Paneli",    href: "/magaza-paneli",             icon: LayoutDashboard },
  { name: "Ürün Yönetimi",     href: "/magaza-paneli/urunler",     icon: Package },
  { name: "Tıklama & Analitik",href: "/magaza-paneli/analitik",    icon: Activity },
  { name: "XML Entegrasyonu",  href: "/magaza-paneli/entegrasyon", icon: LinkIcon },
  { name: "Profil Ayarları",   href: "/magaza-paneli/ayarlar",     icon: Settings },
];

export default function MagazaPaneliLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4">
        <Link href="/" className="flex items-center gap-2 text-slate-900 no-underline">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <Store size={14} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-[13.5px] font-semibold">tutar.net</span>
        </Link>
        <div className="w-px h-4 bg-slate-200" />
        <span className="text-[13px] font-medium text-slate-500">Mağaza Paneli</span>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/magaza-paneli/entegrasyon"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[13px] font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Package size={13} /> Ürün Ekle / XML
          </Link>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="hidden md:flex w-52 flex-shrink-0 flex-col gap-0.5 sticky top-20">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
              >
                <item.icon size={15} strokeWidth={1.8} />
                {item.name}
              </Link>
            );
          })}
          <div className="h-px bg-slate-200 my-2" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-rose-500 hover:bg-rose-50 transition-colors w-full text-left"
          >
            <LogOut size={15} strokeWidth={1.8} />
            Çıkış Yap
          </button>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full overflow-x-auto flex gap-1 pb-2 mb-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-colors flex-shrink-0",
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-500",
                )}
              >
                <item.icon size={13} strokeWidth={1.8} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {children}
        </main>
      </div>
    </div>
  );
}
