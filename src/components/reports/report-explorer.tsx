"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { FileBarChart, Download, Filter, Search, Calendar, RefreshCw } from "lucide-react";
import { formatDateTime, formatINR, formatPoints, formatMinutes } from "@/lib/utils";
import { toast } from "sonner";

export function ReportExplorer() {
  const [reportList, setReportList] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // Load available reports for current role
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setReportList(list);
          if (list.length > 0) setSelectedKey(list[0].key);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const runSelectedReport = async () => {
    if (!selectedKey) return;
    setReportLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: selectedKey,
          from: from || undefined,
          to: to || undefined,
          status: status || undefined,
          q: q || undefined,
          page,
          limit: 25,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setReportData(json.data);
      }
    } catch {
      toast.error("Failed to run report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (selectedKey) {
      setPage(1);
      runSelectedReport();
    }
  }, [selectedKey]);

  useEffect(() => {
    if (selectedKey) runSelectedReport();
  }, [page]);

  const handleExportCsv = async () => {
    if (!selectedKey) return;
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: selectedKey,
          from: from || undefined,
          to: to || undefined,
          status: status || undefined,
          q: q || undefined,
        }),
      });
      if (!res.ok) throw new Error("CSV generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedKey}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("CSV report exported successfully");
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    }
  };

  const currentDef = reportList.find((r) => r.key === selectedKey);

  const renderCell = (row: any, col: any) => {
    const val = col.key.split(".").reduce((o: any, k: string) => o?.[k], row);
    if (val === null || val === undefined) return "—";

    switch (col.type) {
      case "datetime":
        return formatDateTime(val);
      case "inr":
        return <span className="font-bold text-white">{formatINR(val)}</span>;
      case "points":
        return <span className="font-bold text-amber-400">{formatPoints(val)}</span>;
      case "minutes":
        return formatMinutes(val);
      case "status":
        return (
          <Badge
            variant={
              val === "ACTIVE" || val === "COMPLETED" || val === "SUCCESS"
                ? "success"
                : val === "CANCELLED" || val === "FAILED" || val === "REFUNDED"
                ? "destructive"
                : val === "PENDING" || val === "READY"
                ? "warning"
                : "secondary"
            }
            className="text-[10px]"
          >
            {val}
          </Badge>
        );
      default:
        return String(val);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Selector & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-300">Select Report:</label>
          <select
            value={selectedKey}
            onChange={(e) => {
              setSelectedKey(e.target.value);
              setStatus("");
            }}
            className="bg-stone-900 border border-stone-800 rounded-lg text-xs font-bold px-3 py-2 text-amber-400 focus:outline-none"
          >
            {reportList.map((r) => (
              <option key={r.key} value={r.key} className="bg-stone-900 text-stone-200">
                {r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={runSelectedReport} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Apply Filters</span>
          </Button>
          <Button size="sm" onClick={handleExportCsv} className="text-xs font-semibold gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
        <Input
          label="From Date"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="text-xs h-9"
        />
        <Input
          label="To Date"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="text-xs h-9"
        />
        {currentDef?.statuses?.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">Status Filter</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs text-stone-100"
            >
              <option value="">All Statuses</option>
              {currentDef.statuses.map((st: string) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}
        <Input
          label="Search Keyword"
          placeholder="e.g. name, order #, ref"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="text-xs h-9"
        />
      </div>

      {/* Summary KPI Badges */}
      {reportData?.summary && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(reportData.summary).map(([k, v]: [string, any]) => (
            <div key={k} className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800/80 text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">{k}</span>
              <strong className="text-white text-sm">{typeof v === "number" ? v.toLocaleString("en-IN") : v}</strong>
            </div>
          ))}
        </div>
      )}

      {/* Report Data Table */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {reportLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : !reportData?.rows || reportData.rows.length === 0 ? (
            <EmptyState
              title="No records found"
              description="No data returned for the selected filter parameters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {reportData.columns?.map((col: any) => (
                    <TableHead
                      key={col.key}
                      className={
                        col.type === "number" || col.type === "inr" || col.type === "points" || col.type === "minutes"
                          ? "text-right"
                          : ""
                      }
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.rows.map((row: any, i: number) => (
                  <TableRow key={row._id || i}>
                    {reportData.columns?.map((col: any) => (
                      <TableCell
                        key={col.key}
                        className={
                          col.type === "number" || col.type === "inr" || col.type === "points" || col.type === "minutes"
                            ? "text-right"
                            : ""
                        }
                      >
                        {renderCell(row, col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

