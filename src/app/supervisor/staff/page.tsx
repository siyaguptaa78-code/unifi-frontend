"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

export default function SupervisorStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/staff");
        if (res.ok) {
          const json = await res.json();
          setStaff(json.data || []);
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
        title="Regional Store Staff & Managers"
        description="Overview of assigned store managers, baristas and employee status."
        badge="Staff Directory"
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
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Role / Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Assigned Cafes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-stone-500">{s.email}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {s.staff?.designation || s.role}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-500">
                      {s.staff?.employeeCode || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {s.staff?.cafes?.map((c: any) => c.name).join(", ") || "Central"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "ACTIVE" ? "success" : "secondary"}>
                        {s.status}
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

