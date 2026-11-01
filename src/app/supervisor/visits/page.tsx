"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime, formatMinutes } from "@/lib/utils";

export default function SupervisorVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    }
    load();
  }, []);

  return (
    <PortalLayout allowedRoles={["SUPERVISOR", "SUPER_ADMIN"]}>
      <PageHeader
        title="Regional Customer Visits"
        description="Track smart card check-ins and session durations across assigned locations."
        badge="Access Activity"
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cafe</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead className="text-right">Hours Consumed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((vis) => (
                  <TableRow key={vis._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      {vis.cafe?.name}
                    </TableCell>
                    <TableCell className="text-xs text-stone-200">
                      <div>{vis.customer?.name}</div>
                      <div className="text-[10px] text-stone-500">{vis.customer?.mobile}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {formatDateTime(vis.entryAt)}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {vis.exitAt ? formatDateTime(vis.exitAt) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-stone-200">
                      {vis.status === "ACTIVE" ? (
                        <span className="text-amber-400">In Progress</span>
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

