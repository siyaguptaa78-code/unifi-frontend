"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Store, MapPin, Phone, Users } from "lucide-react";

export default function SupervisorCafesPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cafes");
        if (res.ok) {
          const json = await res.json();
          setCafes(json.data || []);
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
        title="Assigned Regional Cafes"
        description="Locations under your operational jurisdiction and audit responsibility."
        badge="Store Network"
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
                  <TableHead>Cafe Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Store Manager</TableHead>
                  <TableHead>Operating Hours</TableHead>
                  <TableHead>Seating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cafes.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{c.name}</div>
                      <div className="font-mono text-[10px] text-amber-500">{c.code}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300 max-w-xs">
                      {c.address.line1}, {c.address.city}
                    </TableCell>
                    <TableCell className="text-xs text-stone-200">
                      <div>{c.manager?.name || "Unassigned"}</div>
                      <div className="text-[10px] text-stone-500">{c.manager?.mobile}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">{c.openingHours}</TableCell>
                    <TableCell className="text-xs text-stone-300">{c.seatingCapacity} seats</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>
                        {c.status}
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

