"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, User, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";
import { ROLE_HOME } from "@/lib/rbac";

export function PublicNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/membership", label: "Membership" },
    { href: "/locations", label: "Locations" },
    { href: "/franchise", label: "Franchise" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all ${
        scrolled || mobileOpen ? "border-stone-800/80 bg-stone-950/90 shadow-lg shadow-black/30" : "border-transparent bg-stone-950/60"
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20">
            <Coffee className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Unifi <span className="text-amber-500">Cafe</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-stone-400 -mt-1 uppercase tracking-wider">Work & Coffee Club</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === link.href ? "bg-stone-800/80 text-amber-400" : "text-stone-300 hover:text-white hover:bg-stone-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link href={ROLE_HOME[user.role]} className="hidden sm:block">
              <Button size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span>My Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-stone-300">
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm" className="shadow-sm">
                  Join Unifi Cafe
                </Button>
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden rounded-lg p-2 text-stone-300 hover:bg-stone-900 hover:text-white cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-800/80 bg-stone-950/95 px-4 pb-5 pt-3">
          <nav className="grid gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === link.href ? "bg-stone-800/80 text-amber-400" : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {user ? (
              <Link href={ROLE_HOME[user.role]} className="col-span-2">
                <Button className="w-full gap-2">
                  <User className="h-4 w-4" /> My Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full">Join</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
