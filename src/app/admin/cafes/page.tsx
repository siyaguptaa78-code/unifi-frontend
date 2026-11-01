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
import { Store, Plus, MapPin, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<any[]>([]);
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
  const [openingHours, setOpeningHours] = useState("08:00 - 23:00");
  const [seatingCapacity, setSeatingCapacity] = useState(45);
  const [ownershipType, setOwnershipType] = useState<"COMPANY" | "FRANCHISE">("COMPANY");

  const loadCafes = async () => {
    try {
      const res = await fetch("/api/cafes");
      if (res.ok) {
        const json = await res.json();
        setCafes(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCafes();
  }, []);

  const openCreate = () => {
    setEditingCafe(null);
    setName("");
    setCode("");
    setLine1("");
    setCity("Bengaluru");
    setState("Karnataka");
    setPincode("560038");
    setOpeningHours("08:00 - 23:00");
    setSeatingCapacity(45);
    setOwnershipType("COMPANY");
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
    setOpeningHours(c.openingHours || "08:00 - 23:00");
    setSeatingCapacity(c.seatingCapacity || 40);
    setOwnershipType(c.ownershipType || "COMPANY");
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
        openingHours,
        seatingCapacity,
        ownershipType,
        status: "ACTIVE",
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

      toast.success(editingCafe ? "Cafe updated successfully" : "New cafe created");
      setModalOpen(false);
      loadCafes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save cafe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Cafes & Locations Management"
        description="Add, edit, or configure participating UniCafe branches, managers and supervisors."
        badge="Multi-Location"
        action={
          <Button onClick={openCreate} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            <span>Create New Cafe</span>
          </Button>
        }
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cafe Name & Code</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Hours & Capacity</TableHead>
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
                    <TableCell className="text-xs text-stone-300 max-w-xs">
                      {c.address.line1}, {c.address.city}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {c.ownershipType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {c.supervisor?.name || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {c.manager?.name || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      <div>{c.openingHours}</div>
                      <div className="text-[10px] text-stone-500">{c.seatingCapacity} seats</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c)}
                        className="h-7 text-stone-300 hover:text-white"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal for create/edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingCafe ? "Edit Cafe Details" : "Create New Cafe"}
            </DialogTitle>
            <DialogDescription>
              Register a new location into the central NFC card access network.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cafe Name" placeholder="UniCafe Whitefield" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Store Code" placeholder="UC-BLR-03" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>

            <Input label="Street Address" placeholder="12, ITPL Main Road" value={line1} onChange={(e) => setLine1(e.target.value)} required />

            <div className="grid grid-cols-3 gap-3">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
              <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input label="Opening Hours" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} required />
              <Input label="Seating Capacity" type="number" value={seatingCapacity} onChange={(e) => setSeatingCapacity(Number(e.target.value))} required />
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">Ownership</label>
                <select
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value as any)}
                  className="flex h-10 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-stone-100"
                >
                  <option value="COMPANY">Company Owned</option>
                  <option value="FRANCHISE">Franchise Owned</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting} className="font-bold">
                {editingCafe ? "Update Cafe" : "Create Cafe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

