"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
}

export function AccountForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }
    
    if (!phone.trim()) {
      setMessage({ type: "error", text: "Phone number is required." });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
      setMessage({ type: "error", text: "Enter a valid 10-digit mobile number." });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
      router.refresh();
    }
  };

  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-bold ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-2">
          <label className="font-label-bold text-outline block">Email Address</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-xl px-4 py-3 font-body-lg text-outline-variant cursor-not-allowed"
          />
          <p className="text-xs text-outline mt-1">Email cannot be changed.</p>
        </div>

        <div className="space-y-2">
          <label className="font-label-bold text-primary block">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-lg text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label-bold text-primary block">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-lg text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            placeholder="9876543210"
            maxLength={10}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
