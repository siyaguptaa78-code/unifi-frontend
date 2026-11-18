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
  UserCheck,
  Plus,
  Edit,
  KeyRound,
  ShieldAlert,
  Search,
  Store,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { toast } from "sonner";

export default function AdminStaffPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetPwModalOpen, setResetPwModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [designation, setDesignation] = useState("");
  const [selectedCafeIds, setSelectedCafeIds] = useState<string[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [canAssignCards, setCanAssignCards] = useState(false);
  const [canCancelOrders, setCanCancelOrders] = useState(true);
  const [newPassword, setNewPassword] = useState("");

  const loadData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/cafes"),
      ]);
      if (uRes.ok) {
        const uJson = await uRes.json();
        setUsers(uJson.data || []);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        setCafes(cJson.data || []);
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
    setSelectedUser(null);
    setName("");
    setEmail("");
    setMobile("");
    setPassword("Demo@12345");
    setRole("STAFF");
    setDesignation("Barista");
    setSelectedCafeIds(cafes.length > 0 ? [cafes[0]._id] : []);
    setSelectedSupervisorId("");
    setStatus("ACTIVE");
    setCanAssignCards(false);
    setCanCancelOrders(true);
    setCreateModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
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
          password,
          role,
          designation,
          status,
          cafes: selectedCafeIds,
          canAssignCards,
          canCancelOrders,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create user");

      toast.success(`Internal user ${name} created as ${ROLE_LABELS[role]}`);
      setCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (u: any) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setMobile(u.mobile);
    setRole(u.role);
    setStatus(u.status || "ACTIVE");
    setDesignation(u.staff?.designation || "");
    setSelectedCafeIds(u.staff?.cafes?.map((c: any) => c._id || c) || []);
    setSelectedSupervisorId(u.staff?.supervisor?._id || u.staff?.supervisor || "");
    setCanAssignCards(u.staff?.permissions?.canAssignCards ?? false);
    setCanCancelOrders(u.staff?.permissions?.canCancelOrders ?? true);
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          role,
          status,
          designation,
          cafes: selectedCafeIds,
          supervisor: selectedSupervisorId || null,
          canAssignCards,
          canCancelOrders,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update user");

      toast.success("User profile and role assignments updated successfully");
      setEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const openResetPw = (u: any) => {
    setSelectedUser(u);
    setNewPassword("");
    setResetPwModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/${selectedUser._id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to reset password");

      toast.success(`Password reset successfully for ${selectedUser.name}`);
      setResetPwModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (u: any) => {
    const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/staff/${u._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(`User marked as ${nextStatus}`);
        loadData();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch =
      !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile?.includes(searchQuery);
    return matchRole && matchSearch;
  });

  const supervisors = users.filter((u) => u.role === "SUPERVISOR");

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Universal Staffing & Internal User Administration"
        description="Centralized administration of Supervisors, Franchise Owners, Cafe Managers, and Staff. Assign branches, configure permissions, and reset credentials."
        badge="Personnel Governance"
        action={
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
              <Input
                placeholder="Search staff by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={openCreate} className="text-xs h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              New Internal User
            </Button>
          </div>
        }
      />

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "SUPERVISOR", "FRANCHISE_OWNER", "MANAGER", "STAFF", "SUPER_ADMIN"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              roleFilter === r ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
            }`}
          >
            {r === "ALL" ? "All Personnel" : ROLE_LABELS[r as Role] || r} ({r === "ALL" ? users.length : users.filter((u) => u.role === r).length})
          </button>
        ))}
      </div>

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState title="No users found" description="No personnel match your selected role filter or search criteria." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Personnel Name</TableHead>
                  <TableHead>Role & Authority</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Branch Assignments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{u.name}</div>
                      {u.staff?.designation && (
                        <div className="text-[10px] text-stone-400">{u.staff.designation}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "SUPER_ADMIN"
                            ? "default"
                            : u.role === "SUPERVISOR"
                            ? "warning"
                            : u.role === "FRANCHISE_OWNER"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {ROLE_LABELS[u.role as Role] || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      <div>{u.email}</div>
                      <div>{u.mobile}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {u.staff?.cafes && u.staff.cafes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.staff.cafes.map((c: any) => (
                            <span key={c._id || c} className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">
                              <Store className="h-2.5 w-2.5" />
                              {c.name || c.code || "Branch"}
                            </span>
                          ))}
                        </div>
                      ) : u.role === "SUPER_ADMIN" ? (
                        <span className="text-stone-400 text-[11px]">Universal Access</span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleStatus(u)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant={u.status === "ACTIVE" ? "success" : "destructive"}
                          className="text-[10px]"
                        >
                          {u.status || "ACTIVE"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-[11px] text-stone-400">
                      {formatDateTime(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(u)}
                          title="Edit User & Roles"
                          className="h-8 w-8 text-stone-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openResetPw(u)}
                          title="Reset Credentials"
                          className="h-8 w-8 text-stone-400 hover:text-white"
                        >
                          <KeyRound className="h-4 w-4" />
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

      {/* Modal 1: Create Internal User */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Internal User & Assign Roles</DialogTitle>
            <DialogDescription>
              Enroll a new staff member, supervisor or franchise owner with direct branch assignments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Authority Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
              >
                <option value="STAFF">Cafe Staff / Barista</option>
                <option value="MANAGER">Cafe Manager</option>
                <option value="SUPERVISOR">Area Supervisor</option>
                <option value="FRANCHISE_OWNER">Franchise Owner</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vikram Rao"
                required
                className="mt-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@unificafe.in"
                  required
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Mobile (10 Digits)</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="mt-1 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Initial Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Demo@12345"
                required
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300">Designation / Job Title</label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Lead Barista / Store Manager"
                className="mt-1 text-xs"
              />
            </div>

            {role !== "SUPER_ADMIN" && (
              <div>
                <label className="text-xs font-semibold text-stone-300">Assigned Branch(es)</label>
                <div className="mt-1 max-h-32 overflow-y-auto border border-stone-800 rounded-lg p-2 space-y-1 bg-stone-950">
                  {cafes.map((c) => (
                    <label key={c._id} className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCafeIds.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCafeIds([...selectedCafeIds, c._id]);
                          else setSelectedCafeIds(selectedCafeIds.filter((id) => id !== c._id));
                        }}
                        className="rounded border-stone-700 bg-stone-900"
                      />
                      <span>{c.name} ({c.code})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Edit User & Role Assignments */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile & Assignments</DialogTitle>
            <DialogDescription>
              Modify role, branch assignments, designation or status for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Mobile</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="mt-1 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="STAFF">Cafe Staff</option>
                  <option value="MANAGER">Cafe Manager</option>
                  <option value="SUPERVISOR">Area Supervisor</option>
                  <option value="FRANCHISE_OWNER">Franchise Owner</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Designation</label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            {role !== "SUPER_ADMIN" && (
              <div>
                <label className="text-xs font-semibold text-stone-300">Assigned Branch(es)</label>
                <div className="mt-1 max-h-32 overflow-y-auto border border-stone-800 rounded-lg p-2 space-y-1 bg-stone-950">
                  {cafes.map((c) => (
                    <label key={c._id} className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCafeIds.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCafeIds([...selectedCafeIds, c._id]);
                          else setSelectedCafeIds(selectedCafeIds.filter((id) => id !== c._id));
                        }}
                        className="rounded border-stone-700 bg-stone-900"
                      />
                      <span>{c.name} ({c.code})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Reset Password */}
      <Dialog open={resetPwModalOpen} onOpenChange={setResetPwModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Credentials</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name}. All active sessions will be invalidated immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                className="mt-1 text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setResetPwModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
