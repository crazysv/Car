import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expireStaleBookings } from "@/lib/jobs";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Rate Limit: IP-based limiting for public route (30 requests per minute)
    // Since we don't have user session, we try to use IP, but fallback to a generic key if not available
    const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
    const rateLimitKey = `availability_${ip}`;
    if (!checkRateLimit(rateLimitKey, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 1. Clean up stale holds before checking availability. Fail closed if cleanup fails,
    // otherwise the returned ranges may include stale payment holds.
    try {
      await expireStaleBookings();
    } catch (cleanupError) {
      console.error("Availability cleanup error:", cleanupError);
      return NextResponse.json(
        { error: "Unable to verify availability. Please try again." },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Default window: today to 90 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const defaultTo = new Date(today);
    defaultTo.setDate(today.getDate() + 90);

    const windowFrom = fromParam || today.toISOString().split("T")[0];
    const windowTo = toParam || defaultTo.toISOString().split("T")[0];

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(windowFrom) || !datePattern.test(windowTo) || windowTo <= windowFrom) {
      return NextResponse.json(
        { error: "Invalid availability date window." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 2. Resolve vehicle ID
    const { data: vehicle, error: vehicleError } = await admin
      .from("vehicles")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // 3. Query overlapping bookings
    // We want bookings that overlap with [windowFrom, windowTo)
    // existing.pickup_date < windowTo AND existing.return_date > windowFrom
    const blockingStatuses = [
      "pending_payment",
      "advance_paid",
      "confirmed",
      "active",
      "cancel_requested",
    ];

    const { data: overlapping, error: overlapError } = await admin
      .from("bookings")
      .select("pickup_date, return_date")
      .eq("vehicle_id", vehicle.id)
      .in("booking_status", blockingStatuses)
      .lt("pickup_date", windowTo)
      .gt("return_date", windowFrom)
      .order("pickup_date", { ascending: true });

    if (overlapError) {
      console.error("Availability check query error:", overlapError);
      return NextResponse.json(
        { error: "Unable to verify availability. Please try again." },
        { status: 500 }
      );
    }

    // 4. Return sanitized ranges
    const ranges = (overlapping || []).map((b) => ({
      pickupDate: b.pickup_date,
      returnDate: b.return_date,
    }));

    return NextResponse.json({ ranges }, { status: 200 });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Unable to verify availability. Please try again." },
      { status: 500 }
    );
  }
}

