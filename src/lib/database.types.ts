/* ------------------------------------------------------------------ */
/*  Database Types — mirrors the Supabase schema                       */
/*  Keep in sync with supabase/migrations/001_schema.sql               */
/* ------------------------------------------------------------------ */

// ---- Enums ----

export type VehicleCategoryDb = "SUV" | "Sedan" | "Hatchback";
export type FuelTypeDb = "Petrol" | "Diesel";

export type BookingStatusDb =
  | "pending_payment"
  | "advance_paid"
  | "confirmed"
  | "active"
  | "completed"
  | "cancel_requested"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type PaymentStatusDb =
  | "unpaid"
  | "order_created"
  | "paid"
  | "verification_failed"
  | "refunded";

// ---- Tables ----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleRow {
  id: string;
  slug: string;
  name: string;
  category: VehicleCategoryDb;
  fuel_type: FuelTypeDb;
  year: number;
  price_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  payment_mode: "online" | "offline";
  rental_total: number;
  advance_amount: number;
  security_deposit: number;
  booking_status: BookingStatusDb;
  payment_status: PaymentStatusDb;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: string;
  booking_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatusDb;
  paid_at: string | null;
  created_at: string;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  status: BookingStatusDb;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

// ---- Composite / Join types (for future queries) ----

export interface BookingWithVehicle extends Booking {
  vehicle: VehicleRow;
}

export interface BookingWithPayments extends Booking {
  payments: BookingPayment[];
}

export interface BookingFull extends Booking {
  vehicle: VehicleRow;
  payments: BookingPayment[];
  status_history: BookingStatusHistory[];
}
