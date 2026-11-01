"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, Receipt, Coins, CheckCircle2 } from "lucide-react";
import { formatINR, formatDateTime, formatPoints } from "@/lib/utils";

export default function CustomerTransactionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/transactions");
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

  const payments = data?.payments || [];
  const transactions = data?.transactions || [];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Receipt className="h-6 w-6 text-amber-500" />
              <span>Payments & Recharge Statements</span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Official payment receipts and membership activation records.
            </p>
          </div>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" />
                <span>Payment Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <EmptyState
                  title="No payments made yet"
                  description="When you recharge your membership pass, payment receipts will be archived here."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Gateway / Mode</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p: any) => (
                      <TableRow key={p._id}>
                        <TableCell className="text-xs text-stone-400">
                          {formatDateTime(p.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-stone-200">
                          {p.receipt}
                        </TableCell>
                        <TableCell className="text-xs text-stone-300">
                          {p.purpose === "MEMBERSHIP_PURCHASE" ? "Initial Purchase" : "Membership Recharge"}
                        </TableCell>
                        <TableCell className="text-xs text-stone-400">
                          <span className="inline-flex items-center gap-1">
                            {p.provider} {p.isDemo && <Badge variant="secondary" className="text-[9px]">DEMO</Badge>}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-white">
                          {formatINR(p.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "SUCCESS"
                                ? "success"
                                : p.status === "FAILED"
                                ? "destructive"
                                : p.status === "REFUNDED"
                                ? "info"
                                : "warning"
                            }
                            className="text-[10px]"
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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

