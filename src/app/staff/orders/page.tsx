"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { OrderManagementView } from "@/components/orders/order-management-view";

export default function StaffOrdersPage() {
  return (
    <PortalLayout allowedRoles={["STAFF", "MANAGER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Kitchen & Barista Order Queue"
        description="Real-time order ticket processing, prep status transitions and customer completion."
        badge="Live Queue"
      />
      <OrderManagementView />
    </PortalLayout>
  );
}

