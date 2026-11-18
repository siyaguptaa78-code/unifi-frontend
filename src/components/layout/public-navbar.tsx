"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Shield, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";
import { ROLE_HOME } from "@/lib/rbac";

export function PublicNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/membership", label: "Membership" },
    { href: "/locations", label: "Locations" },
    { href: "/franchise", label: "Franchise" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-md">
            <Coffee className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Unifi <span className="text-amber-500">Cafe</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-stone-400 -mt-1 uppercase tracking-wider">
              Work & Coffee Club
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                pathname === link.href
                  ? "bg-stone-800 text-amber-400"
                  : "text-stone-300 hover:text-white hover:bg-stone-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href={ROLE_HOME[user.role]}>
              <Button size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span>My Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-stone-300">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-sm">
                  Join Unifi Cafe
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

