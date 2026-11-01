"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { ReportExplorer } from "@/components/reports/report-explorer";

export default function AdminPointsLedgerPage() {
  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Immutable Points Ledger"
        description="Every single credit, debit, and refund entry in the central points ledger."
        badge="Financial Audit"
      />
      <ReportExplorer />
    </PortalLayout>
  );
}

