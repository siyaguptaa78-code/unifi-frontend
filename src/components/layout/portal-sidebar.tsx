"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ExternalLink, LogOut, X } from "lucide-react";
import { useAuth } from "@/components/providers";
import { ROLE_LABELS } from "@/lib/rbac";
import { initials } from "@/lib/utils";
import { navGroupsForRole, isNavActive } from "./nav-config";

/**
 * Portal sidebar. On desktop it is fixed to the viewport (the page scrolls, the sidebar does not)
 * and only the link list scrolls when it is taller than the screen. On smaller screens it becomes
 * a slide-in drawer opened from the top bar.
 */
export function PortalSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      {/* Desktop: fixed rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-stone-800/80 bg-stone-950 select-none">
        <SidebarContent />
      </aside>

      {/* Mobile / tablet: drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-label="Navigation"
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-stone-800 bg-stone-950 shadow-2xl transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (!user) return null;
  const groups = navGroupsForRole(user.role);

  return (
    <>
      {/* Brand */}
      <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-stone-800/80">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight whitespace-nowrap">
              Unifi <span className="text-amber-500">Cafe</span>
            </span>
            <span className="block text-[10px] text-stone-500 font-semibold uppercase tracking-[0.18em] -mt-0.5">Enterprise Suite</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-900 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Signed-in identity */}
      <div className="shrink-0 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-stone-800/90 bg-gradient-to-br from-stone-900 to-stone-900/40 p-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40">
            {initials(user.name)}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-stone-950" title="Online" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-white">{user.name}</div>
            <div className="truncate text-[11px] font-medium text-amber-400">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      </div>

      {/* Links — the only part that scrolls */}
      <nav className="scrollbar-thin flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-3 space-y-5" aria-label="Portal">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{group.title}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      active ? "bg-amber-500/10 text-amber-300" : "text-stone-400 hover:bg-stone-900 hover:text-stone-100"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-400" />}
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-amber-400" : "text-stone-500 group-hover:text-stone-300"}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-400">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-stone-800/80 p-3 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-stone-400 hover:bg-stone-900 hover:text-stone-100 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Public Website</span>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-stone-400 hover:bg-red-950/30 hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}
