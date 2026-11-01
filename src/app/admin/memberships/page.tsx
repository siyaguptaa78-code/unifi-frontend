"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import AdminCustomersPage from "@/app/admin/customers/page";

export default function AdminMembershipsPage() {
  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Membership Accounts"
        description="Monitor active customer memberships, remaining minutes and points balances."
        badge="Memberships"
      />
      <AdminCustomersPage />
    </PortalLayout>
  );
}

