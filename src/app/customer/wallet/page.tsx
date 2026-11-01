"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Coins, ArrowDownLeft, ArrowUpRight, RotateCcw, Wallet } from "lucide-react";
import { formatPoints, formatDateTime } from "@/lib/utils";

export default function CustomerWalletPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/wallet");
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

  const summary = data?.summary;
  const ledger = data?.ledger || [];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wallet className="h-6 w-6 text-amber-500" />
              <span>Points Wallet & Ledger</span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Every single points credit, debit, and refund is recorded in an immutable ledger.
            </p>
          </div>

          {/* Wallet Summary KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Current Balance"
              value={formatPoints(summary?.pointsBalance)}
              subtitle="1 Point = ₹1. Spendable on all items."
              icon={Coins}
              highlight={true}
            />
            <StatCard
              title="Total Credited"
              value={formatPoints(summary?.totalPointsCredited)}
              subtitle="From membership recharges"
              icon={ArrowDownLeft}
            />
            <StatCard
              title="Total Spent"
              value={formatPoints(summary?.totalPointsSpent)}
              subtitle="Debited on food & coffee orders"
              icon={ArrowUpRight}
            />
            <StatCard
              title="Total Refunded"
              value={formatPoints(summary?.totalPointsRefunded)}
              subtitle="From cancelled / refunded orders"
              icon={RotateCcw}
            />
          </div>

          {/* Immutable Points Ledger */}
          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <span>Points Transaction Ledger</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ledger.length === 0 ? (
                <EmptyState
                  title="No ledger entries"
                  description="Transactions will appear here when you recharge points or place orders."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.map((entry: any) => {
                      const isCredit = entry.points > 0;
                      return (
                        <TableRow key={entry._id}>
                          <TableCell className="text-xs text-stone-400">
                            {formatDateTime(entry.createdAt)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-stone-300">
                            {entry.reference}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.type === "CREDIT"
                                  ? "success"
                                  : entry.type === "DEBIT"
                                  ? "destructive"
                                  : entry.type === "REFUND"
                                  ? "info"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-stone-400">
                            {entry.source}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold text-xs ${
                              isCredit ? "text-emerald-400" : "text-stone-300"
                            }`}
                          >
                            {isCredit ? `+${entry.points}` : entry.points}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs text-amber-400">
                            {formatPoints(entry.balanceAfter)}
                          </TableCell>
                          <TableCell className="text-xs text-stone-400 max-w-xs truncate">
                            {entry.description}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

