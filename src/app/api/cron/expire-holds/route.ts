import { NextResponse } from "next/server";
import { expireStaleBookings } from "@/lib/jobs";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const secretQuery = url.searchParams.get("secret");
  const vercelHeader = request.headers.get("x-vercel-cron");

  // Require explicit match against CRON_SECRET via Bearer, header, or query param
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    vercelHeader !== process.env.CRON_SECRET &&
    secretQuery !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limit: 2 requests per 5 minutes (300,000 ms) after auth
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitKey = `cron_expire_${ip}`;
  if (!checkRateLimit(rateLimitKey, 2, 300_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const result = await expireStaleBookings();
    return NextResponse.json({ success: true, expiredCount: result.count });
  } catch (error) {
    console.error("Cron expiry error:", error);
    return NextResponse.json(
      { error: "Failed to expire bookings" },
      { status: 500 }
    );
  }
}
