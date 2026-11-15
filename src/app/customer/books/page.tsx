"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { BookOpen, FileText } from "lucide-react";
import { formatDate, formatPoints } from "@/lib/utils";

export default function CustomerBooksPage() {
  const [data, setData] = useState<{ policy: number[]; sales: any[] } | null>(null);
  const [shelf, setShelf] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/books/sales").then((r) => r.json()), fetch("/api/books").then((r) => r.json())])
      .then(([sales, books]) => {
        setData(sales.data);
        setShelf((books.data || []).filter((b: any) => b.stock > 0));
      })
      .finally(() => setLoading(false));
  }, []);

  const policy = data?.policy ?? [];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />
      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-500" /> My Books
            </h1>
            <p className="text-xs text-stone-400 mt-1">Buy books at any UniCafe counter with your points, and return them for a partial refund.</p>
          </div>

          {policy.length > 0 && (
            <Card className="border-stone-800 bg-stone-900/60 p-4 text-xs text-stone-300">
              <div className="font-bold text-white mb-2">Return policy</div>
              <div className="flex flex-wrap gap-2">
                {policy.map((pct, i) => (
                  <span key={i} className="rounded-lg border border-stone-800 bg-stone-950 px-2.5 py-1">
                    Month {i + 1}: <strong className="text-emerald-400">{100 - pct}% back</strong>
                  </span>
                ))}
                <span className="rounded-lg border border-stone-800 bg-stone-950 px-2.5 py-1">
                  After month {policy.length}: <strong className="text-amber-400">book is yours (no return)</strong>
                </span>
              </div>
            </Card>
          )}

          <Card className="border-stone-800 bg-stone-900/60">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : !data?.sales.length ? (
                <EmptyState title="No books yet" description="Books you buy at a cafe will appear here with their current return value." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Cafe</TableHead>
                      <TableHead>Bought</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Return value today</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.sales.map((s) => (
                      <TableRow key={s._id}>
                        <TableCell className="text-xs">
                          <div className="font-semibold text-white">{s.title}</div>
                          <div className="text-[10px] text-stone-500">{s.author}</div>
                        </TableCell>
                        <TableCell className="text-xs text-stone-300">{s.cafe?.name}</TableCell>
                        <TableCell className="text-xs text-stone-400">{formatDate(s.soldAt)}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-amber-400">{formatPoints(s.pricePoints)}</TableCell>
                        <TableCell className="text-xs">
                          {s.status === "RETURNED" ? (
                            <Badge variant="secondary">Returned · {formatPoints(s.refundPoints)} refunded</Badge>
                          ) : s.quote?.returnable ? (
                            <span className="text-emerald-400 font-semibold">
                              {formatPoints(s.quote.refundPoints)} <span className="text-stone-500 font-normal">(month {s.quote.month})</span>
                            </span>
                          ) : (
                            <Badge variant="outline">Yours to keep</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/invoice/book/${s._id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                              <FileText className="h-3 w-3" /> Invoice
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {shelf.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white">Available at our cafes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shelf.slice(0, 12).map((b) => (
                  <Card key={b._id} className="border-stone-800 bg-stone-900/60 p-4 text-xs">
                    <div className="font-semibold text-white">{b.title}</div>
                    <div className="text-stone-500">{b.author}</div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-stone-400">{b.cafe?.name}</span>
                      <span className="font-bold text-amber-400">{formatPoints(b.pricePoints)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
