"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { ReportExplorer } from "@/components/reports/report-explorer";

export default function ManagerReportsPage() {
  return (
    <PortalLayout allowedRoles={["MANAGER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Store Sales & Daily Reports"
        description="Filter cafe orders, points revenue, customer visits, and export CSV audit logs."
        badge="Daily Reports"
      />
      <ReportExplorer />
    </PortalLayout>
  );
}

