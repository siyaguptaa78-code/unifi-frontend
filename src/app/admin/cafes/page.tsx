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
  Store,
  Plus,
  MapPin,
  Edit,
  Trash2,
  Clock,
  Phone,
  UserCheck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { BranchControlsDialog } from "@/components/admin/branch-controls-dialog";
import { formatPoints } from "@/lib/utils";

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [pointsSummary, setPointsSummary] = useState<Record<string, any>>({});
  const [controlsFor, setControlsFor] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCafe, setEditingCafe] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("560038");
  const [phone, setPhone] = useState("+91 80 4123 4567");
  const [openingHours, setOpeningHours] = useState("08:00 - 23:00");
  const [seatingCapacity, setSeatingCapacity] = useState(45);
  const [ownershipType, setOwnershipType] = useState<"COMPANY" | "FRANCHISE">("COMPANY");
  const [franchiseId, setFranchiseId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [acceptsPreOrders, setAcceptsPreOrders] = useState(true);
  const [estimatedPrepMinutes, setEstimatedPrepMinutes] = useState(15);
  const [status, setStatus] = useState<"ACTIVE" | "MAINTENANCE" | "INACTIVE">("ACTIVE");

  const loadData = async () => {
    try {
      const [cRes, uRes, fRes, pRes] = await Promise.all([
        fetch("/api/cafes"),
        fetch("/api/staff"),
        fetch("/api/franchises"),
        fetch("/api/cafes/points-summary"),
      ]);
      if (pRes.ok) {
        const rows = (await pRes.json()).data || [];
        const map: Record<string, any> = {};
        for (const r of rows) map[r._id] = r;
        setPointsSummary(map);
        setControlsFor((cur: any) => (cur ? map[cur._id] ?? null : null));
      }

      if (cRes.ok) {
        const cJson = await cRes.json();
        setCafes(cJson.data || []);
      }
      if (uRes.ok) {
        const uJson = await uRes.json();
        setUsers(uJson.data || []);
      }
      if (fRes.ok) {
        const fJson = await fRes.json();
        setFranchises(fJson.data || []);
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
    setEditingCafe(null);
    setName("");
    setCode("");
    setLine1("");
    setCity("Bengaluru");
    setState("Karnataka");
    setPincode("560038");
    setPhone("+91 80 4123 4567");
    setOpeningHours("08:00 - 23:00");
    setSeatingCapacity(45);
    setOwnershipType("COMPANY");
    setFranchiseId("");
    setSupervisorId("");
    setManagerId("");
    setAcceptsPreOrders(true);
    setEstimatedPrepMinutes(15);
    setStatus("ACTIVE");
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingCafe(c);
    setName(c.name);
    setCode(c.code);
    setLine1(c.address?.line1 || "");
    setCity(c.address?.city || "");
    setState(c.address?.state || "");
    setPincode(c.address?.pincode || "");
    setPhone(c.phone || "+91 80 4123 4567");
    setOpeningHours(c.openingHours || "08:00 - 23:00");
    setSeatingCapacity(c.seatingCapacity || 40);
    setOwnershipType(c.ownershipType || "COMPANY");
    setFranchiseId(c.franchise?._id || c.franchise || "");
    setSupervisorId(c.supervisor?._id || c.supervisor || "");
    setManagerId(c.manager?._id || c.manager || "");
    setAcceptsPreOrders(c.acceptsPreOrders ?? true);
    setEstimatedPrepMinutes(c.estimatedPrepMinutes || 15);
    setStatus(c.status || "ACTIVE");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        code,
        address: { line1, city, state, pincode },
        phone,
        openingHours,
        seatingCapacity: Number(seatingCapacity),
        ownershipType,
        franchise: ownershipType === "FRANCHISE" && franchiseId ? franchiseId : null,
        supervisor: supervisorId || null,
        manager: managerId || null,
        acceptsPreOrders,
        estimatedPrepMinutes: Number(estimatedPrepMinutes),
        status,
      };

      const url = editingCafe ? `/api/cafes/${editingCafe._id}` : "/api/cafes";
      const method = editingCafe ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to save cafe");

      toast.success(editingCafe ? `Branch ${name} updated successfully` : `Branch ${name} created successfully`);
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePreOrders = async (cafe: any) => {
    const nextVal = !cafe.acceptsPreOrders;
    try {
      const res = await fetch(`/api/cafes/${cafe._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cafe,
          franchise: cafe.franchise?._id || cafe.franchise || null,
          supervisor: cafe.supervisor?._id || cafe.supervisor || null,
          manager: cafe.manager?._id || cafe.manager || null,
          acceptsPreOrders: nextVal,
        }),
      });
      if (res.ok) {
        toast.success(`Online Pre-Orders ${nextVal ? "ENABLED" : "DISABLED"} for ${cafe.name}`);
        loadData();
      }
    } catch {
      toast.error("Failed to update pre-order acceptance");
    }
  };

  const supervisors = users.filter((u) => u.role === "SUPERVISOR");
  const managers = users.filter((u) => u.role === "MANAGER");

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Cafe Locations & Branch Governance"
        description="Comprehensive configuration of Unifi Cafe branches: operating hours, pre-order acceptance, kitchen prep estimates, supervisor/manager assignments and licensing."
        badge="Branch Network"
        action={
          <Button size="sm" onClick={openCreate} className="text-xs h-9">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Cafe Branch
          </Button>
        }
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : cafes.length === 0 ? (
            <EmptyState title="No cafe branches configured" description="Add your first branch location to start operations." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name & Code</TableHead>
                  <TableHead>City & Territory</TableHead>
                  <TableHead>Hours & Phone</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Online Pre-Orders</TableHead>
                  <TableHead>Kitchen Prep</TableHead>
                  <TableHead>Branch Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cafes.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{c.name}</div>
                      <div className="font-mono text-[10px] text-amber-500">{c.code}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        <span>{c.address?.city}, {c.address?.state}</span>
                      </div>
                      <div className="text-[10px] text-stone-400">{c.address?.line1}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>{c.openingHours}</span>
                      </div>
                      <div className="text-[10px] text-stone-400">{c.phone || "+91 80 4123 4567"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.ownershipType === "COMPANY" ? "secondary" : "outline"} className="text-[10px]">
                        {c.ownershipType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePreOrders(c)}
                        className="cursor-pointer"
                        title="Click to toggle pre-order acceptance"
                      >
                        <Badge
                          variant={c.acceptsPreOrders !== false ? "success" : "destructive"}
                          className="text-[10px]"
                        >
                          {c.acceptsPreOrders !== false ? "Pre-Orders Allowed" : "Pre-Orders Disabled"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-400">
                      ~{c.estimatedPrepMinutes || 15} min
                    </TableCell>
                    <TableCell className="text-xs">
                      {pointsSummary[c._id] ? (
                        <div>
                          <div className="font-bold text-amber-400">
                            {formatPoints(pointsSummary[c._id].pointsUsed)}
                            <span className="text-stone-500 font-normal"> used</span>
                          </div>
                          <div className="text-[10px] text-stone-400">of {formatPoints(pointsSummary[c._id].pointsAllocated)} allocated</div>
                          {pointsSummary[c._id].allowedIps?.length > 0 && (
                            <div className="text-[10px] text-blue-400">🔒 {pointsSummary[c._id].allowedIps.length} login IP(s)</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-600">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === "ACTIVE" ? "success" : c.status === "MAINTENANCE" ? "warning" : "destructive"}
                        className="text-[10px]"
                      >
                        {c.status || "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setControlsFor(pointsSummary[c._id] ?? null)}
                        className="text-xs text-amber-400 hover:text-amber-300 h-8"
                      >
                        Points &amp; Access
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(c)}
                        className="text-xs text-stone-300 hover:text-white h-8"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BranchControlsDialog summary={controlsFor} onClose={() => setControlsFor(null)} onSaved={loadData} />

      {/* Modal: Add / Edit Cafe */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCafe ? `Configure Branch: ${editingCafe.name}` : "Add New Cafe Branch"}</DialogTitle>
            <DialogDescription>
              Configure branch parameters, operational time windows, pre-order acceptance, and assign management staff.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Cafe Branch Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Unifi Cafe Indiranagar"
                  required
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Branch Code (Unique)</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. UC-IND-01"
                  required
                  className="mt-1 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Street Address</label>
              <Input
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="100 Feet Road, HAL 2nd Stage"
                required
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required className="mt-1 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">State</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} required className="mt-1 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Pincode</label>
                <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required className="mt-1 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Daily Operating Hours</label>
                <Input
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="08:00 - 23:00"
                  required
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Branch Contact Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 80 4123 4567"
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Ownership Type</label>
                <select
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="COMPANY">COMPANY OWNED</option>
                  <option value="FRANCHISE">FRANCHISE OPERATED</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Branch Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="ACTIVE">ACTIVE (Accepting Visits & Orders)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Temporarily Closed)</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {ownershipType === "FRANCHISE" && (
              <div>
                <label className="text-xs font-semibold text-stone-300">Operating Franchise</label>
                <select
                  value={franchiseId}
                  onChange={(e) => setFranchiseId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="">None / Direct</option>
                  {franchises.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Assigned Area Supervisor</label>
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
              <div>
                <label className="text-xs font-semibold text-stone-300">Assigned Cafe Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="">Unassigned</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pre-Order Controls */}
            <div className="p-3.5 rounded-lg bg-stone-950 border border-stone-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                    Accept Online Pre-Orders Before Arrival
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Allow members outside the cafe to place pre-orders for dine-in / pickup at this branch.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={acceptsPreOrders}
                  onChange={(e) => setAcceptsPreOrders(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-700 bg-stone-900 text-amber-600 focus:ring-amber-500"
                />
              </div>

              {acceptsPreOrders && (
                <div>
                  <label className="text-xs font-semibold text-stone-300">Kitchen Prep Time Estimate (Minutes)</label>
                  <Input
                    type="number"
                    value={estimatedPrepMinutes}
                    onChange={(e) => setEstimatedPrepMinutes(Number(e.target.value))}
                    min={5}
                    max={120}
                    required
                    className="mt-1 w-36 text-xs font-bold"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Cafe Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
