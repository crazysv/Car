# JP Rentals Launch Checklist

Before making the application available to the general public, ensure all items on this checklist are verified.

## 1. Database Migrations
Ensure the following SQL migrations have been executed in order via the Supabase Dashboard (SQL Editor):
- [ ] `001_schema.sql` (Core schema)
- [ ] `002_seed_vehicles.sql` (Fleet seed data - needed for fresh environments)
- [ ] `002_profile_trigger.sql` (Auth triggers)
- [ ] `003_grants.sql` (Basic permissions)
- [ ] `004_booking_contact_snapshot.sql` (Contact fields)
- [ ] `005_service_role_grants.sql` (Admin permissions)
- [ ] `006_document_verification.sql` (Document verification fields)

## 2. Environment Variables
Verify these variables are securely set in the Vercel Project Settings:

**Core & Auth**
- [ ] `NEXT_PUBLIC_SITE_URL` (Must be the deployed URL, e.g., `https://car-ruby-mu.vercel.app` or custom domain)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Your Supabase project URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase anon/public key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Supabase service_role key - KEEP SECRET)

**Payment (Razorpay)**
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Frontend key - test or live)
- [ ] `RAZORPAY_KEY_ID` (Backend key - must match frontend)
- [ ] `RAZORPAY_KEY_SECRET` (Backend secret - KEEP SECRET)
  - *Note: Remember to switch from Test keys to Live keys when ready to accept real payments.*

**Admin & Security**
- [ ] `ADMIN_EMAILS` (Comma-separated list of emails authorized to access the `/admin` dashboard)
- [ ] `CRON_SECRET` (Secret token used by Vercel Cron to securely trigger `/api/cron/expire-holds`)

**Email Notifications (Optional)**
- [ ] `RESEND_API_KEY` (Your Resend API key)
- [ ] `BOOKING_FROM_EMAIL` (E.g., `bookings@jprentals.com` - must be verified in Resend)
- [ ] `ADMIN_NOTIFICATION_EMAIL` (Where admin alerts are sent)

## 3. Supabase Auth Configuration
- [ ] In the Supabase Dashboard under **Authentication > URL Configuration**:
  - Site URL should be your main domain (e.g., `https://car-ruby-mu.vercel.app`).
  - Add `https://car-ruby-mu.vercel.app/auth/callback` to the **Redirect URLs** list.

## 4. Final Review
- [ ] Test the full booking flow using Razorpay Test Mode.
- [ ] Check `/sitemap.xml` and `/robots.txt` in the browser to confirm they are generated correctly.
- [ ] Try to access `/admin` with a non-admin account to confirm it is blocked.
- [ ] If using a custom domain later, update `NEXT_PUBLIC_SITE_URL` and Supabase Auth Redirect URLs accordingly.


