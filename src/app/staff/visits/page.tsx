"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime, formatMinutes } from "@/lib/utils";

export default function StaffVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisits = async () => {
    try {
      const res = await fetch("/api/visits");
      if (res.ok) {
        const json = await res.json();
        setVisits(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  return (
    <PortalLayout allowedRoles={["STAFF", "MANAGER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Cafe Visits Log"
        description="Live and past NFC/RFID card taps recorded at your counter."
        badge="Access Log"
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : visits.length === 0 ? (
            <EmptyState title="No visit sessions logged" description="Scanned card visits will show up here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Card UID</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((vis) => (
                  <TableRow key={vis._id}>
                    <TableCell className="text-xs font-semibold text-white">
                      <div>{vis.customer?.name}</div>
                      <div className="text-[10px] text-stone-500">{vis.customer?.mobile}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-400">
                      {vis.card?.uid || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {formatDateTime(vis.entryAt)}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {vis.exitAt ? formatDateTime(vis.exitAt) : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-stone-200">
                      {vis.status === "ACTIVE" ? (
                        <span className="text-amber-400 font-bold">In Progress</span>
                      ) : (
                        formatMinutes(vis.minutesConsumed)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={vis.status === "ACTIVE" ? "warning" : "secondary"}>
                        {vis.status}
                      </Badge>
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

