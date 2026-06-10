import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const admin = createClient(supabaseUrl, supabaseKey);
const client = createClient(supabaseUrl, anonKey);

async function test() {
  const email = `test_${crypto.randomBytes(4).toString("hex")}@example.com`;
  const password = "password123";

  // Create user
  console.log("Creating user", email);
  const { data: { user }, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    console.error("Create error:", createError);
    return;
  }

  // Sign in to get session
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Sign in error:", signInError);
    return;
  }

  // Query bookings
  const { data, error } = await client
    .from("bookings")
    .select(`
      id,
      booking_ref,
      pickup_date,
      return_date,
      rental_total,
      advance_amount,
      booking_status,
      payment_status,
      payment_mode,
      created_at,
      vehicles (name, year, slug)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Query error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Query success:", data);
  }

  // Cleanup
  await admin.auth.admin.deleteUser(user.id);
}

test();
