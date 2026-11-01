"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { ReportExplorer } from "@/components/reports/report-explorer";

export default function FranchiseReportsPage() {
  return (
    <PortalLayout allowedRoles={["FRANCHISE_OWNER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Franchise Financial & Sales Reports"
        description="Outlets sales revenue, customer footfall, points redemption, and royalty statements."
        badge="Franchise Reports"
      />
      <ReportExplorer />
    </PortalLayout>
  );
}

