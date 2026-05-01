"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { fleet, getVehicleBySlug } from "@/data/fleet";
import { siteConfig } from "@/data/site-config";
import type { Vehicle } from "@/data/fleet";
import {
  buildBookingPayload,
  createPaymentOrder,
  submitBooking,
  verifyPayment,
  type BookingResult,
  type BookingStatus,
} from "@/lib/booking";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BookingFormData {
  fullName: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  preferredCar: string;
  location: string;
  paymentMode: string;
  message: string;
}

type FormErrors = Partial<Record<keyof BookingFormData, string>>;
type SubmitState = "idle" | "submitting" | "submitted" | "error";

import { getPublicRazorpayKey, formatPaymentError, openRazorpayCheckout } from "@/lib/razorpay-client";

const emptyForm: BookingFormData = {
  fullName: "",
  phone: "",
  pickupDate: "",
  returnDate: "",
  preferredCar: "",
  location: "",
  paymentMode: "",
  message: "",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(Math.ceil(ms / 86_400_000), 1);
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}



function validate(d: BookingFormData): FormErrors {
  const e: FormErrors = {};
  if (!d.fullName.trim()) e.fullName = "Full name is required";
  if (!d.phone.trim()) e.phone = "Phone number is required";
  else if (!/^[6-9]\d{9}$/.test(d.phone.replace(/\s/g, "")))
    e.phone = "Enter a valid 10-digit mobile number";
  if (!d.pickupDate) e.pickupDate = "Pickup date is required";
  else if (d.pickupDate < todayISO()) e.pickupDate = "Date cannot be in the past";
  if (!d.returnDate) e.returnDate = "Return date is required";
  else if (d.returnDate <= d.pickupDate) e.returnDate = "Must be after pickup date";
  if (!d.preferredCar) e.preferredCar = "Please select a vehicle";
  if (!d.location.trim()) e.location = "Delivery location is required";
  if (!d.paymentMode) e.paymentMode = "Please select a payment mode";
  return e;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function BookingForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BookingFormData>(() => {
    const initialState = { ...emptyForm };
    const car = searchParams.get("car");
    const pickup = searchParams.get("pickup");
    const ret = searchParams.get("return");
    const payment = searchParams.get("payment");

    if (car && getVehicleBySlug(car)) initialState.preferredCar = car;
    if (pickup) initialState.pickupDate = pickup;
    if (ret) initialState.returnDate = ret;
    if (payment && ["online", "offline"].includes(payment)) initialState.paymentMode = payment;

    return initialState;
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedVehicle: Vehicle | undefined = useMemo(
    () => (form.preferredCar ? getVehicleBySlug(form.preferredCar) : undefined),
    [form.preferredCar]
  );

  const days = useMemo(
    () =>
      form.pickupDate && form.returnDate && form.returnDate > form.pickupDate
        ? daysBetween(form.pickupDate, form.returnDate)
        : 0,
    [form.pickupDate, form.returnDate]
  );

  const rentalTotal = (selectedVehicle?.pricePerDay ?? 0) * days;
  const advanceAmount = Math.round(rentalTotal * (siteConfig.booking.advancePercent / 100));

  /* ---- Handlers ---- */

  function onChange(name: keyof BookingFormData, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched.has(name)) {
      setErrors((prev) => {
        const next = { ...prev };
        const check = validate({ ...form, [name]: value });
        if (check[name]) next[name] = check[name];
        else delete next[name];
        return next;
      });
    }
  }

  function onBlur(name: string) {
    setTouched((prev) => new Set(prev).add(name));
    const check = validate(form);
    if (check[name as keyof BookingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: check[name as keyof BookingFormData] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched(new Set(Object.keys(form)));
    if (Object.keys(errs).length > 0) return;
    if (!selectedVehicle || days <= 0) return;

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const payload = buildBookingPayload(form, selectedVehicle, days);

      // Both paths create a real booking in Supabase first
      const bookingResult = await submitBooking(payload);

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || "Unable to create booking");
      }

      /* ---- Offline path: booking created, done ---- */
      if (payload.paymentMode === "offline") {
        setResult(bookingResult);
        setSubmitState("submitted");
        return;
      }

      /* ---- Online path: create order → Razorpay checkout → verify ---- */
      const order = await createPaymentOrder({
        bookingId: bookingResult.bookingId!,
        customerName: payload.fullName,
        customerPhone: payload.phone,
      });

      const payment = await openRazorpayCheckout({
        key: getPublicRazorpayKey(),
        amount: order.amount,
        currency: order.currency,
        name: siteConfig.brand,
        description: `${payload.vehicleName} advance payment`,
        order_id: order.orderId,
        prefill: {
          name: payload.fullName,
          contact: payload.phone,
        },
        notes: {
          bookingRef: order.bookingRef,
          vehicle: payload.vehicleName,
        },
        theme: {
          color: "#A77C43",
        },
      });

      const verification = await verifyPayment(
        bookingResult.bookingId!,
        payment.razorpay_payment_id,
        payment.razorpay_order_id,
        payment.razorpay_signature
      );

      setResult(verification);
      setSubmitState("submitted");
    } catch (error) {
      console.warn("Booking/Payment incomplete:", error instanceof Error ? error.message : String(error));
      setSubmitError(formatPaymentError(error));
      setSubmitState("error");
    }
  }

  /* ================================================================ */
  /*  POST-SUBMISSION VIEW                                             */
  /* ================================================================ */

  if (submitState === "submitted" && result) {
    return (
      <PostSubmissionView
        result={result}
        form={form}
        vehicle={selectedVehicle}
        days={days}
        rentalTotal={rentalTotal}
        advanceAmount={advanceAmount}
      />
    );
  }

  /* ================================================================ */
  /*  FORM VIEW                                                        */
  /* ================================================================ */

  const vehicleOptions = fleet.map((v) => ({
    label: `${v.name} ${v.year} ${v.variant} \u2014 \u20B9${fmt(v.pricePerDay)}/day`,
    value: v.slug,
  }));

  const paymentOptions = [
    { label: "Online Payment (UPI / Card / Net Banking)", value: "online" },
    { label: "Offline Payment (Cash / Card at delivery)", value: "offline" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Left: Form */}
      <div className="lg:col-span-2">
        <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10">
          <h2 className="font-headline-md text-primary mb-8">Your Details</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Full Name" name="fullName" value={form.fullName} error={errors.fullName}
                onChange={(v) => onChange("fullName", v)} onBlur={() => onBlur("fullName")} required placeholder="Enter your full name" />
              <Field label="Phone Number" name="phone" type="tel" value={form.phone} error={errors.phone}
                onChange={(v) => onChange("phone", v)} onBlur={() => onBlur("phone")} required placeholder="10-digit mobile number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Pickup Date" name="pickupDate" type="date" value={form.pickupDate} error={errors.pickupDate}
                onChange={(v) => onChange("pickupDate", v)} onBlur={() => onBlur("pickupDate")} required min={todayISO()} />
              <Field label="Return Date" name="returnDate" type="date" value={form.returnDate} error={errors.returnDate}
                onChange={(v) => onChange("returnDate", v)} onBlur={() => onBlur("returnDate")} required min={form.pickupDate || todayISO()} />
            </div>

            <Field label="Preferred Car" name="preferredCar" type="select" value={form.preferredCar} error={errors.preferredCar}
              onChange={(v) => onChange("preferredCar", v)} onBlur={() => onBlur("preferredCar")} required
              placeholder="Select a vehicle" options={vehicleOptions} />

            <Field label="Pickup / Delivery Location" name="location" value={form.location} error={errors.location}
              onChange={(v) => onChange("location", v)} onBlur={() => onBlur("location")} required placeholder="Enter your address or area" />

            <Field label="Payment Mode" name="paymentMode" type="select" value={form.paymentMode} error={errors.paymentMode}
              onChange={(v) => onChange("paymentMode", v)} onBlur={() => onBlur("paymentMode")} required
              placeholder="Choose payment method" options={paymentOptions} />

            <Field label="Special Requests (Optional)" name="message" type="textarea" value={form.message}
              onChange={(v) => onChange("message", v)} placeholder="Any special requirements or preferences..." />

            {/* Document reminder */}
            <div className="bg-surface-container-highest rounded-xl p-5 border border-outline-variant/50">
              <p className="font-body-sm text-outline">
                <span className="font-bold text-primary mr-1 inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">assignment</span> Required Documents:
                </span>
                {siteConfig.booking.requiredDocuments.join(" & ")} &mdash; must be presented at vehicle handover.
              </p>
            </div>

            {/* Error banner */}
            {submitState === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {submitError || `Something went wrong. Please try again or call us directly at ${siteConfig.phoneFormatted}.`}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitState === "submitting"}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-container text-on-primary rounded-lg font-label-bold text-sm tracking-widest uppercase hover:opacity-90 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              >
                {submitState === "submitting" ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {form.paymentMode === "online" ? "Opening payment..." : "Processing..."}
                  </>
                ) : (
                  form.paymentMode === "online"
                    ? advanceAmount > 0
                      ? `Pay \u20B9${fmt(advanceAmount)} Advance`
                      : "Pay Advance Online"
                    : "Submit Booking Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right: Summary sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <CostSummaryCard vehicle={selectedVehicle} days={days} rentalTotal={rentalTotal} advanceAmount={advanceAmount} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Post-Submission View                                               */
/* ================================================================== */

function PostSubmissionView({
  result,
  form,
  vehicle,
  days,
  rentalTotal,
  advanceAmount,
}: {
  result: BookingResult;
  form: BookingFormData;
  vehicle?: Vehicle;
  days: number;
  rentalTotal: number;
  advanceAmount: number;
}) {
  const isOnline = form.paymentMode === "online";
  const isPaymentConfirmed = result.status === "advance_paid";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2">
        <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-12 text-center">
          {/* Status icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            result.status === "pending_payment"
              ? "bg-amber-100 text-amber-700"
              : "bg-secondary-container text-on-secondary-container"
          }`}>
            <span className="material-symbols-outlined text-[40px]">
              {result.status === "pending_payment" ? "schedule" : "check_circle"}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-display-sm text-primary mb-2">
            {statusHeadline(result.status)}
          </h2>
          <p className="font-body-lg text-outline mb-8 max-w-[28rem] mx-auto">
            {statusDescription(result.status, isOnline)}
          </p>

          {/* Status badge */}
          <div className="flex justify-center mb-8">
            <StatusBadge status={result.status} />
          </div>

          {/* Booking details */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 max-w-[28rem] mx-auto mb-8 text-left space-y-3">
            <SummaryLine label="Booking Ref" value={result.bookingRef} bold />
            <SummaryLine label="Name" value={form.fullName} />
            <SummaryLine label="Phone" value={form.phone} />
            {vehicle && (
              <SummaryLine label="Vehicle" value={`${vehicle.name} ${vehicle.year}`} />
            )}
            <SummaryLine
              label="Pickup"
              value={new Date(form.pickupDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            />
            <SummaryLine
              label="Return"
              value={new Date(form.returnDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            />
            {days > 0 && (
              <SummaryLine label="Duration" value={`${days} day${days > 1 ? "s" : ""}`} />
            )}
            {rentalTotal > 0 && (
              <>
                <div className="border-t border-outline-variant my-2" />
                <SummaryLine label="Rental Total" value={`\u20B9${fmt(rentalTotal)}`} />
                <SummaryLine label={`Advance (${siteConfig.booking.advancePercent}%)`} value={`\u20B9${fmt(advanceAmount)}`} bold />
                <SummaryLine label="Security Deposit" value={`\u20B9${fmt(siteConfig.booking.securityDeposit)} (refundable)`} />
              </>
            )}
            <SummaryLine
              label="Payment"
              value={isOnline ? "Online (advance required)" : "Offline (pay at delivery)"}
            />
          </div>

          {/* Next steps */}
          <div className="bg-surface-container-highest rounded-xl p-5 border border-outline-variant/50 max-w-[28rem] mx-auto mb-8 text-left">
            <p className="font-body-sm font-bold text-primary mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">info</span> What happens next?
            </p>
            {isOnline && isPaymentConfirmed ? (
              <ul className="font-body-sm text-outline space-y-1 list-disc list-inside">
                <li>Your {siteConfig.booking.advancePercent}% advance payment has been received successfully</li>
                <li>Our team will contact you to reconfirm pickup and delivery details</li>
                <li>Please keep your original documents ready at vehicle handover</li>
              </ul>
            ) : isOnline ? (
              <ul className="font-body-sm text-outline space-y-1 list-disc list-inside">
                <li>Our team will review your request and confirm vehicle availability</li>
                <li>You may be asked to retry the {siteConfig.booking.advancePercent}% advance payment if verification did not complete</li>
                <li>Your booking is confirmed once the advance payment is completed</li>
              </ul>
            ) : (
              <ul className="font-body-sm text-outline space-y-1 list-disc list-inside">
                <li>Our team will call you to confirm vehicle availability</li>
                <li>Full payment is collected at vehicle handover</li>
                <li>Please keep your documents ready: {siteConfig.booking.requiredDocuments.join(" & ")}</li>
              </ul>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/91${siteConfig.phone}?text=${encodeURIComponent(
                `Hi, I just submitted a booking request.\n\nRef: ${result.bookingRef}\nVehicle: ${vehicle?.name ?? "N/A"} ${vehicle?.year ?? ""}\nDates: ${form.pickupDate} to ${form.returnDate}\nPayment: ${isOnline ? "Online" : "Offline"}\n\nPlease confirm availability.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-lg font-label-bold hover:opacity-90 transition-opacity shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Confirm on WhatsApp
            </a>
            <a
              href={siteConfig.phoneHref}
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant text-on-surface rounded-lg font-label-bold hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              Call {siteConfig.phoneFormatted}
            </a>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <CostSummaryCard vehicle={vehicle} days={days} rentalTotal={rentalTotal} advanceAmount={advanceAmount} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Helpers                                                     */
/* ------------------------------------------------------------------ */

function statusHeadline(status: BookingStatus): string {
  switch (status) {
    case "pending_payment": return "Booking Request Received";
    case "advance_paid":    return "Advance Payment Received";
    case "confirmed":       return "Booking Confirmed";
    case "active":          return "Rental Active";
    case "completed":       return "Rental Completed";
    case "cancelled":       return "Booking Cancelled";
  }
}

function statusDescription(status: BookingStatus, isOnline: boolean): string {
  switch (status) {
    case "pending_payment":
      return isOnline
        ? `Your booking has been created. A ${siteConfig.booking.advancePercent}% advance payment is required to confirm your reservation.`
        : "Your booking request has been submitted. Our team will contact you shortly to confirm availability and finalise your booking.";
    case "advance_paid":
      return `Your ${siteConfig.booking.advancePercent}% advance payment has been received successfully. Your vehicle is reserved and our team will contact you before delivery.`;
    case "confirmed":
      return "Your booking is fully confirmed and your vehicle is reserved. We will contact you before delivery.";
    case "active":
      return "Your rental is currently active. Drive safe!";
    case "completed":
      return "Your rental has been completed. Thank you for choosing JP Rentals.";
    case "cancelled":
      return "This booking has been cancelled.";
  }
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; icon: string; color: string }> = {
    pending_payment: { label: "Pending",      icon: "hourglass_top",  color: "bg-amber-100 text-amber-800" },
    advance_paid:    { label: "Advance Paid", icon: "verified",       color: "bg-green-100 text-green-800" },
    confirmed:       { label: "Confirmed",    icon: "verified",       color: "bg-green-100 text-green-800" },
    active:          { label: "Active",       icon: "directions_car", color: "bg-blue-100 text-blue-800" },
    completed:       { label: "Completed",    icon: "check_circle",   color: "bg-green-100 text-green-800" },
    cancelled:       { label: "Cancelled",    icon: "cancel",         color: "bg-red-100 text-red-800" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${c.color}`}>
      <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
      {c.label}
    </span>
  );
}

/* ================================================================== */
/*  Sub-components (visual, unchanged from previous version)           */
/* ================================================================== */

function Field({
  label, name, type = "text", value, error, onChange, onBlur, required, placeholder, options, min,
}: {
  label: string; name: string; type?: string; value: string; error?: string;
  onChange: (v: string) => void; onBlur?: () => void; required?: boolean;
  placeholder?: string; options?: { label: string; value: string }[]; min?: string;
}) {
  const base =
    "w-full px-4 py-3 font-body-sm font-bold bg-surface border text-primary placeholder:text-outline/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200";
  const borderClass = error ? "border-red-400" : "border-outline";

  return (
    <div>
      <label htmlFor={name} className="block font-body-sm font-bold text-primary mb-2">
        {label}
        {required && <span className="text-secondary ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur} placeholder={placeholder} rows={4} className={`${base} ${borderClass} resize-none`} />
      ) : type === "select" && options ? (
        <select id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur} required={required} className={`${base} ${borderClass}`}>
          <option value="" disabled className="text-outline/60">{placeholder || "Select an option"}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-primary font-bold">{o.label}</option>
          ))}
        </select>
      ) : (
        <input id={name} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur} placeholder={placeholder} required={required} min={min} className={`${base} ${borderClass}`} />
      )}
      {error && <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}

function CostSummaryCard({ vehicle, days, rentalTotal, advanceAmount }: {
  vehicle?: Vehicle; days: number; rentalTotal: number; advanceAmount: number;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
      <div className="bg-primary p-6">
        <h3 className="font-headline-md text-white">Booking Summary</h3>
        {vehicle && (
          <p className="font-body-sm font-bold text-white/70 mt-1">
            {vehicle.name} {vehicle.year} &middot; {vehicle.variant}
          </p>
        )}
      </div>

      {vehicle && (
        <div className="relative h-40 bg-surface-container">
          <Image src={vehicle.image} alt={vehicle.name} fill className="object-cover object-center" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
        </div>
      )}

      <div className="p-6 md:p-8 space-y-6">
        {vehicle && (
          <div className="flex items-baseline justify-between pb-4 border-b border-outline-variant">
            <span className="font-body-sm text-outline">Price per day</span>
            <span className="text-display-sm font-black text-primary">
              &#8377;{fmt(vehicle.pricePerDay)}
            </span>
          </div>
        )}

        {days > 0 && vehicle && (
          <div className="space-y-3 pb-4 border-b border-outline-variant">
            <SummaryRow label={`${days} day${days > 1 ? "s" : ""} rental`} value={`\u20B9${fmt(rentalTotal)}`} />
            <SummaryRow label={`Advance (${siteConfig.booking.advancePercent}%)`} value={`\u20B9${fmt(advanceAmount)}`} highlight />
          </div>
        )}

        <div className="space-y-3">
          <SummaryRow label="Security Deposit" value={`\u20B9${fmt(siteConfig.booking.securityDeposit)} (refundable)`} />
          <SummaryRow label="Fuel Policy" value="Paid by customer" />
          <SummaryRow label="Delivery" value="Free delivery available" />
          <SummaryRow label="Documents" value={siteConfig.booking.requiredDocuments.join(" & ")} />
          <SummaryRow label="Cancellation" value={`Within ${siteConfig.booking.cancellationHours} hours`} />
        </div>

        <div className="pt-4 border-t border-outline-variant">
          <p className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {siteConfig.location.name} &middot; {siteConfig.location.region}
          </p>
        </div>

        <a href={siteConfig.phoneHref}
          className="flex items-center justify-center gap-2 w-full py-3 border border-outline-variant rounded-lg text-primary font-label-bold text-sm hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[18px]">call</span>
          Need Help? Call {siteConfig.phoneFormatted}
        </a>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-body-sm text-outline">{label}</span>
      <span className={`font-body-sm text-right ${highlight ? "font-black text-secondary" : "font-bold text-primary"}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-outline">{label}</span>
      <span className={`text-sm text-right ${bold ? "font-black text-primary" : "font-bold text-primary"}`}>{value}</span>
    </div>
  );
}
