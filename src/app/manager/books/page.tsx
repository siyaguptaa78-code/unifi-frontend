"use client";

import React from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { BooksWorkspace } from "@/components/books/books-workspace";

export default function ManagerBooksPage() {
  return (
    <PortalLayout allowedRoles={["MANAGER"]}>
      <PageHeader title="Cafe Books" description="Manage your cafe book shelf, sell books to members and process returns." badge="Books" />
      <BooksWorkspace canManage={true} canSell={true} />
    </PortalLayout>
  );
}
