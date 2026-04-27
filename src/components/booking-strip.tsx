"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fleet } from "@/data/fleet";

export function BookingStrip({ variant = "hero" }: { variant?: "hero" | "inline" }) {
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [preferredCar, setPreferredCar] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (preferredCar) params.set("car", preferredCar);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    if (paymentMode) params.set("payment", paymentMode);
    router.push(`/book?${params.toString()}`);
  };

  const inputClasses = `
    w-full pl-10 pr-4 py-3 text-sm font-semibold text-on-surface bg-surface-container-low rounded-lg
    border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all
    appearance-none
  `;

  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-outline mb-2";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-elevated p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 items-end">
        {/* Pickup Date */}
        <div className="relative">
          <label htmlFor="strip-pickup" className={labelClasses}>
            Pickup Date
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">calendar_month</span>
            <input
              id="strip-pickup"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Return Date */}
        <div className="relative">
          <label htmlFor="strip-return" className={labelClasses}>
            Return Date
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">calendar_month</span>
            <input
              id="strip-return"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Preferred Car */}
        <div className="relative">
          <label htmlFor="strip-car" className={labelClasses}>
            Preferred Car
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">directions_car</span>
            <select
              id="strip-car"
              value={preferredCar}
              onChange={(e) => setPreferredCar(e.target.value)}
              className={`${inputClasses} cursor-pointer`}
            >
              <option value="">Any Vehicle</option>
              {fleet.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name} {v.year}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="relative">
          <label htmlFor="strip-payment" className={labelClasses}>
            Payment Mode
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">payments</span>
            <select
              id="strip-payment"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className={`${inputClasses} cursor-pointer`}
            >
              <option value="">Any Method</option>
              <option value="online">Online (UPI / Card)</option>
              <option value="offline">Offline (Cash)</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="w-full px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest text-on-secondary-container bg-secondary-container hover:opacity-90 transition-all duration-300 shadow-md active:scale-95 h-[50px] flex items-center justify-center gap-2"
        >
          Book Now <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
