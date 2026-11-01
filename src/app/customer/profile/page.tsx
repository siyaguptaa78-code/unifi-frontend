"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { User, Shield, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("UNSPECIFIED");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/profile");
        if (res.ok) {
          const json = await res.json();
          const u = json.data.user;
          const p = json.data.profile;
          setName(u.name || "");
          setMobile(u.mobile || "");
          if (p) {
            setGender(p.gender || "UNSPECIFIED");
            setCity(p.address?.city || "");
            setState(p.address?.state || "");
            setPincode(p.address?.pincode || "");
            setMarketingOptIn(p.marketingOptIn !== false);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          gender,
          address: { city, state, pincode },
          marketingOptIn,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update profile");
      toast.success("Profile updated successfully");
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password: newPassword, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to change password");
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <User className="h-6 w-6 text-amber-500" />
              <span>Customer Profile</span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Manage your personal credentials, contact numbers, and security credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Personal Details Form */}
            <Card className="border-stone-800 bg-stone-900/60 p-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span>Personal Information</span>
                </h3>

                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Registered Email (Immutable)"
                  value={user?.email || ""}
                  disabled
                  className="bg-stone-950 text-stone-400 cursor-not-allowed"
                />

                <Input
                  label="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100"
                  >
                    <option value="UNSPECIFIED">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>

                <Button type="submit" isLoading={saving} className="w-full font-semibold mt-2">
                  Save Changes
                </Button>
              </form>
            </Card>

            {/* Change Password Form */}
            <Card className="border-stone-800 bg-stone-900/60 p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Security & Password</span>
                </h3>

                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="outline"
                  isLoading={passwordSaving}
                  className="w-full font-semibold mt-2"
                >
                  Update Password
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

