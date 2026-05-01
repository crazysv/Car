-- ============================================================================
-- Phase 7: Add booking contact snapshot
-- Run this in the Supabase SQL Editor to add contact snapshot fields to the bookings table.
-- ============================================================================

ALTER TABLE bookings 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN customer_email TEXT;
