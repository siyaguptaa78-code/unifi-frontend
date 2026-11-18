"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PortalSidebar } from "./portal-sidebar";
import { PortalTopbar } from "./portal-topbar";
import { useAuth } from "@/components/providers";
import { LoadingScreen } from "@/components/ui/spinner";
import type { Role } from "@/lib/rbac";

interface PortalLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * App shell for every staff/admin portal page: fixed sidebar (desktop) or drawer (mobile),
 * sticky top bar, and a scrolling content area.
 */
export function PortalLayout({ children, allowedRoles }: PortalLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/login");
    }
  }, [user, loading, allowedRoles, router]);

  // Close the mobile drawer on navigation, and stop the page scrolling behind it while open.
  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (loading) {
    return <LoadingScreen message="Verifying session and permissions..." />;
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <PortalSidebar mobileOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <PortalTopbar onMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_55%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
