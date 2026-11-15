"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { BooksWorkspace } from "@/components/books/books-workspace";

export default function FranchiseBooksPage() {
  return (
    <PortalLayout allowedRoles={["FRANCHISE_OWNER"]}>
      <PageHeader title="Cafe Books" description="Book shelves across your franchise outlets." badge="Books" />
      <BooksWorkspace canManage={true} canSell={false} />
    </PortalLayout>
  );
}
