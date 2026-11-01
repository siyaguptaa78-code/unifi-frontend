"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Settings, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

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
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editValues[key] }),
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

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Platform Business Rules & Parameters"
        description="Configure runtime membership price, points crediting ratio, hours refresh allocation and alerts thresholds."
        badge="System Configuration"
      />

      <Card className="border-stone-800 bg-stone-900/60 p-6 space-y-6">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6 divide-y divide-stone-800">
            {settings.map((s) => (
              <div key={s.key} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-md">
                  <div className="font-mono text-xs font-bold text-amber-400">{s.key}</div>
                  <p className="text-xs text-stone-400 mt-1">{s.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    value={
                      typeof editValues[s.key] === "object"
                        ? JSON.stringify(editValues[s.key])
                        : editValues[s.key] ?? ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditValues((prev) => ({
                        ...prev,
                        [s.key]: isNaN(Number(v)) || v === "" ? v : Number(v),
                      }));
                    }}
                    className="w-48 text-xs font-semibold"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSave(s.key)}
                    isLoading={savingKey === s.key}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalLayout>
  );
}

