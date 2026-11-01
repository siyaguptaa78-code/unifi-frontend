"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { OrderManagementView } from "@/components/orders/order-management-view";

export default function FranchiseOrdersPage() {
  return (
    <PortalLayout allowedRoles={["FRANCHISE_OWNER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Franchise Sales & Orders"
        description="Monitor real-time ticket progression and customer sales across franchise outlets."
        badge="Franchise Orders"
      />
      <OrderManagementView />
    </PortalLayout>
  );
}

