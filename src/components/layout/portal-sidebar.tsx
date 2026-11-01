"use client";

import React, { useState } from "react";
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
  ChevronDown,
  LogOut,
  Coffee,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function PortalSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const role = user.role;

  const getLinks = (): NavLink[] => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { href: "/admin/dashboard", label: "Executive KPI", icon: LayoutDashboard },
          { href: "/admin/customers", label: "Customers", icon: Users },
          { href: "/admin/memberships", label: "Memberships", icon: CreditCard },
          { href: "/admin/payments", label: "Payments", icon: Coins },
          { href: "/admin/points-ledger", label: "Points Ledger", icon: Coins },
          { href: "/admin/cafes", label: "Cafes & Locations", icon: Store },
          { href: "/admin/franchises", label: "Franchises", icon: Building2 },
          { href: "/admin/franchise-packages", label: "Franchise Packages", icon: Package },
          { href: "/admin/staff", label: "Supervisors & Staff", icon: UserCheck },
          { href: "/admin/menu", label: "Menu Governance", icon: UtensilsCrossed },
          { href: "/admin/orders", label: "Orders & Refunds", icon: ShoppingBag },
          { href: "/admin/visits", label: "Visits & Cards", icon: ScanLine },
          { href: "/admin/reports", label: "Reports & CSV", icon: FileBarChart },
          { href: "/admin/settings", label: "Platform Settings", icon: Settings },
          { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
        ];
      case "SUPERVISOR":
        return [
          { href: "/supervisor/dashboard", label: "Supervisor Overview", icon: LayoutDashboard },
          { href: "/supervisor/cafes", label: "Assigned Cafes", icon: Store },
          { href: "/supervisor/orders", label: "Cafe Orders", icon: ShoppingBag },
          { href: "/supervisor/visits", label: "Visit Activity", icon: History },
          { href: "/supervisor/staff", label: "Cafe Staff", icon: UserCheck },
          { href: "/supervisor/reports", label: "Performance Reports", icon: FileBarChart },
        ];
      case "FRANCHISE_OWNER":
        return [
          { href: "/franchise/dashboard", label: "Franchise Overview", icon: LayoutDashboard },
          { href: "/franchise/cafes", label: "My Cafe Locations", icon: Store },
          { href: "/franchise/orders", label: "Sales & Orders", icon: ShoppingBag },
          { href: "/franchise/menu", label: "Menu & Pricing", icon: UtensilsCrossed },
          { href: "/franchise/staff", label: "Staff Roster", icon: UserCheck },
          { href: "/franchise/reports", label: "Revenue Reports", icon: FileBarChart },
        ];
      case "MANAGER":
        return [
          { href: "/manager/dashboard", label: "Cafe Dashboard", icon: LayoutDashboard },
          { href: "/manager/orders", label: "Live Order Queue", icon: ShoppingBag },
          { href: "/manager/menu", label: "Menu Availability", icon: UtensilsCrossed },
          { href: "/manager/staff", label: "Staff Roster", icon: UserCheck },
          { href: "/manager/visits", label: "Check-in Records", icon: History },
          { href: "/manager/reports", label: "Daily Sales Reports", icon: FileBarChart },
        ];
      case "STAFF":
        return [
          { href: "/staff/dashboard", label: "Staff Counter", icon: LayoutDashboard },
          { href: "/staff/scan-card", label: "NFC / RFID Scanner", icon: ScanLine },
          { href: "/staff/orders", label: "Kitchen Order Queue", icon: ShoppingBag },
          { href: "/staff/visits", label: "Active Visits", icon: History },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 border-r border-stone-800 bg-stone-950 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-stone-950 font-bold shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              Uni<span className="text-amber-500">Cafe</span>
            </span>
            <span className="block text-[10px] text-stone-400 -mt-1 font-medium uppercase tracking-wider">
              Operations OS
            </span>
          </div>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="p-4 pb-2">
        <div className="rounded-lg bg-stone-900 border border-stone-800/80 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-400">Current Role</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xs font-bold text-amber-400 mt-0.5">{ROLE_LABELS[role]}</div>
          <div className="text-[11px] text-stone-400 truncate mt-0.5">{user.name}</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                active
                  ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                  : "text-stone-300 hover:text-white hover:bg-stone-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User & Logout */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/80">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-400 hover:text-red-400 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

