"use client";

import React, { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Users, Grid3X3, Flag, Settings,
  BarChart3, LogOut, Menu, X, Bell, Search,
  Image, FileText, UserCog, Activity, Zap,
  ChevronDown, Mail, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavChild {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

interface NavGroup {
  key: string;
  label: string;
  icon?: React.ElementType;
  href?: string;
  children?: NavChild[];
}

const NAV: NavGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin-paneli",
  },
  {
    key: "yonetim",
    label: "Yönetim",
    children: [
      { href: "/admin-paneli/partnerler",   label: "Partnerler",   icon: Store,    description: "Mağaza ve hizmet sağlayıcıları" },
      { href: "/admin-paneli/kullanicilar", label: "Kullanıcılar", icon: Users,    description: "Platform üyeleri ve hesaplar" },
      { href: "/admin-paneli/kategoriler",  label: "Kategoriler",  icon: Grid3X3,  description: "Ürün ve hizmet kategorileri" },
    ],
  },
  {
    key: "icerik",
    label: "İçerik",
    children: [
      { href: "/admin-paneli/moderasyon",  label: "Moderasyon",  icon: Flag,      description: "Şikayet ve rapor yönetimi" },
      { href: "/admin-paneli/bannerlar",   label: "Bannerlar",   icon: Image,     description: "Site geneli görsel yönetimi" },
      { href: "/admin-paneli/icerik",      label: "Sayfalar",    icon: FileText,  description: "Statik sayfa editörü" },
    ],
  },
  {
    key: "sistem",
    label: "Sistem",
    children: [
      { href: "/admin-paneli/analitik",      label: "Analitik",      icon: BarChart3, description: "Performans ve büyüme verileri" },
      { href: "/admin-paneli/personel",      label: "Personel",      icon: UserCog,   description: "Admin çalışanlar ve roller" },
      { href: "/admin-paneli/site-ayarlari", label: "Site Ayarları", icon: Settings,  description: "Yapılandırma ve entegrasyonlar" },
      { href: "/admin-paneli/aktivite",      label: "Aktivite",      icon: Activity,  description: "Denetim günlüğü" },
    ],
  },
];

function DropdownPanel({
  group,
  pathname,
  onClose,
}: {
  group: NavGroup;
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-[calc(100%+6px)] left-0 z-50 min-w-[230px] bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 p-1">
      {group.children?.map((child) => {
        const active = pathname.startsWith(child.href);
        const Icon = child.icon;
        return (
          <Link
            key={child.href}
            href={child.href}
            onClick={onClose}
            className={cn(
              "flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors",
              active ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700",
            )}
          >
            <Icon
              size={14}
              strokeWidth={1.8}
              className={cn("mt-0.5 flex-shrink-0", active ? "text-indigo-600" : "text-slate-400")}
            />
            <div>
              <div className={cn("text-[13.5px] font-medium leading-snug", active ? "text-indigo-700" : "text-slate-800")}>
                {child.label}
              </div>
              {child.description && (
                <div className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">
                  {child.description}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function NavItem({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = group.href
    ? pathname === group.href
    : group.children?.some((c) => pathname.startsWith(c.href));

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const itemBase = cn(
    "flex items-center gap-1.5 text-[13.5px] font-medium transition-colors whitespace-nowrap relative pb-4 -mb-4",
    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800",
  );

  const underline = isActive ? (
    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-sm" />
  ) : null;

  if (group.href) {
    return (
      <Link href={group.href} className={itemBase}>
        {group.icon && <group.icon size={13} strokeWidth={1.8} />}
        {group.label}
        {underline}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { if (timer.current) clearTimeout(timer.current); setOpen(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 150); }}
    >
      <button className={cn(itemBase, "bg-transparent border-0 cursor-pointer gap-1")}>
        {group.label}
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={cn("opacity-50 transition-transform", open && "rotate-180")}
        />
        {underline}
      </button>
      {open && (
        <DropdownPanel group={group} pathname={pathname} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function MobileMenu({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  return (
    <div className="fixed inset-0 z-[300] flex">
      <div
        className="flex-1 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-[270px] bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col p-3 gap-0.5">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Zap size={13} className="text-indigo-600" strokeWidth={2} />
            </div>
            <span className="text-[13.5px] font-semibold text-slate-900">tutar.net</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X size={17} />
          </button>
        </div>

        {NAV.map((group) => (
          <div key={group.key} className="mb-1">
            {group.href ? (
              <Link
                href={group.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                  pathname === group.href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                )}
              >
                {group.icon && <group.icon size={14} strokeWidth={1.8} />}
                {group.label}
              </Link>
            ) : (
              <>
                <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest px-2.5 pt-3 pb-1">
                  {group.label}
                </div>
                {group.children?.map((child) => {
                  const active = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors",
                        active
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                      )}
                    >
                      <child.icon size={13} strokeWidth={1.8} />
                      {child.label}
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        ))}

        <div className="mt-auto pt-3 border-t border-slate-100">
          <Link
            href="/api/auth/cikis"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={13} />
            Çıkış Yap
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} pathname={pathname} />}

      {/* Header */}
      <header className="sticky top-0 z-[100] h-14 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center px-5 gap-0">

        {/* Logo */}
        <Link href="/admin-paneli" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div className="w-[30px] h-[30px] rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Zap size={14} className="text-indigo-600" strokeWidth={2.2} />
          </div>
          <span className="text-[14px] font-bold text-slate-900 tracking-tight">tutar.net</span>
        </Link>

        <div className="w-px h-4.5 bg-slate-200 mx-4 flex-shrink-0" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 flex-1 h-full">
          {NAV.map((group) => (
            <NavItem key={group.key} group={group} pathname={pathname} />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={16} />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Ara…"
              className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 outline-none w-36 focus:w-48 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
            />
          </div>

          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Mail size={15} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 border-2 border-white" />
          </button>

          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Bell size={15} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 border-2 border-white" />
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          <button className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors">
            <Shield size={13} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
