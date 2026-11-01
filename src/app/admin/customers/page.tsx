"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Search, QrCode } from "lucide-react";
import { formatPoints, formatMinutes, formatDateTime } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch(`/api/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [q]);

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Customer Directory & Balances"
        description="Comprehensive list of registered UniCafe members, RFID cards, points and hours balances."
        badge="Customer CRM"
        action={
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
            <Input
              placeholder="Search by name, email, mobile..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        }
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState title="No customers found" description="Try a different search query." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Card UID</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Remaining Hours</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{c.name}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-500">
                      {c.profile?.customerCode || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      <div>{c.email}</div>
                      <div>{c.mobile}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-stone-300">
                      {c.card?.uid ? (
                        <span className="flex items-center gap-1.5">
                          <QrCode className="h-3 w-3 text-amber-500" />
                          <span>{c.card.uid}</span>
                        </span>
                      ) : (
                        "No card assigned"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-amber-400">
                      {formatPoints(c.membership?.pointsBalance)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs text-stone-200">
                      {formatMinutes(c.membership?.remainingMinutes)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.membership?.status === "ACTIVE" ? "success" : "secondary"}>
                        {c.membership?.status || "INACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {formatDateTime(c.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}

