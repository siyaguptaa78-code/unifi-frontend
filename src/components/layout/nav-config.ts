import type React from "react";
/**
 * Portal navigation per role. Shared by the sidebar (links) and the top bar (current page title).
 */
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
  BookOpen,
  Receipt,
  Gift,
  Flame,
} from "lucide-react";
import type { Role } from "@/lib/rbac";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export function navGroupsForRole(role: Role): NavGroup[] {
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
            { href: "/admin/books", label: "Cafe Books", icon: BookOpen },
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
            { href: "/admin/referrals", label: "Refer & Earn", icon: Gift },
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
            { href: "/franchise/trendy-rewards", label: "Trendy Food Rewards", icon: Flame },
            { href: "/franchise/books", label: "Cafe Books", icon: BookOpen },
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
            { href: "/manager/menu", label: "Menu & Items", icon: UtensilsCrossed },
            { href: "/staff/billing", label: "Counter Billing", icon: Receipt },
            { href: "/manager/books", label: "Cafe Books", icon: BookOpen },
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
            { href: "/staff/billing", label: "Counter Billing", icon: Receipt },
            { href: "/staff/books", label: "Book Desk", icon: BookOpen },
            { href: "/staff/orders", label: "Kitchen Orders", icon: ShoppingBag },
            { href: "/staff/visits", label: "Active Visits", icon: History },
          ],
        },
      ];
    default:
      return [];
  }
}

/** Whether a nav link is the active one for the current path. */
export function isNavActive(href: string, pathname: string) {
  return pathname === href || (!href.endsWith("/dashboard") && pathname.startsWith(href + "/"));
}

/** The nav item matching the current page (for titles/breadcrumbs). */
export function currentNavItem(role: Role, pathname: string) {
  for (const g of navGroupsForRole(role)) {
    const item = g.items.find((i) => isNavActive(i.href, pathname));
    if (item) return { group: g.title, item };
  }
  return null;
}
