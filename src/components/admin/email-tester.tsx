"use client";

import { useState } from "react";

export function EmailTester({ isConfigured }: { isConfigured: boolean }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", msg: data.error || "Test failed" });
      } else {
        setResult({ type: "success", msg: "Test email sent!" });
      }
    } catch {
      setResult({ type: "error", msg: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-amber-500'}`} />
        <span className="text-sm font-label-bold text-primary">
          Email notifications: {isConfigured ? "configured" : "not configured"}
        </span>
      </div>
      
      {isConfigured && (
        <>
          <div className="w-px h-4 bg-outline-variant" />
          <button
            onClick={handleTest}
            disabled={loading}
            className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Test"}
          </button>
        </>
      )}

      {result && (
        <span className={`text-xs font-medium ${result.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {result.msg}
        </span>
      )}
    </div>
  );
}
