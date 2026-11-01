"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Coins,
  Store,
  Building2,
  Package,
  UserCheck,
  UtensilsCrossed,
  ShoppingBag,
  History,
  FileBarChart,
  Settings,
  ShieldAlert,
  ScanLine,
  LogOut,
  Coffee,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { ROLE_LABELS, type Role } from "@/lib/rbac";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function PortalSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  const getGroups = (): NavGroup[] => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          {
            title: "Executive Oversight",
            items: [
              { href: "/admin/dashboard", label: "Executive KPI", icon: LayoutDashboard },
              { href: "/admin/reports", label: "Reports & Analytics", icon: FileBarChart },
            ],
          },
          {
            title: "Members & Finance",
            items: [
              { href: "/admin/customers", label: "Customer CRM", icon: Users },
              { href: "/admin/memberships", label: "Membership Plans", icon: CreditCard },
              { href: "/admin/payments", label: "Payments & Refunds", icon: Coins },
              { href: "/admin/points-ledger", label: "Points Ledger", icon: Coins },
            ],
          },
          {
            title: "Franchise & Operations",
            items: [
              { href: "/admin/cafes", label: "Cafes & Branches", icon: Store },
              { href: "/admin/franchises", label: "Franchises", icon: Building2 },
              { href: "/admin/franchise-packages", label: "License Packages", icon: Package },
              { href: "/admin/menu", label: "Menu Governance", icon: UtensilsCrossed },
              { href: "/admin/orders", label: "Universal Orders", icon: ShoppingBag },
            ],
          },
          {
            title: "Access & Personnel",
            items: [
              { href: "/admin/staff", label: "Users & Staffing", icon: UserCheck },
              { href: "/admin/visits", label: "Visits & Cards", icon: ScanLine },
            ],
          },
          {
            title: "System Control",
            items: [
              { href: "/admin/settings", label: "Platform Settings", icon: Settings },
              { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
            ],
          },
        ];
      case "SUPERVISOR":
        return [
          {
            title: "Operations Oversight",
            items: [
              { href: "/supervisor/dashboard", label: "Overview", icon: LayoutDashboard },
              { href: "/supervisor/cafes", label: "Assigned Cafes", icon: Store },
              { href: "/supervisor/orders", label: "Cafe Orders", icon: ShoppingBag },
              { href: "/supervisor/visits", label: "Visit Activity", icon: History },
              { href: "/supervisor/staff", label: "Cafe Staff", icon: UserCheck },
              { href: "/supervisor/reports", label: "Performance Reports", icon: FileBarChart },
            ],
          },
        ];
      case "FRANCHISE_OWNER":
        return [
          {
            title: "Franchise Operations",
            items: [
              { href: "/franchise/dashboard", label: "Overview", icon: LayoutDashboard },
              { href: "/franchise/cafes", label: "Locations", icon: Store },
              { href: "/franchise/orders", label: "Orders & Sales", icon: ShoppingBag },
              { href: "/franchise/menu", label: "Menu Customization", icon: UtensilsCrossed },
              { href: "/franchise/staff", label: "Branch Staff", icon: UserCheck },
              { href: "/franchise/reports", label: "Revenue Reports", icon: FileBarChart },
            ],
          },
        ];
      case "MANAGER":
        return [
          {
            title: "Cafe Management",
            items: [
              { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { href: "/manager/orders", label: "Kitchen Queue", icon: ShoppingBag },
              { href: "/manager/menu", label: "Menu Availability", icon: UtensilsCrossed },
              { href: "/manager/staff", label: "Staff Roster", icon: UserCheck },
              { href: "/manager/visits", label: "Check-in Records", icon: History },
              { href: "/manager/reports", label: "Daily Sales", icon: FileBarChart },
            ],
          },
        ];
      case "STAFF":
        return [
          {
            title: "Cafe Floor Counter",
            items: [
              { href: "/staff/dashboard", label: "Counter Overview", icon: LayoutDashboard },
              { href: "/staff/scan-card", label: "NFC / RFID Gate Scanner", icon: ScanLine },
              { href: "/staff/orders", label: "Kitchen Orders", icon: ShoppingBag },
              { href: "/staff/visits", label: "Active Visits", icon: History },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const groups = getGroups();

  return (
    <aside className="w-64 border-r border-stone-800/80 bg-stone-950 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-black shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-white tracking-tight">
                Uni<span className="text-amber-500">Cafe</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO
              </span>
            </div>
            <span className="block text-[10px] text-stone-400 font-medium uppercase tracking-widest -mt-0.5">
              Enterprise Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Role Profile Badge */}
      <div className="p-3">
        <div className="rounded-xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-900 border border-stone-800/90 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Authority</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="text-xs font-bold text-amber-400 mt-1 truncate">{ROLE_LABELS[role]}</div>
          <div className="text-[11px] text-stone-400 truncate mt-0.5 font-medium">{user.name}</div>
        </div>
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-sm"
                      : "text-stone-300 hover:text-white hover:bg-stone-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-amber-400" : "text-stone-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="h-3 w-3 text-amber-400" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-stone-800/80 bg-stone-950 space-y-1.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Website</span>
          </div>
          <span className="text-[10px] text-stone-400">↗</span>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
