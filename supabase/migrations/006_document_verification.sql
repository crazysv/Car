-- ============================================================================
-- JP Rentals - Document Verification Fields
-- Phase 8: Lightweight handover-only document verification tracking
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- Add document verification tracking columns to the bookings table.
-- These columns track whether an admin has physically verified documents
-- at handover. No sensitive document data (numbers, images) is stored.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dl_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS docs_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS docs_verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- No RLS policy changes are needed. All updates to these columns are performed
-- server-side via admin-only API routes using the Supabase service role key,
-- which bypasses RLS entirely.

