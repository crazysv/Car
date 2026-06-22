"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DocumentVerificationPanelProps {
  bookingId: string;
  aadhaarVerified: boolean;
  dlVerified: boolean;
  docsVerifiedAt: string | null;
}

export function DocumentVerificationPanel({
  bookingId,
  aadhaarVerified: initialAadhaar,
  dlVerified: initialDl,
  docsVerifiedAt,
}: DocumentVerificationPanelProps) {
  const router = useRouter();
  const [aadhaar, setAadhaar] = useState(initialAadhaar);
  const [dl, setDl] = useState(initialDl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges = aadhaar !== initialAadhaar || dl !== initialDl;
  const bothVerified = initialAadhaar && initialDl;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/verify-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarVerified: aadhaar,
          dlVerified: dl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update verification");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8">
      <h3 className="font-headline-sm text-primary mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-secondary">badge</span>
        Document Verification
      </h3>
      <p className="text-xs text-outline mb-6">
        Mark documents as verified after physically inspecting originals at handover.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-4 border border-green-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Document verification updated successfully.
        </div>
      )}

      <div className="space-y-4 mb-6">
        <label className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-secondary/40 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={aadhaar}
            onChange={(e) => setAadhaar(e.target.checked)}
            className="w-5 h-5 rounded border-outline accent-secondary cursor-pointer"
          />
          <div className="flex-1">
            <span className="font-label-bold text-sm text-primary">Aadhaar Card</span>
            <span className="block text-xs text-outline mt-0.5">Original verified at handover</span>
          </div>
          {initialAadhaar && (
            <span className="material-symbols-outlined text-green-600 text-[20px]">verified</span>
          )}
        </label>

        <label className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-secondary/40 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={dl}
            onChange={(e) => setDl(e.target.checked)}
            className="w-5 h-5 rounded border-outline accent-secondary cursor-pointer"
          />
          <div className="flex-1">
            <span className="font-label-bold text-sm text-primary">Driving Licence</span>
            <span className="block text-xs text-outline mt-0.5">Original verified at handover</span>
          </div>
          {initialDl && (
            <span className="material-symbols-outlined text-green-600 text-[20px]">verified</span>
          )}
        </label>
      </div>

      {/* Status summary */}
      {bothVerified && docsVerifiedAt && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-green-600 mt-0.5 text-[20px]">verified_user</span>
          <div>
            <p className="text-sm font-bold text-green-800">All documents verified</p>
            <p className="text-xs text-green-700 mt-0.5">
              Verified on {new Date(docsVerifiedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-lg font-label-bold text-sm tracking-widest uppercase hover:opacity-90 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {saving ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">save</span>
            Update Verification
          </>
        )}
      </button>
    </div>
  );
}
