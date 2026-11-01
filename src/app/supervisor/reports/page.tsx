"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { ReportExplorer } from "@/components/reports/report-explorer";

export default function SupervisorReportsPage() {
  return (
    <PortalLayout allowedRoles={["SUPERVISOR", "SUPER_ADMIN"]}>
      <PageHeader
        title="Regional Performance Reports"
        description="Assigned cafe sales, visit hours consumption, staff activity, and CSV exports."
        badge="Supervisor Reports"
      />
      <ReportExplorer />
    </PortalLayout>
  );
}

