"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Gift, Copy, Share2 } from "lucide-react";
import { formatDate, formatPoints } from "@/lib/utils";
import { toast } from "sonner";

export default function ReferPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/referrals")
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, []);

  const link = data?.code && typeof window !== "undefined" ? `${window.location.origin}/register?ref=${data.code}` : "";

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const share = async () => {
    const text = `Join me on UniCafe! Use my code ${data.code} and get ${data.refereePoints} bonus points on your first recharge.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "UniCafe", text, url: link });
      } catch {
        // user cancelled
      }
    } else {
      copy(`${text} ${link}`, "Invite message");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />
      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-amber-500" /> Refer & Earn
          </h1>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : !data?.enabled ? (
            <Card className="border-stone-800 bg-stone-900/60 p-8 text-center text-sm text-stone-400">
              The Refer & Earn programme is not running right now. Check back soon!
            </Card>
          ) : (
            <>
              <Card className="border-amber-500/40 bg-gradient-to-br from-stone-900 to-amber-950/30 p-6 space-y-4">
                <p className="text-sm text-stone-200">
                  Invite friends to UniCafe. When a friend joins with your code and completes their first recharge, you get{" "}
                  <strong className="text-amber-400">{formatPoints(data.referrerPoints)}</strong> and they get{" "}
                  <strong className="text-amber-400">{formatPoints(data.refereePoints)}</strong>.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="rounded-xl border border-stone-700 bg-stone-950 px-5 py-3 font-mono text-2xl font-extrabold tracking-widest text-white text-center">
                    {data.code}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copy(data.code, "Code")} className="gap-1.5">
                      <Copy className="h-4 w-4" /> Copy code
                    </Button>
                    <Button onClick={share} className="gap-1.5">
                      <Share2 className="h-4 w-4" /> Share invite
                    </Button>
                  </div>
                </div>
                {link && (
                  <button onClick={() => copy(link, "Link")} className="text-xs text-stone-400 underline break-all text-left cursor-pointer">
                    {link}
                  </button>
                )}
              </Card>

              <Card className="border-stone-800 bg-stone-900/60">
                <CardContent className="p-0">
                  {data.friends.length === 0 ? (
                    <EmptyState title="No referrals yet" description="Friends who join with your code will show up here." />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Friend</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Reward</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.friends.map((f: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-semibold text-white">{f.name}</TableCell>
                            <TableCell className="text-xs text-stone-400">{formatDate(f.joinedAt)}</TableCell>
                            <TableCell>
                              {f.rewarded ? (
                                <Badge variant="success">+{formatPoints(data.referrerPoints)} earned</Badge>
                              ) : (
                                <Badge variant="secondary">Waiting for first recharge</Badge>
                              )}
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
        </div>
      </main>
    </div>
  );
}
