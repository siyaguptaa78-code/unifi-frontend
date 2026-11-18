"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, ExternalLink, LogOut, Menu, CalendarDays } from "lucide-react";
import { useAuth } from "@/components/providers";
import { ROLE_LABELS } from "@/lib/rbac";
import { initials } from "@/lib/utils";
import { currentNavItem } from "./nav-config";

/** Sticky top bar for portal pages: menu toggle (mobile), breadcrumb, date and account menu. */
export function PortalTopbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const current = currentNavItem(user.role, pathname);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="lg:hidden -ml-1 rounded-lg p-2 text-stone-300 hover:bg-stone-900 hover:text-white cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex items-center gap-1.5 text-sm">
          {current && (
            <>
              <span className="hidden sm:inline truncate text-stone-500">{current.group}</span>
              <ChevronRight className="hidden sm:inline h-3.5 w-3.5 shrink-0 text-stone-600" />
            </>
          )}
          <span className="truncate font-semibold text-stone-100">{current?.item.label ?? ROLE_LABELS[user.role]}</span>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/60 px-2.5 py-1.5 text-xs text-stone-400">
            <CalendarDays className="h-3.5 w-3.5 text-amber-500" />
            {today}
          </span>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/60 py-1 pl-1 pr-2 hover:border-stone-700 cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-[11px] font-bold text-amber-300">
                {initials(user.name)}
              </span>
              <span className="hidden sm:block max-w-[140px] truncate text-left">
                <span className="block truncate text-xs font-semibold text-white leading-tight">{user.name}</span>
                <span className="block truncate text-[10px] text-stone-500 leading-tight">{ROLE_LABELS[user.role]}</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-stone-800 bg-stone-900 shadow-2xl">
                <div className="border-b border-stone-800 px-4 py-3">
                  <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                  <div className="truncate text-xs text-stone-400">{user.email}</div>
                  <div className="mt-1 text-[11px] font-medium text-amber-400">{ROLE_LABELS[user.role]}</div>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/"
                    target="_blank"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> Public website
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-red-950/40 hover:text-red-400 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
