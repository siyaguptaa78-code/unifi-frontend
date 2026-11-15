"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { BooksWorkspace } from "@/components/books/books-workspace";

export default function AdminBooksPage() {
  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader title="Cafe Books" description="Books stocked at each cafe. Customers buy with points and can return them for a partial refund." badge="Books" />
      <BooksWorkspace canManage={true} canSell={true} />
    </PortalLayout>
  );
}
