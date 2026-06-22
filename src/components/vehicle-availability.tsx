"use client";

import { useEffect, useState } from "react";

interface DateRange {
  pickupDate: string;
  returnDate: string;
}

export function VehicleAvailability({ slug }: { slug: string }) {
  const [ranges, setRanges] = useState<DateRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchAvailability() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/vehicles/${slug}/availability`);
        if (!res.ok) {
          if (mounted) setError(true);
          return;
        }
        const data = await res.json();
        
        if (mounted && data.ranges) {
          setRanges(data.ranges);
        }
      } catch (err) {
        console.warn("Failed to load availability:", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAvailability();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-outline-variant/30 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-outline-variant/20 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="font-body-sm text-red-800">
          Unable to load live availability. Please choose your dates on the booking page to confirm.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
      <h3 className="font-headline-sm text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
        Availability
      </h3>

      {ranges.length === 0 ? (
        <p className="font-body-sm text-outline">
          No upcoming blocked dates found. This vehicle is currently available.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="font-body-sm font-bold text-outline">Recently Blocked Dates:</p>
          <ul className="space-y-2">
            {ranges.map((range, idx) => {
              const from = new Date(range.pickupDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
              const to = new Date(range.returnDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <li key={idx} className="font-body-sm text-error flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                  {from} &ndash; {to}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-outline/70 mt-5 pt-4 border-t border-outline-variant">
        Note: Choose your exact dates on the booking page to confirm live availability and pricing.
      </p>
    </div>
  );
}

