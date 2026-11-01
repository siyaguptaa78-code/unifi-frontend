"use client";

import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { UserCheck, Plus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function ManagerStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New staff form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("Lead Barista");
  const [canAssignCards, setCanAssignCards] = useState(true);

  const loadStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          role: "STAFF",
          designation,
          canAssignCards,
          canCancelOrders: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create staff member");
      toast.success("Staff member created. Default login: Demo@123");
      setModalOpen(false);
      setName("");
      setEmail("");
      setMobile("");
      loadStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["MANAGER", "FRANCHISE_OWNER", "SUPERVISOR", "SUPER_ADMIN"]}>
      <PageHeader
        title="Cafe Staff Roster"
        description="Assigned store baristas, access card assignment permissions and employee records."
        badge="Staff Management"
        action={
          <Button onClick={() => setModalOpen(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            <span>Add Cafe Staff</span>
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Card Permissions</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((st) => (
                  <TableRow key={st._id}>
                    <TableCell className="text-xs font-semibold text-white">
                      <div>{st.name}</div>
                      <div className="text-[10px] text-stone-500">{st.role}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {st.staff?.designation || "Store Associate"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-400">
                      {st.staff?.employeeCode || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      <div>{st.email}</div>
                      <div>{st.mobile}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={st.staff?.permissions?.canAssignCards ? "success" : "secondary"}>
                        {st.staff?.permissions?.canAssignCards ? "Can Assign Cards" : "Scan Only"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={st.status === "ACTIVE" ? "success" : "secondary"}>
                        {st.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Cafe Staff Member</DialogTitle>
            <DialogDescription>
              Assign employee credentials for pos and card check-in terminals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-3.5 py-2">
            <Input label="Full Name" placeholder="Rohan Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Address" type="email" placeholder="rohan@unicafe.demo" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Mobile Number" type="tel" placeholder="9876543219" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <Input label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="assignCardPerm"
                checked={canAssignCards}
                onChange={(e) => setCanAssignCards(e.target.checked)}
                className="rounded border-stone-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="assignCardPerm" className="text-xs text-stone-300">
                Grant permission to register and assign physical RFID/NFC cards
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting} className="font-bold">
                Create Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

