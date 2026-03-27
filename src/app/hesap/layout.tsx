"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { LayoutDashboard, Heart, BellRing, Settings, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV = [
  { name: "Genel Bakış",      href: "/hesap",                  icon: LayoutDashboard },
  { name: "Favori Ürünlerim", href: "/hesap/favoriler",         icon: Heart },
  { name: "Fiyat Alarmları",  href: "/hesap/fiyat-alarmlari",  icon: BellRing },
  { name: "Hesap Ayarları",   href: "/hesap/ayarlar",          icon: Settings },
];

export default function HesapLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-8 flex-1 flex gap-8 items-start">

        {/* Sidebar */}
        <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-white border border-slate-200 rounded-2xl p-3 gap-0.5 sticky top-24">
          {/* Profile head */}
          <div className="flex items-center gap-3 px-2 pb-3 mb-1 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <User size={16} className="text-indigo-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Hesabım</p>
              <p className="text-[11.5px] text-slate-400">Üye Paneli</p>
            </div>
          </div>

          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                )}
              >
                <item.icon size={14} strokeWidth={1.8} />
                {item.name}
              </Link>
            );
          })}
          <div className="h-px bg-slate-100 my-2" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-rose-500 hover:bg-rose-50 transition-colors w-full text-left"
          >
            <LogOut size={14} strokeWidth={1.8} />
            Çıkış Yap
          </button>
        </aside>

        {/* Mobile tab nav */}
        <div className="md:hidden w-full overflow-x-auto flex gap-1 pb-2 mb-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors flex-shrink-0",
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-500",
                )}
              >
                <item.icon size={12} strokeWidth={1.8} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
