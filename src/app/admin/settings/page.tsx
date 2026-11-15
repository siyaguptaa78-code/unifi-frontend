"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Settings,
  Save,
  RefreshCw,
  Bell,
  Globe,
  Coins,
  ShoppingBag,
  Send,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"FINANCIAL" | "ORDERING" | "WEBSITE" | "BROADCAST">("FINANCIAL");
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"SYSTEM" | "OFFER" | "ALERT">("SYSTEM");
  const [broadcasting, setBroadcasting] = useState(false);
  // Area-wise targeting
  const [targetScope, setTargetScope] = useState<"ALL" | "AREA" | "CAFES">("ALL");
  const [targetAreas, setTargetAreas] = useState<string[]>([]);
  const [targetCafes, setTargetCafes] = useState<string[]>([]);
  const [allCafes, setAllCafes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/cafes")
      .then((r) => r.json())
      .then((j) => setAllCafes(j.data || []))
      .catch(() => setAllCafes([]));
  }, []);

  // Cities plus neighbourhoods (areas) taken from the cafe addresses.
  const areaOptions = Array.from(
    new Set(allCafes.flatMap((c: any) => [c.address?.city, c.address?.area]).filter(Boolean) as string[])
  ).sort();
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        setSettings(list);
        const map: Record<string, any> = {};
        for (const s of list) map[s.key] = s.value;
        setEditValues(map);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      let val = editValues[key];
      // Try parsing JSON if stringified array or object
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try {
          val = JSON.parse(val);
        } catch {
          // keep as string
        }
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: val }),
      });
      if (!res.ok) throw new Error("Failed to save setting");

      toast.success(`Updated ${key} successfully`);
      loadSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to save setting");
    } finally {
      setSavingKey(null);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
          target: { scope: targetScope, areas: targetAreas, cafeIds: targetCafes },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Broadcast failed");

      toast.success(json.message || "Broadcast sent to all active members!");
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (err: any) {
      toast.error(err.message || "Broadcast failed");
    } finally {
      setBroadcasting(false);
    }
  };

  const financialKeys = [
    "membership.plans",
    "membership.price",
    "membership.points",
    "membership.hours",
    "books.returnDeductions",
    "alerts.lowPointsThreshold",
    "alerts.lowHoursThreshold",
  ];

  const orderingKeys = [
    "orders.preOrdersEnabled",
    "orders.defaultPickupSlots",
    "orders.customerCancelStatuses",
    "orders.refundPolicy",
    "visits.duplicateTapSeconds",
    "visits.otpRequired",
    "trending.limit",
    "trending.windowDays",
  ];

  const websiteKeys = [
    "website.heroHeadline",
    "website.heroSubtitle",
    "website.announcementActive",
    "website.announcementBanner",
    "website.promoCode",
    "website.promoText",
    "platform.maintenanceMode",
  ];

  const renderSettingRow = (key: string) => {
    const s = settings.find((item) => item.key === key);
    if (!s) return null;

    const val = editValues[key];
    const isBool = typeof val === "boolean";

    return (
      <div key={key} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-md">
          <div className="font-mono text-xs font-bold text-amber-400">{key}</div>
          <p className="text-xs text-stone-400 mt-1">{s.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {isBool ? (
            <select
              value={val ? "true" : "false"}
              onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value === "true" }))}
              className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white w-48 font-mono"
            >
              <option value="true">TRUE / ENABLED</option>
              <option value="false">FALSE / DISABLED</option>
            </select>
          ) : (
            <Input
              value={typeof val === "object" ? JSON.stringify(val) : val ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setEditValues((prev) => ({
                  ...prev,
                  [key]: isNaN(Number(v)) || v === "" ? v : Number(v),
                }));
              }}
              className="w-72 text-xs font-medium"
            />
          )}

          <Button
            size="sm"
            onClick={() => handleSave(key)}
            isLoading={savingKey === key}
            className="text-xs h-8"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Centralized Platform Settings & Content Control Center"
        description="Configure runtime business rules, pricing tiers, website announcements, arrival slot parameters, and push broadcast notifications to members."
        badge="Platform Governance"
      />

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("FINANCIAL")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "FINANCIAL" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <Coins className="h-3.5 w-3.5" />
          Financial & Membership
        </button>
        <button
          onClick={() => setActiveTab("ORDERING")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "ORDERING" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Ordering & Hardware
        </button>
        <button
          onClick={() => setActiveTab("WEBSITE")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "WEBSITE" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          Website & Announcements
        </button>
        <button
          onClick={() => setActiveTab("BROADCAST")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "BROADCAST" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          Member Push Broadcast
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* TAB 1: Financial */}
          {activeTab === "FINANCIAL" && (
            <Card className="border-stone-800 bg-stone-900/60 p-6 space-y-6">
              <div className="space-y-6 divide-y divide-stone-800">
                {financialKeys.map((k) => renderSettingRow(k))}
              </div>
            </Card>
          )}

          {/* TAB 2: Ordering */}
          {activeTab === "ORDERING" && (
            <Card className="border-stone-800 bg-stone-900/60 p-6 space-y-6">
              <div className="space-y-6 divide-y divide-stone-800">
                {orderingKeys.map((k) => renderSettingRow(k))}
              </div>
            </Card>
          )}

          {/* TAB 3: Website Content */}
          {activeTab === "WEBSITE" && (
            <Card className="border-stone-800 bg-stone-900/60 p-6 space-y-6">
              <div className="space-y-6 divide-y divide-stone-800">
                {websiteKeys.map((k) => renderSettingRow(k))}
              </div>
            </Card>
          )}

          {/* TAB 4: Member Push Broadcast */}
          {activeTab === "BROADCAST" && (
            <Card className="border-stone-800 bg-stone-900/60 p-6">
              <div className="max-w-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    Dispatch Broadcast to Members
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Send an in-app notification to all customers, or only to customers of cafes in selected areas or specific cafes.
                  </p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-300">Notification Title</label>
                    <Input
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. New Seasonal Single-Origin Brews Available!"
                      required
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300">Send To</label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      {([
                        ["ALL", "All cafes"],
                        ["AREA", "Area-wise"],
                        ["CAFES", "Selected cafes"],
                      ] as const).map(([v, label]) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setTargetScope(v)}
                          className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                            targetScope === v ? "bg-amber-600 text-stone-950 border-amber-500" : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {targetScope === "AREA" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {areaOptions.map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => setTargetAreas((l) => toggle(l, a))}
                            className={`px-2.5 py-1 rounded-full text-[11px] border cursor-pointer ${
                              targetAreas.includes(a) ? "border-amber-500 bg-amber-500/15 text-amber-300" : "border-stone-700 text-stone-400"
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                    {targetScope === "CAFES" && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {allCafes.map((c: any) => (
                          <label key={c._id} className="flex items-center gap-2 text-xs text-stone-300">
                            <input type="checkbox" checked={targetCafes.includes(c._id)} onChange={() => setTargetCafes((l) => toggle(l, c._id))} />
                            {c.name} <span className="text-stone-500">({c.address?.area || c.address?.city})</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-stone-500">
                      Area / cafe broadcasts reach customers whose preferred cafe is there or who have visited or ordered there.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300">Broadcast Type</label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                    >
                      <option value="SYSTEM">System Announcement</option>
                      <option value="OFFER">Promotional Offer</option>
                      <option value="ALERT">Service / Hours Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300">Message Body</label>
                    <textarea
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enter the full message text to be delivered to customer inboxes..."
                      required
                      rows={4}
                      className="w-full mt-1 p-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <Button type="submit" size="sm" isLoading={broadcasting} className="text-xs h-9">
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {targetScope === "ALL" ? "Deliver Broadcast to All Members" : "Deliver Area-wise Broadcast"}
                  </Button>
                </form>
              </div>
            </Card>
          )}
        </>
      )}
    </PortalLayout>
  );
}
