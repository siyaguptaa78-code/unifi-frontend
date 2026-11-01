"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { OrderManagementView } from "@/components/orders/order-management-view";

export default function AdminOrdersPage() {
  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Universal Orders & Administrative Refunds"
        description="Platform-wide order oversight across all cafe locations with atomic refund capabilities."
        badge="Universal Orders"
      />
      <OrderManagementView allowRefund={true} />
    </PortalLayout>
  );
}

