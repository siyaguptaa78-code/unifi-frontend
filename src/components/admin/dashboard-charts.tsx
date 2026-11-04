"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { formatINR } from "@/lib/utils";

const tooltipStyle = { backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: 8, fontSize: 12 };

export function MonthlyRevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
        <XAxis dataKey="month" stroke="#78716c" fontSize={11} tickLine={false} />
        <YAxis stroke="#78716c" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatINR(v), "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrderTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
        <XAxis dataKey="date" stroke="#78716c" fontSize={10} tickLine={false} tickFormatter={(d) => d.slice(5)} />
        <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, "Orders Placed"]} />
        <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
