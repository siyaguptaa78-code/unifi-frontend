"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Coins,
  Clock,
  CreditCard,
  Utensils,
  ShoppingBag,
  History,
  QrCode,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { formatPoints, formatMinutes, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/components/providers";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/membership");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  const membership = data?.membership;
  const card = data?.card;
  const activeVisit = data?.activeVisit;
  const recentOrders = data?.recentOrders || [];
  const recentVisits = data?.recentVisits || [];
  const flags = data?.flags;

  const points = membership?.pointsBalance ?? 0;
  const minutes = membership?.remainingMinutes ?? 0;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Welcome back, {user?.name}</span>
                {flags?.inactive && <Badge variant="secondary">INACTIVE MEMBERSHIP</Badge>}
                {!flags?.inactive && <Badge variant="success">ACTIVE MEMBER</Badge>}
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Your Unifi Cafe card is valid at all 5 registered locations. Tap to enter, spend points on food.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/customer/membership">
                <Button className="font-semibold gap-1.5 shadow-md">
                  <Coins className="h-4 w-4" />
                  <span>Recharge</span>
                </Button>
              </Link>
              <Link href="/customer/menu">
                <Button variant="outline" className="gap-1.5 border-stone-800">
                  <Utensils className="h-4 w-4 text-amber-500" />
                  <span>Order Food</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Visit Alert if user is currently inside a cafe */}
          {activeVisit && (
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-stone-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0 animate-pulse">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Visit Session</span>
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Currently checked into {activeVisit.cafe?.name}
                  </h3>
                  <p className="text-xs text-stone-300">
                    Entry recorded at {formatDateTime(activeVisit.entryAt)}. Session timer is running.
                  </p>
                </div>
              </div>
              <Link href="/customer/visits">
                <Button size="sm" variant="secondary" className="text-xs">
                  View Visit Details
                </Button>
              </Link>
            </div>
          )}

          {/* Hours Exhausted Alert */}
          {flags?.hoursExhausted && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-200">Membership Hours Exhausted</h4>
                  <p className="text-xs text-red-300/80">
                    You have 0 hours remaining. If you are inside a cafe you can exit safely, but you cannot enter another cafe until you recharge.
                  </p>
                </div>
              </div>
              <Link href="/customer/membership">
                <Button size="sm" variant="destructive" className="shrink-0">
                  Recharge Now
                </Button>
              </Link>
            </div>
          )}

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Available Points"
              value={formatPoints(points)}
              subtitle="1 pt = ₹1 on all menu items"
              icon={Coins}
              highlight={true}
            />
            <StatCard
              title="Remaining Hours"
              value={flags?.hoursExhausted ? "0 Hours" : formatMinutes(minutes)}
              subtitle="Resets to 150h on recharge"
              icon={Clock}
            />
            <StatCard
              title="Membership Status"
              value={membership?.status || "INACTIVE"}
              subtitle={`${membership?.rechargeCount || 0} lifetime recharges`}
              icon={CreditCard}
            />
            <StatCard
              title="Membership Card"
              value={card?.uid || "N/A"}
              subtitle={card?.cardType ? `${card.cardType} (${card.status})` : "Digital Card Active"}
              icon={QrCode}
            />
          </div>

          {/* Digital Card Preview & Quick Access */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card Widget */}
            <div className="rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Digital Access Card</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Unifi Cafe Universal</h3>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="my-6">
                <div className="text-[10px] text-stone-400 uppercase tracking-widest">UID</div>
                <div className="text-xl font-mono font-bold tracking-wider text-amber-400">
                  {card?.uid || "V-DEMO-001"}
                </div>
                <div className="text-xs text-stone-400 mt-1">{card?.cardNumber}</div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-between items-center text-xs">
                <div className="text-stone-400">
                  Customer: <strong className="text-stone-200">{user?.name}</strong>
                </div>
                <Link href="/customer/card">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-400 p-0 hover:bg-transparent">
                    View Full Card &rarr;
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Orders Widget */}
            <Card className="border-stone-800 bg-stone-900/60 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-500" />
                  <span>Recent Food & Coffee Orders</span>
                </CardTitle>
                <Link href="/customer/orders" className="text-xs text-amber-500 hover:underline">
                  View all &rarr;
                </Link>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <EmptyState
                    title="No orders yet"
                    description="Browse our artisan coffee, snacks and gourmet bowls and order with your points balance."
                    actionLabel="Open Menu"
                    onAction={() => window.location.href = "/customer/menu"}
                  />
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((ord: any) => (
                      <div
                        key={ord._id}
                        className="flex items-center justify-between p-3 rounded-lg border border-stone-800/80 bg-stone-950/40 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{ord.orderNumber}</div>
                          <div className="text-stone-400 text-[11px] mt-0.5">
                            {ord.cafe?.name} • {ord.itemCount} items • {formatDateTime(ord.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-400">{formatPoints(ord.totalPoints)}</div>
                          <Badge variant={ord.status === "COMPLETED" ? "success" : ord.status === "CANCELLED" ? "destructive" : "warning"} className="text-[10px] mt-1">
                            {ord.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Visits Table */}
          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-amber-500" />
                <span>Recent Cafe Visits</span>
              </CardTitle>
              <Link href="/customer/visits" className="text-xs text-amber-500 hover:underline">
                View all &rarr;
              </Link>
            </CardHeader>
            <CardContent>
              {recentVisits.length === 0 ? (
                <EmptyState
                  title="No visits recorded"
                  description="When you tap your NFC or RFID card at any Unifi Cafe location, your check-in and elapsed time will appear here."
                />
              ) : (
                <div className="divide-y divide-stone-800/60">
                  {recentVisits.map((vis: any) => (
                    <div key={vis._id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-500 shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{vis.cafe?.name}</div>
                          <div className="text-stone-400 text-[11px]">
                            {formatDateTime(vis.entryAt)}
                            {vis.exitAt && ` to ${new Date(vis.exitAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-stone-200">
                          {vis.status === "ACTIVE" ? (
                            <span className="text-amber-400 font-bold">Active Now</span>
                          ) : (
                            formatMinutes(vis.minutesConsumed)
                          )}
                        </div>
                        <Badge variant={vis.status === "COMPLETED" ? "secondary" : "default"} className="text-[10px] mt-0.5">
                          {vis.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

