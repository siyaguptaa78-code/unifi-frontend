"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Building2, CheckCircle2, AlertTriangle, Check, X } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminFranchisesPage() {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFranchises = async () => {
    try {
      const res = await fetch("/api/franchises");
      if (res.ok) {
        const json = await res.json();
        setFranchises(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFranchises();
  }, []);

  const handleUpdateStatus = async (franchiseId: string, status: string) => {
    try {
      const prev = franchises.find((f) => f._id === franchiseId);
      const res = await fetch(`/api/franchises/${franchiseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prev,
          package: prev.package?._id || prev.package,
          owner: prev.owner?._id || prev.owner,
          supervisor: prev.supervisor?._id || prev.supervisor,
          status,
        }),
      });
      if (res.ok) {
        toast.success(`Franchise moved to ${status}`);
        loadFranchises();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Franchise Operations & Licenses"
        description="Review incoming franchise applications, agreements, payment status, and assign supervisors."
        badge="Franchise Governance"
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
                  <TableHead>Franchise Name & Code</TableHead>
                  <TableHead>Package Tier</TableHead>
                  <TableHead>Owner / Applicant</TableHead>
                  <TableHead>Territory City</TableHead>
                  <TableHead className="text-right">Agreed Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>License Status</TableHead>
                  <TableHead className="text-right">Approval Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchises.map((f) => (
                  <TableRow key={f._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{f.name}</div>
                      <div className="font-mono text-[10px] text-amber-500">{f.code}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {f.package?.name}
                    </TableCell>
                    <TableCell className="text-xs text-stone-200">
                      <div>{f.owner?.name || f.applicantName}</div>
                      <div className="text-[10px] text-stone-500">{f.owner?.email || f.applicantEmail}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">{f.city}, {f.state}</TableCell>
                    <TableCell className="text-right font-bold text-xs text-white">
                      {formatINR(f.agreedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={f.paymentStatus === "PAID" ? "success" : "warning"}>
                        {f.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          f.status === "ACTIVE" || f.status === "APPROVED"
                            ? "success"
                            : f.status === "PENDING_APPROVAL"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      {f.status === "PENDING_APPROVAL" && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUpdateStatus(f._id, "APPROVED")}
                            className="h-7 px-2 text-[11px]"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(f._id, "REJECTED")}
                            className="h-7 px-2 text-[11px]"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {f.status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateStatus(f._id, "ACTIVE")}
                          className="h-7 px-2 text-[11px]"
                        >
                          Activate
                        </Button>
                      )}
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

