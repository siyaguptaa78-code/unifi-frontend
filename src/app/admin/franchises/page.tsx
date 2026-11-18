"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  Plus,
  Edit,
  Coins,
  MapPin,
  UserCheck,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminFranchisesPage() {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [packageId, setPackageId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [agreedAmount, setAgreedAmount] = useState(2500000);
  const [amountPaid, setAmountPaid] = useState(2500000);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PARTIAL" | "PAID">("PAID");
  const [status, setStatus] = useState<"PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "SUSPENDED">("ACTIVE");

  const loadData = async () => {
    try {
      const [fRes, pRes, uRes] = await Promise.all([
        fetch("/api/franchises"),
        fetch("/api/franchise-packages"),
        fetch("/api/staff"),
      ]);

      if (fRes.ok) {
        const fJson = await fRes.json();
        setFranchises(fJson.data || []);
      }
      if (pRes.ok) {
        const pJson = await pRes.json();
        setPackages(pJson.data || []);
        if (pJson.data?.length > 0 && !packageId) setPackageId(pJson.data[0]._id);
      }
      if (uRes.ok) {
        const uJson = await uRes.json();
        setUsers(uJson.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingFranchise(null);
    setName("");
    setCode("");
    if (packages.length > 0) setPackageId(packages[0]._id);
    setOwnerId("");
    setSupervisorId("");
    setCity("Bengaluru");
    setState("Karnataka");
    setAgreedAmount(2500000);
    setAmountPaid(2500000);
    setPaymentStatus("PAID");
    setStatus("ACTIVE");
    setModalOpen(true);
  };

  const openEdit = (f: any) => {
    setEditingFranchise(f);
    setName(f.name);
    setCode(f.code);
    setPackageId(f.package?._id || f.package || (packages[0]?._id ?? ""));
    setOwnerId(f.owner?._id || f.owner || "");
    setSupervisorId(f.supervisor?._id || f.supervisor || "");
    setCity(f.city || "Bengaluru");
    setState(f.state || "Karnataka");
    setAgreedAmount(f.agreedAmount || 2500000);
    setAmountPaid(f.amountPaid || 0);
    setPaymentStatus(f.paymentStatus || "PENDING");
    setStatus(f.status || "ACTIVE");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        code,
        package: packageId,
        owner: ownerId || null,
        supervisor: supervisorId || null,
        city,
        state,
        agreedAmount: Number(agreedAmount),
        amountPaid: Number(amountPaid),
        paymentStatus,
        status,
      };

      const url = editingFranchise ? `/api/franchises/${editingFranchise._id}` : "/api/franchises";
      const method = editingFranchise ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Operation failed");

      toast.success(editingFranchise ? `Franchise ${name} updated` : `Franchise ${name} created`);
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save franchise");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (franchiseId: string, nextStatus: string) => {
    try {
      const prev = franchises.find((f) => f._id === franchiseId);
      const res = await fetch(`/api/franchises/${franchiseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prev,
          package: prev.package?._id || prev.package,
          owner: prev.owner?._id || prev.owner,
          supervisor: prev.supervisor?._id || prev.supervisor,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        toast.success(`Franchise moved to ${nextStatus}`);
        loadData();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const owners = users.filter((u) => u.role === "FRANCHISE_OWNER");
  const supervisors = users.filter((u) => u.role === "SUPERVISOR");

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Franchise Operations & Partner Licenses"
        description="Review franchise agreements, licensing fees, territory assignments, and manage partner performance."
        badge="Franchise Governance"
        action={
          <Button size="sm" onClick={openCreate} className="text-xs h-9">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Franchise License
          </Button>
        }
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : franchises.length === 0 ? (
            <EmptyState title="No franchises registered" description="Create a new franchise partner license to expand your branch network." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchise Name & Code</TableHead>
                  <TableHead>Package Tier</TableHead>
                  <TableHead>Owner / Partner</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead className="text-right">Agreed Fee</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>License Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchises.map((f) => (
                  <TableRow key={f._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{f.name}</div>
                      <div className="font-mono text-[10px] text-amber-500">{f.code}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {f.package?.name || "Standard Tier"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-200">
                      {f.owner ? (
                        <div>
                          <div>{f.owner.name}</div>
                          <div className="text-[10px] text-stone-400">{f.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-stone-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        <span>{f.city}, {f.state}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-white">
                      {formatINR(f.agreedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={f.paymentStatus === "PAID" ? "success" : f.paymentStatus === "PARTIAL" ? "warning" : "destructive"}
                        className="text-[10px]"
                      >
                        {f.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={f.status === "ACTIVE" ? "success" : f.status === "PENDING_APPROVAL" ? "warning" : "secondary"}
                        className="text-[10px]"
                      >
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {f.status === "PENDING_APPROVAL" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(f._id, "ACTIVE")}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 h-8"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(f)}
                          className="text-xs text-stone-300 hover:text-white h-8"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Create / Edit Franchise */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFranchise ? `Configure Franchise: ${editingFranchise.name}` : "Create Franchise Partner License"}</DialogTitle>
            <DialogDescription>
              Assign territory, ownership, licensing package and track payment status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Franchise Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Unifi Cafe Whitefield Partner"
                  required
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Code</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FR-WHI-01"
                  required
                  className="mt-1 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Franchise Package Tier</label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                required
              >
                {packages.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({formatINR(p.amount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Franchise Owner</label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="">Unassigned</option>
                  {owners.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Supervising Officer</label>
                <select
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="">Unassigned</option>
                  {supervisors.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Territory City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required className="mt-1 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">State</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} required className="mt-1 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Agreed License Fee (₹)</label>
                <Input
                  type="number"
                  value={agreedAmount}
                  onChange={(e) => setAgreedAmount(Number(e.target.value))}
                  required
                  className="mt-1 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Fee Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="PAID">PAID (Full)</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">License Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Franchise
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
