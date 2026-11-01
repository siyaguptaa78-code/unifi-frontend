"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Bell, Check, CheckCheck, Clock, Coins, ShoppingBag, CreditCard } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/customer/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data.notifications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        toast.success("All notifications marked as read");
        loadNotifications();
      }
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      loadNotifications();
    } catch {
      // ignore
    }
  };

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

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-stone-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Bell className="h-6 w-6 text-amber-500" />
                <span>In-App Notifications</span>
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Real-time updates regarding payments, recharges, low hours, and kitchen order alerts.
              </p>
            </div>
            {notifications.some((n) => !n.read) && (
              <Button size="sm" variant="outline" onClick={markAllRead} className="gap-1.5 text-xs">
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <EmptyState
                  title="No notifications yet"
                  description="When you order food, tap your card or recharge, alerts will be logged here."
                />
              ) : (
                <div className="divide-y divide-stone-800/60">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && markSingleRead(n._id)}
                      className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                        n.read ? "bg-transparent hover:bg-stone-900/40" : "bg-amber-950/15 hover:bg-amber-950/25"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            n.read
                              ? "bg-stone-800 text-stone-400"
                              : "bg-amber-500 text-stone-950 font-bold"
                          }`}
                        >
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold ${n.read ? "text-stone-300" : "text-white"}`}>
                              {n.title}
                            </h4>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-stone-500 mt-2 block">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                      </div>

                      {n.link && (
                        <a href={n.link} className="shrink-0 text-xs text-amber-500 hover:underline">
                          View &rarr;
                        </a>
                      )}
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

