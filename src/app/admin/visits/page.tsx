"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime, formatMinutes } from "@/lib/utils";
import ManagerVisitsPage from "@/app/manager/visits/page";

export default function AdminVisitsPage() {
  return <ManagerVisitsPage />;
}

