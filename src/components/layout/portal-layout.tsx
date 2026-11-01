"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalSidebar } from "./portal-sidebar";
import { useAuth } from "@/components/providers";
import { LoadingScreen } from "@/components/ui/spinner";
import type { Role } from "@/lib/rbac";

interface PortalLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function PortalLayout({ children, allowedRoles }: PortalLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/login");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return <LoadingScreen message="Verifying session and permissions..." />;
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100">
      <PortalSidebar />
      <main className="flex-1 overflow-x-hidden p-6 md:p-8 bg-gradient-to-b from-stone-950 via-stone-900/20 to-stone-950">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}

