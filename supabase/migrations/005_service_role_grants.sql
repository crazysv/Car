-- ============================================================================
-- Phase 9: service_role grants for server-side API routes
-- ============================================================================
-- The application's API routes use SUPABASE_SERVICE_ROLE_KEY for all booking,
-- payment, and admin write operations. The service_role bypasses RLS by default,
-- but still requires explicit table-level grants in Supabase.
--
-- These grants do NOT weaken customer-facing RLS. RLS policies remain enforced
-- for anon/authenticated roles. The service_role is only used in trusted
-- server-side code, never exposed to the client.
-- ============================================================================

-- Read access: service_role needs to SELECT from all operational tables
GRANT SELECT ON public.vehicles TO service_role;
GRANT SELECT ON public.profiles TO service_role;
GRANT SELECT ON public.bookings TO service_role;
GRANT SELECT ON public.booking_payments TO service_role;
GRANT SELECT ON public.booking_status_history TO service_role;

-- Write access: service_role handles all booking/payment mutations
GRANT INSERT, UPDATE ON public.bookings TO service_role;
GRANT INSERT, UPDATE ON public.booking_payments TO service_role;
GRANT INSERT ON public.booking_status_history TO service_role;

-- Profiles: service_role needs INSERT for the auth trigger (handle_new_user)
-- and UPDATE for admin-level profile corrections if needed
GRANT INSERT, UPDATE ON public.profiles TO service_role;
