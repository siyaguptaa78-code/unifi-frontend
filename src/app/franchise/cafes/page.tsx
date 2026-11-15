"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { CafeDetailsDialog } from "@/components/cafes/cafe-details-dialog";

export default function FranchiseCafesPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCafeId, setViewCafeId] = useState<string | null>(null);

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
    <PortalLayout allowedRoles={["FRANCHISE_OWNER", "SUPER_ADMIN"]}>
      <PageHeader
        title="My Franchise Outlets"
        description="Operating locations assigned to your franchise license."
        badge="Outlets"
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
                  <TableHead>Outlet Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Assigned Manager</TableHead>
                  <TableHead>Opening Hours</TableHead>
                  <TableHead>Seating Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cafes.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{c.name}</div>
                      <div className="font-mono text-[10px] text-amber-500">{c.code}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
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
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewCafeId(c._id)}
                        className="h-8 w-8 p-0"
                        title="View cafe details"
                        aria-label={`View details of ${c.name}`}
                      >
                        <Eye className="h-4 w-4 text-amber-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CafeDetailsDialog cafeId={viewCafeId} onClose={() => setViewCafeId(null)} />
    </PortalLayout>
  );
}

