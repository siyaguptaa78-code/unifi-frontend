"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coffee,
  Coins,
  Clock,
  CreditCard,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  Utensils,
  History,
  QrCode,
  AlertTriangle,
  Menu,
  X,
  BookOpen,
  Gift,
} from "lucide-react";
import { VisitOtpBanner } from "@/components/layout/visit-otp-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers";
import { formatMinutes, formatPoints } from "@/lib/utils";

export function CustomerNavbar() {
  const pathname = usePathname();
  const { user, logout, refreshUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/customer/notifications");
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/customer/dashboard", label: "Overview", icon: Coffee },
    { href: "/customer/menu", label: "Menu & Order", icon: Utensils },
    { href: "/customer/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/customer/card", label: "Digital Card", icon: QrCode },
    { href: "/customer/membership", label: "Membership", icon: CreditCard },
    { href: "/customer/wallet", label: "Points Wallet", icon: Coins },
    { href: "/customer/visits", label: "Cafe Visits", icon: History },
    { href: "/customer/books", label: "My Books", icon: BookOpen },
    { href: "/customer/refer", label: "Refer & Earn", icon: Gift },
  ];

  const points = user?.membership?.pointsBalance ?? 0;
  const minutes = user?.membership?.remainingMinutes ?? 0;
  const isHoursExhausted = user?.membership?.status === "ACTIVE" && minutes <= 0;
  const isLowHours = user?.membership?.status === "ACTIVE" && minutes > 0 && minutes < 600; // < 10 hrs

  return (
    <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/customer/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-sm">
              <Coffee className="h-5 w-5 stroke-[2.2]" />
            </div>
            <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
              Unifi <span className="text-amber-500">Cafe</span>
            </span>
          </Link>

          {/* Quick Balance Pills */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/customer/wallet">
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">
                <Coins className="h-3.5 w-3.5" />
                <span>{formatPoints(points)}</span>
              </div>
            </Link>

            <Link href="/customer/membership">
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isHoursExhausted
                    ? "border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    : isLowHours
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                    : "border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                {isHoursExhausted ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span>{isHoursExhausted ? "0h (Exhausted)" : formatMinutes(minutes)}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-stone-300 hover:text-white hover:bg-stone-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/customer/notifications" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-stone-400 hover:text-white">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-stone-950">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/customer/profile">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-stone-800 text-stone-300">
              <User className="h-3.5 w-3.5 text-amber-500" />
              <span className="max-w-[100px] truncate">{user?.name?.split(" ")[0]}</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={logout} className="h-9 w-9 text-stone-400 hover:text-red-400" title="Log out">
            <LogOut className="h-4 w-4" />
          </Button>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 text-stone-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-800 bg-stone-950 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-stone-800">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <Coins className="h-3.5 w-3.5" />
              <span>{formatPoints(points)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-800 px-3 py-1 text-xs font-semibold text-stone-300">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>{formatMinutes(minutes)}</span>
            </div>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg ${
                  active ? "bg-amber-500/15 text-amber-400 font-semibold" : "text-stone-300 hover:bg-stone-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
      <VisitOtpBanner />
    </header>
  );
}

