"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, ShoppingBag, History, Clock, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/components/providers";

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/operations/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const kpis = data?.kpis;

  return (
    <PortalLayout allowedRoles={["STAFF", "MANAGER", "SUPER_ADMIN"]}>
      <PageHeader
        title={`Staff Counter — Welcome, ${user?.name}`}
        description="Daily operational queue for contactless customer check-in and kitchen food orders."
        badge="Live Operations"
        action={
          <Link href="/staff/scan-card">
            <Button className="font-bold gap-2">
              <ScanLine className="h-4 w-4" />
              <span>Launch NFC Scanner</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Check-Ins"
          value={kpis?.activeVisits ?? 0}
          subtitle="Customers currently in cafe"
          icon={Clock}
          highlight={true}
        />
        <StatCard
          title="Pending Kitchen Orders"
          value={kpis?.pendingOrders ?? 0}
          subtitle="Needs barista/kitchen acceptance"
          icon={ShoppingBag}
        />
        <StatCard
          title="In-Progress Orders"
          value={kpis?.inProgress ?? 0}
          subtitle="Preparing or ready for pickup"
          icon={ShoppingBag}
        />
        <StatCard
          title="Total Visits Today"
          value={kpis?.visits ?? 0}
          subtitle="Customer card tap sessions"
          icon={History}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card className="border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3">
              <ScanLine className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">NFC / RFID Card Scanner</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Tap customer membership cards upon entrance and exit. Automatic minute calculation, zero-hour safety exit, and duplicate tap debounce.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/staff/scan-card">
              <Button className="w-full font-semibold gap-1.5">
                <span>Open Card Scanner</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Kitchen Order Queue</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              View customer orders in real-time. Accept orders, change state to &apos;Preparing&apos;, mark ready for pickup and dispatch notifications.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/staff/orders">
              <Button variant="secondary" className="w-full font-semibold gap-1.5">
                <span>View Kitchen Queue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}

