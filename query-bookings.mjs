import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
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
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Found", data.length, "bookings.");
  }
}

main();
