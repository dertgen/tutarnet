"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/nasil-calisir", label: "Neden biz?" },
  { href: "/iletisim",      label: "İletişim" },
  { href: "/magazalar",     label: "Mağazalar" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pointer-events-none transition-[padding] duration-300",
        scrolled ? "px-5 pt-4 pb-0" : "px-5 pt-6 pb-0",
      )}
    >
      <header
        className={cn(
          "relative pointer-events-auto mx-auto max-w-[960px] h-[60px] flex items-center justify-between px-6 rounded-full border border-white/10 transition-all duration-300",
          scrolled
            ? "bg-[#131313]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
            : "bg-[#131313] shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.svg" alt="tutar.net" className="h-[28px] w-auto" />
        </Link>

        {/* Desktop nav - Centered */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/giris-yap"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold text-white/90 transition-all border border-white/5"
          >
            <User size={15} />
            <span className="hidden sm:inline">Giriş Yap</span>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost" 
                size="icon"
                className="md:hidden w-10 h-10 rounded-full hover:bg-white/10 text-white"
              >
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#131313] border-white/10 text-white w-[280px]">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="text-xl font-bold text-white tracking-tight">Menü</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3.5 text-base font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
