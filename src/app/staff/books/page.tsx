"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { BooksWorkspace } from "@/components/books/books-workspace";

export default function StaffBooksPage() {
  return (
    <PortalLayout allowedRoles={["STAFF"]}>
      <PageHeader title="Book Desk" description="Sell books to members by card and process returns." badge="Books" />
      <BooksWorkspace canManage={false} canSell={true} />
    </PortalLayout>
  );
}
