"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { OrderManagementView } from "@/components/orders/order-management-view";

export default function ManagerOrdersPage() {
  return (
    <PortalLayout allowedRoles={["MANAGER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Cafe Order Management"
        description="Live queue, preparation tracking, and customer ticket status."
        badge="Manager Control"
      />
      <OrderManagementView />
    </PortalLayout>
  );
}

