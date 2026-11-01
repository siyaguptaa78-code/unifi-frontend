"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { OrderManagementView } from "@/components/orders/order-management-view";

export default function SupervisorOrdersPage() {
  return (
    <PortalLayout allowedRoles={["SUPERVISOR", "SUPER_ADMIN"]}>
      <PageHeader
        title="Regional Store Orders"
        description="Monitor live preparation status across your assigned cafe stores."
        badge="Supervisor View"
      />
      <OrderManagementView />
    </PortalLayout>
  );
}

