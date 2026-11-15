"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatPoints } from "@/lib/utils";
import { toast } from "sonner";

async function saveSetting(key: string, value: unknown) {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error((await res.json()).error?.message || "Save failed");
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referrerPoints, setReferrerPoints] = useState(0);
  const [refereePoints, setRefereePoints] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const j = await fetch("/api/admin/referrals").then((r) => r.json());
      setData(j.data);
      setReferrerPoints(j.data.config.referrerPoints);
      setRefereePoints(j.data.config.refereePoints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async () => {
    try {
      await saveSetting("referral.enabled", !data.config.enabled);
      toast.success(`Refer & Earn ${data.config.enabled ? "turned OFF" : "turned ON"}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveRewards = async () => {
    setSaving(true);
    try {
      await saveSetting("referral.referrerPoints", Math.max(0, Math.round(referrerPoints)));
      await saveSetting("referral.refereePoints", Math.max(0, Math.round(refereePoints)));
      toast.success("Reward amounts saved");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader title="Refer & Earn" description="Turn the referral programme on or off and set the reward points." badge="Super Admin" />

      {loading || !data ? (
        <div className="p-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-stone-800 bg-stone-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Programme status</span>
                <Badge variant={data.config.enabled ? "success" : "secondary"}>{data.config.enabled ? "ON" : "OFF"}</Badge>
              </div>
              <p className="text-xs text-stone-400">
                When ON, every customer gets a referral code. Rewards are paid when the referred friend completes their first recharge. When OFF, codes
                are hidden and new sign-ups ignore them.
              </p>
              <Button onClick={toggle} variant={data.config.enabled ? "destructive" : "success"} className="w-full">
                {data.config.enabled ? "Turn Refer & Earn OFF" : "Turn Refer & Earn ON"}
              </Button>
            </Card>

            <Card className="border-stone-800 bg-stone-900/60 p-5 space-y-3">
              <span className="text-sm font-bold text-white">Rewards</span>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Referrer gets (points)" type="number" min={0} value={referrerPoints} onChange={(e) => setReferrerPoints(Number(e.target.value))} />
                <Input label="New friend gets (points)" type="number" min={0} value={refereePoints} onChange={(e) => setRefereePoints(Number(e.target.value))} />
              </div>
              <Button onClick={saveRewards} isLoading={saving} className="w-full">
                Save rewards
              </Button>
            </Card>
          </div>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardContent className="p-0">
              {data.rows.length === 0 ? (
                <EmptyState title="No referrals yet" description="Customers who sign up with a referral code will appear here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>New customer</TableHead>
                      <TableHead>Referred by</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Reward</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((r: any) => (
                      <TableRow key={r._id}>
                        <TableCell className="text-xs">
                          <div className="font-semibold text-white">{r.user?.name}</div>
                          <div className="text-[10px] text-stone-500">{r.user?.mobile}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="text-stone-200">{r.referredBy?.name}</div>
                          <div className="text-[10px] text-stone-500">{r.referredBy?.mobile}</div>
                        </TableCell>
                        <TableCell className="text-xs text-stone-400">{formatDate(r.createdAt)}</TableCell>
                        <TableCell>
                          {r.referralRewardedAt ? (
                            <Badge variant="success">Paid {formatDate(r.referralRewardedAt)}</Badge>
                          ) : (
                            <Badge variant="secondary">Pending first recharge</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <p className="text-[11px] text-stone-500">
            Current rewards: referrer {formatPoints(data.config.referrerPoints)}, new friend {formatPoints(data.config.refereePoints)}.
          </p>
        </>
      )}
    </PortalLayout>
  );
}
