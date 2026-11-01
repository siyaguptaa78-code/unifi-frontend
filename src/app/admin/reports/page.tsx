"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { ReportExplorer } from "@/components/reports/report-explorer";

export default function AdminReportsPage() {
  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Central Executive Reports & Exports"
        description="All 13 system-wide financial, membership, payment, order, refund, and franchise reports."
        badge="13 Working Reports"
      />
      <ReportExplorer />
    </PortalLayout>
  );
}

