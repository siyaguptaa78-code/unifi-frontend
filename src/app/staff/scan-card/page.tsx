"use client";

import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ScanLine,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Coffee,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatMinutes, formatPoints, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";

export default function StaffScanCardPage() {
  const { user } = useAuth();
  const [cafes, setCafes] = useState<any[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState("");
  const [cardUid, setCardUid] = useState("");
  const [scanMode, setScanMode] = useState<"AUTO" | "ENTRY" | "EXIT">("AUTO");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  // OTP step: after a tap the customer receives a code that staff must enter.
  const [otpRequest, setOtpRequest] = useState<any>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Load cafes
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cafes");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setCafes(list);
          if (list.length > 0) setSelectedCafeId(list[0]._id);
        }
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cardUid.trim()) {
      toast.error("Please enter or select a card UID");
      return;
    }
    if (!selectedCafeId) {
      toast.error("Please select a cafe location");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setScanError(null);
    setOtpRequest(null);
    setOtpCode("");

    try {
      const res = await fetch("/api/visits/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: cardUid.trim(),
          cafeId: selectedCafeId,
          mode: scanMode,
          deviceId: "HARDWARE_SIMULATOR_TERMINAL_01",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Scan failed");
      }
      if (json.data.otpRequired) {
        setOtpRequest({ ...json.data, uid: cardUid.trim(), mode: scanMode });
        toast.info(json.data.message || "OTP sent to customer");
      } else {
        setScanResult(json.data);
        toast.success(json.data.message || "Card scanned successfully");
      }
    } catch (err: any) {
      setScanError(err.message || "Card tap rejected");
      toast.error(err.message || "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpRequest) return;
    setVerifying(true);
    setScanError(null);
    try {
      const res = await fetch("/api/visits/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: otpRequest.uid,
          cafeId: otpRequest.cafe.id,
          mode: otpRequest.mode,
          otpRequestId: otpRequest.otpRequestId,
          otp: otpCode.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Verification failed");
      setScanResult(json.data);
      setOtpRequest(null);
      setOtpCode("");
      toast.success(json.data.message || "Verified");
    } catch (err: any) {
      setScanError(err.message || "Verification failed");
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const demoUids = [
    { label: "Active Member (Aakash)", uid: "E20000190601", desc: "142h remaining • 4,800 pts" },
    { label: "Fresh Member (Rhea)", uid: "E20000190602", desc: "150h remaining • 5,000 pts" },
    { label: "Low Hours (Sneha)", uid: "E20000190604", desc: "24h remaining • 1,200 pts" },
    { label: "Exhausted 0h (Manish)", uid: "E20000190607", desc: "0h remaining (Cannot enter, but can exit)" },
    { label: "Inactive Member (Meera)", uid: "E20000190612", desc: "0h remaining • Inactive card" },
  ];

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN", "MANAGER", "STAFF"]}>
      <PageHeader
        title="NFC / RFID Card Scanner Interface"
        description="Simulated and physical card interface for contactless check-in and check-out."
        badge="Hardware Adapter"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scanner Terminal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-stone-800 bg-stone-900/70 p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <ScanLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smart Tap Terminal</h3>
                  <span className="text-[11px] text-stone-400">Adapter: Optical / NFC ISO14443A</span>
                </div>
              </div>

              {/* Staff work at their assigned cafe; a selector only appears for multi-cafe accounts. */}
              {cafes.length > 1 && (
                <select
                  value={selectedCafeId}
                  onChange={(e) => setSelectedCafeId(e.target.value)}
                  aria-label="Cafe"
                  className="bg-stone-950 border border-stone-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-white"
                >
                  {cafes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mode selector */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Scan Operation Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setScanMode("AUTO")}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    scanMode === "AUTO"
                      ? "bg-amber-600 text-stone-950 border-amber-500 font-bold"
                      : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                  }`}
                >
                  Auto Detect (Smart Tap)
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("ENTRY")}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    scanMode === "ENTRY"
                      ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                      : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                  }`}
                >
                  Force Entry Check-In
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("EXIT")}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    scanMode === "EXIT"
                      ? "bg-red-600 text-white border-red-500 font-bold"
                      : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                  }`}
                >
                  Force Exit Check-Out
                </button>
              </div>
            </div>

            {/* Tap Input Form */}
            <form onSubmit={handleScan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-300">
                  Card UID (Hexadecimal RFID/NFC Serial)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. E20000190601"
                    value={cardUid}
                    onChange={(e) => setCardUid(e.target.value.toUpperCase())}
                    className="font-mono text-base tracking-wider h-11"
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isScanning}
                    className="font-bold gap-2 shrink-0 px-6"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Tap Card</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* OTP confirmation step */}
            {otpRequest && (
              <form onSubmit={handleVerifyOtp} className="p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-white">
                    Confirm {otpRequest.action === "ENTRY" ? "check-in" : "check-out"} for {otpRequest.customer?.name}
                  </div>
                  <Badge variant="warning">OTP SENT</Badge>
                </div>
                <p className="text-xs text-stone-300">
                  A 6-digit code was sent to the customer{otpRequest.customer?.mobileMasked ? ` (${otpRequest.customer.mobileMasked})` : ""} and is shown in
                  their UniCafe app. Ask them for it. Valid for 5 minutes.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    autoFocus
                    className="font-mono text-lg tracking-[0.4em] h-11"
                  />
                  <Button type="submit" size="lg" isLoading={verifying} disabled={otpCode.length !== 6} className="font-bold shrink-0">
                    Verify
                  </Button>
                </div>
                <button type="button" onClick={() => handleScan()} className="text-[11px] text-amber-400 underline cursor-pointer">
                  Resend code
                </button>
              </form>
            )}

            {/* Scan Outcome Feedback */}
            {scanResult && (
              <div
                className={`p-5 rounded-2xl border ${
                  scanResult.action === "ENTRY"
                    ? "border-emerald-500/40 bg-emerald-950/20"
                    : "border-blue-500/40 bg-blue-950/20"
                } space-y-3 animate-in fade-in duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-5 w-5 ${scanResult.action === "ENTRY" ? "text-emerald-400" : "text-blue-400"}`} />
                    <span className="font-bold text-sm text-white">{scanResult.message}</span>
                  </div>
                  <Badge variant={scanResult.action === "ENTRY" ? "success" : "info"}>
                    {scanResult.action} SUCCESS
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-stone-800/80">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Customer</span>
                    <strong className="text-white">{scanResult.customer?.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Mobile</span>
                    <strong className="text-stone-300">{scanResult.customer?.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Remaining Hours</span>
                    <strong className="text-amber-400">{formatMinutes(scanResult.customer?.remainingMinutes)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Wallet Points</span>
                    <strong className="text-amber-400">{formatPoints(scanResult.customer?.pointsBalance)}</strong>
                  </div>
                </div>

                {scanResult.action === "EXIT" && (
                  <div className="text-[11px] text-stone-300 bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                    ⏱️ Session duration: <strong>{scanResult.elapsedMinutes} mins</strong>.
                    Deducted from membership hours balance.
                  </div>
                )}
              </div>
            )}

            {scanError && (
              <div className="p-5 rounded-2xl border border-red-500/40 bg-red-950/20 space-y-2 text-xs text-red-300">
                <div className="flex items-center gap-2 font-bold text-sm text-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span>Access Denied / Verification Failed</span>
                </div>
                <p>{scanError}</p>
              </div>
            )}
          </Card>
        </div>

        {/* 1-Click Test Seed Cards */}
        <div className="space-y-4">
          <Card className="border-stone-800 bg-stone-900/60 p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Quick Test Seed Cards</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Click any customer card below to instantly test check-in, check-out, and edge cases.
            </p>

            <div className="space-y-2 pt-2">
              {demoUids.map((demo) => (
                <button
                  key={demo.uid}
                  type="button"
                  onClick={() => {
                    setCardUid(demo.uid);
                    setScanResult(null);
                    setScanError(null);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-stone-800 bg-stone-950/80 hover:bg-stone-800/60 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-stone-200 group-hover:text-amber-400">
                      {demo.label}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded">
                      {demo.uid}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">{demo.desc}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

