"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Award } from "lucide-react";
import { formatDate, formatPoints } from "@/lib/utils";
import { toast } from "sonner";

export default function TrendyRewardsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rewardFor, setRewardFor] = useState<any>(null);
  const [points, setPoints] = useState(500);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const j = await fetch("/api/franchise/trendy-sales").then((r) => r.json());
      setData(j.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const give = async () => {
    if (!rewardFor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cafes/${rewardFor.cafeId}/reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, note }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Could not give reward");
      toast.success(`${formatPoints(points)} reward given to ${rewardFor.name}`);
      setRewardFor(null);
      setNote("");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["FRANCHISE_OWNER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Trendy Food Rewards"
        description="See which outlets sell the most Trendy Food (last 30 days) and reward them."
        badge="Rewards"
      />

      {loading ? (
        <div className="p-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {data?.trending?.length > 0 && (
            <Card className="border-amber-500/30 bg-stone-900/60 p-4">
              <div className="text-xs font-bold text-white mb-2">🔥 Current Trendy Food</div>
              <div className="flex flex-wrap gap-2">
                {data.trending.map((t: any) => (
                  <Badge key={t.menuItemId} variant={t.pinned ? "default" : "warning"}>
                    {t.name} · {t.quantity} sold{t.pinned ? " · pinned" : ""}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          <Card className="border-stone-800 bg-stone-900/60">
            <CardContent className="p-0">
              {!data?.cafes?.length ? (
                <EmptyState title="No outlets" description="Your outlets will appear here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Outlet</TableHead>
                      <TableHead className="text-right">Trendy items sold</TableHead>
                      <TableHead className="text-right">Trendy sales</TableHead>
                      <TableHead>Top sellers</TableHead>
                      <TableHead>Recent rewards</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.cafes.map((c: any) => (
                      <TableRow key={c.cafeId}>
                        <TableCell className="text-xs">
                          <div className="font-semibold text-white">{c.name}</div>
                          <div className="font-mono text-[10px] text-amber-500">{c.code}</div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-white">{c.trendyQuantity}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-amber-400">{formatPoints(c.trendyPoints)}</TableCell>
                        <TableCell className="text-xs text-stone-300">
                          {c.topItems.length ? c.topItems.map((i: any) => `${i.name} (${i.quantity})`).join(", ") : "—"}
                        </TableCell>
                        <TableCell className="text-[11px] text-stone-400">
                          {c.rewards.length
                            ? c.rewards.map((r: any, i: number) => (
                                <div key={i}>
                                  +{formatPoints(r.points)} · {formatDate(r.at)}
                                </div>
                              ))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="gap-1 h-8 text-xs"
                            onClick={() => {
                              setRewardFor(c);
                              setNote(`Great Trendy Food sales: ${c.trendyQuantity} items in 30 days`);
                            }}
                          >
                            <Award className="h-3.5 w-3.5" /> Reward
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!rewardFor} onOpenChange={(o) => !o && setRewardFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reward {rewardFor?.name}</DialogTitle>
            <DialogDescription>Reward points are added to the outlet&apos;s points budget and the cafe manager is notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input label="Reward points" type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
            <Input label="Reason" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRewardFor(null)}>
              Cancel
            </Button>
            <Button onClick={give} isLoading={saving} disabled={points < 1 || note.trim().length < 3}>
              Give reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
