"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, ArrowLeft, Coffee } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type Invoice = {
  number: string;
  title: string;
  issuedAt: string;
  status: string;
  currency: "INR" | "POINTS";
  seller: { name: string; address?: string; phone?: string; email?: string };
  billTo: { name: string; email?: string; mobile?: string; customerCode?: string };
  lines: { description: string; quantity: number; rate: number; amount: number }[];
  subtotal: number;
  total: number;
  paymentMode: string;
  notes: string[];
};

function money(n: number, currency: Invoice["currency"]) {
  const v = Math.abs(n).toLocaleString("en-IN");
  const sign = n < 0 ? "− " : "";
  return currency === "INR" ? `${sign}₹${v}` : `${sign}${v} pts`;
}

export default function InvoicePage() {
  const params = useParams<{ kind: string; id: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${params.kind}/${params.id}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message || "Invoice not found");
        setInv(j.data);
        document.title = `${j.data.number} — UniCafe Invoice`;
      })
      .catch((e) => setError(e.message));
  }, [params.kind, params.id]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-sm text-stone-300">
        <p>{error}</p>
        <button onClick={() => router.back()} className="text-amber-400 underline cursor-pointer">
          Go back
        </button>
      </div>
    );
  }
  if (!inv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-200 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto max-w-3xl px-4 mb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-stone-700 hover:text-stone-950 cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 cursor-pointer"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      <div className="invoice-sheet mx-auto max-w-3xl bg-white text-stone-900 shadow-xl print:shadow-none rounded-lg print:rounded-none p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-stone-950">
                <Coffee className="h-4 w-4" />
              </span>
              UniCafe
            </div>
            <div className="mt-3 text-sm font-semibold">{inv.seller.name}</div>
            {inv.seller.address && <div className="text-xs text-stone-600 max-w-xs">{inv.seller.address}</div>}
            {inv.seller.phone && <div className="text-xs text-stone-600">{inv.seller.phone}</div>}
            {inv.seller.email && <div className="text-xs text-stone-600">{inv.seller.email}</div>}
          </div>
          <div className="sm:text-right">
            <div className="text-2xl font-bold uppercase tracking-wide text-stone-800">Invoice</div>
            <div className="text-xs text-stone-500 mt-1">{inv.title}</div>
            <div className="mt-3 text-xs">
              <div>
                <span className="text-stone-500">Invoice #:</span> <span className="font-mono font-semibold">{inv.number}</span>
              </div>
              <div>
                <span className="text-stone-500">Date:</span> {new Date(inv.issuedAt).toLocaleString("en-IN")}
              </div>
              <div>
                <span className="text-stone-500">Status:</span> <span className="font-semibold">{inv.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 text-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Bill To</div>
          <div className="font-semibold">{inv.billTo.name}</div>
          {inv.billTo.customerCode && <div className="text-xs text-stone-600">Customer ID: {inv.billTo.customerCode}</div>}
          {inv.billTo.mobile && <div className="text-xs text-stone-600">{inv.billTo.mobile}</div>}
          {inv.billTo.email && <div className="text-xs text-stone-600">{inv.billTo.email}</div>}
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-y border-stone-300 bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-600">
              <th className="py-2 px-2 w-12">S.No</th>
              <th className="py-2 px-2">Description</th>
              <th className="py-2 px-2 text-right">Qty</th>
              <th className="py-2 px-2 text-right">Rate</th>
              <th className="py-2 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((l, i) => (
              <tr key={i} className="border-b border-stone-200">
                <td className="py-2 px-2 text-stone-500">{i + 1}</td>
                <td className="py-2 px-2">{l.description}</td>
                <td className="py-2 px-2 text-right">{l.quantity}</td>
                <td className="py-2 px-2 text-right">{money(l.rate, inv.currency)}</td>
                <td className="py-2 px-2 text-right font-medium">{money(l.amount, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span>{money(inv.subtotal, inv.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-300 pt-2 text-base font-bold">
              <span>Total</span>
              <span>{money(inv.total, inv.currency)}</span>
            </div>
            <div className="text-xs text-stone-500 pt-1">Paid by: {inv.paymentMode}</div>
          </div>
        </div>

        {inv.notes.length > 0 && (
          <div className="mt-8 border-t border-stone-200 pt-4 text-xs text-stone-600 space-y-1">
            {inv.notes.map((n, i) => (
              <p key={i}>• {n}</p>
            ))}
          </div>
        )}
        <p className="mt-8 text-center text-[11px] text-stone-400">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
}
