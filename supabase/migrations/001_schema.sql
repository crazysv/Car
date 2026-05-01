-- ============================================================================
-- JP Rentals — Supabase Database Schema
-- Phase 2: Core tables, enums, RLS, triggers, indexes
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM TYPES (Enums)
-- ============================================================================

CREATE TYPE vehicle_category AS ENUM ('SUV', 'Sedan', 'Hatchback');
CREATE TYPE fuel_type AS ENUM ('Petrol', 'Diesel');

CREATE TYPE booking_status AS ENUM (
  'pending_payment',
  'advance_paid',
  'confirmed',
  'active',
  'completed',
  'cancel_requested',
  'cancelled',
  'refund_pending',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'unpaid',
  'order_created',
  'paid',
  'verification_failed',
  'refunded'
);

-- ============================================================================
-- 2. HELPER: updated_at trigger function
-- ============================================================================

-- Pin search_path to prevent search-path injection attacks.
-- This function is only invoked by triggers, not called directly by users.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Revoke direct execute from all roles — this is a trigger-only function.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

-- ============================================================================
-- 3. PROFILES TABLE
-- ============================================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Extended user profile linked to auth.users';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create a profile row when a new user signs up.
-- SECURITY DEFINER: runs as the function owner (postgres) to bypass RLS.
-- search_path pinned to '' — all references are schema-qualified.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Revoke direct execute — this is a trigger-only function.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. VEHICLES TABLE
-- ============================================================================

CREATE TABLE vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  category      vehicle_category NOT NULL,
  fuel_type     fuel_type NOT NULL,
  year          SMALLINT NOT NULL,
  price_per_day INTEGER NOT NULL CHECK (price_per_day > 0),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE vehicles IS 'Fleet inventory synced from application fleet data';

-- Note: slug already has a UNIQUE constraint which creates an implicit index.
-- idx_vehicles_slug removed as redundant with the UNIQUE constraint on slug.
CREATE INDEX idx_vehicles_active ON vehicles (is_active) WHERE is_active = TRUE;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. BOOKINGS TABLE
-- ============================================================================

CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref       TEXT NOT NULL UNIQUE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  pickup_date       DATE NOT NULL,
  return_date       DATE NOT NULL CHECK (return_date >= pickup_date),
  pickup_location   TEXT NOT NULL,
  payment_mode      TEXT NOT NULL CHECK (payment_mode IN ('online', 'offline')),
  rental_total      INTEGER NOT NULL CHECK (rental_total >= 0),
  advance_amount    INTEGER NOT NULL CHECK (advance_amount >= 0),
  security_deposit  INTEGER NOT NULL DEFAULT 5000 CHECK (security_deposit >= 0),
  booking_status    booking_status NOT NULL DEFAULT 'pending_payment',
  payment_status    payment_status NOT NULL DEFAULT 'unpaid',
  customer_name     TEXT,
  customer_phone    TEXT,
  customer_email    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bookings IS 'Customer booking records';

CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_vehicle ON bookings (vehicle_id);
-- Note: booking_ref already has a UNIQUE constraint which creates an implicit index.
-- idx_bookings_ref removed as redundant with the UNIQUE constraint on booking_ref.
CREATE INDEX idx_bookings_status ON bookings (booking_status);
CREATE INDEX idx_bookings_dates ON bookings (pickup_date, return_date);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. BOOKING PAYMENTS TABLE
-- ============================================================================

CREATE TABLE booking_payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  amount                INTEGER NOT NULL CHECK (amount > 0),
  currency              TEXT NOT NULL DEFAULT 'INR',
  status                payment_status NOT NULL DEFAULT 'unpaid',
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE booking_payments IS 'Razorpay payment records linked to bookings';

CREATE INDEX idx_payments_booking ON booking_payments (booking_id);

-- Enforce uniqueness for Razorpay identifiers (prevent duplicate records on retries).
-- Partial unique indexes: only enforce when the value is NOT NULL.
-- These also serve as lookup indexes, so no separate non-unique index is needed.
CREATE UNIQUE INDEX idx_payments_razorpay_order_unique
  ON booking_payments (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX idx_payments_razorpay_payment_unique
  ON booking_payments (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- ============================================================================
-- 7. BOOKING STATUS HISTORY TABLE
-- ============================================================================

CREATE TABLE booking_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status      booking_status NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE booking_status_history IS 'Audit trail of booking status transitions';

CREATE INDEX idx_status_history_booking ON booking_status_history (booking_id);
CREATE INDEX idx_status_history_changed_by ON booking_status_history (changed_by);
CREATE INDEX idx_status_history_created ON booking_status_history (created_at);

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all customer-facing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
-- Users can read their own profile (authenticated only)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- Users can update their own profile (authenticated only)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ---- VEHICLES ----
-- Anyone (including anonymous/unauthenticated) can read active vehicles.
-- No TO clause — intentionally allows anon access for public fleet browsing.
CREATE POLICY "vehicles_select_active"
  ON vehicles FOR SELECT
  USING (is_active = TRUE);

-- ---- BOOKINGS ----
-- Users can read only their own bookings (authenticated only)
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- WRITE MODEL: All booking INSERT/UPDATE operations are performed server-side
-- using the SUPABASE_SERVICE_ROLE_KEY in API routes. No client-side INSERT or
-- UPDATE policies exist, which prevents users from forging:
--   - booking_status / payment_status
--   - rental_total / advance_amount / security_deposit
--   - any other sensitive booking fields
-- The service role key bypasses RLS entirely.

-- ---- BOOKING PAYMENTS ----
-- Users can read payments for their own bookings (authenticated only)
CREATE POLICY "payments_select_own"
  ON booking_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_payments.booking_id
        AND bookings.user_id = (select auth.uid())
    )
  );

-- ---- BOOKING STATUS HISTORY ----
-- Users can read status history for their own bookings (authenticated only)
CREATE POLICY "status_history_select_own"
  ON booking_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_status_history.booking_id
        AND bookings.user_id = (select auth.uid())
    )
  );
