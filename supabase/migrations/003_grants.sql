-- ============================================================================
-- 1. Table Grants for Customer Read Paths
-- ============================================================================

-- Grant SELECT to anon and authenticated roles for public reads (RLS handles actual filtering)
GRANT SELECT ON public.vehicles TO anon, authenticated;

-- Restrict SELECT on customer tables to authenticated role only
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.bookings TO authenticated;
GRANT SELECT ON public.booking_payments TO authenticated;
GRANT SELECT ON public.booking_status_history TO authenticated;

-- ============================================================================
-- 2. Table Grants for Customer Write Paths
-- ============================================================================

-- Grant UPDATE to authenticated role for profiles so users can edit their details
GRANT UPDATE ON public.profiles TO authenticated;

-- Note: All other writes (bookings, payments, history) are handled server-side 
-- via the service_role key, so no additional INSERT/UPDATE grants are required 
-- for the anon or authenticated roles.
