"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Package, Plus } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function AdminFranchisePackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/franchise-packages");
        if (res.ok) {
          const json = await res.json();
          setPackages(json.data || []);
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
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Franchise Investment Packages"
        description="Configure franchise tiers, floor size requirements, equipment packages and royalty terms."
        badge="Packages"
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
                  <TableHead>Package Tier</TableHead>
                  <TableHead className="text-right">Investment Amount</TableHead>
                  <TableHead>Cafe Floor Size</TableHead>
                  <TableHead>Equipment & Hardware Inclusions</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      {pkg.name}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-amber-400">
                      {formatINR(pkg.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {pkg.cafeSize}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400 max-w-sm">
                      {pkg.equipmentInclusions?.join(", ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.status === "ACTIVE" ? "success" : "secondary"}>
                        {pkg.status}
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

