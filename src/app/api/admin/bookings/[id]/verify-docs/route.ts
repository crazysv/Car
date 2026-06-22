import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify Authentication & Authorization
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Rate Limit: 30 requests per 5 minutes (same budget as admin status route)
    const rateLimitKey = `admin_verify_docs_${user.id}`;
    if (!checkRateLimit(rateLimitKey, 30, 300_000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // 2. Safe JSON parsing
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 3. Validate body shape
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as Record<string, unknown>).aadhaarVerified !== "boolean" ||
      typeof (body as Record<string, unknown>).dlVerified !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Both aadhaarVerified and dlVerified must be boolean values." },
        { status: 400 }
      );
    }

    const { aadhaarVerified, dlVerified } = body as {
      aadhaarVerified: boolean;
      dlVerified: boolean;
    };

    // 4. Initialize Service Role Client
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 5. Fetch current booking to capture previous state for rollback
    const { data: booking, error: fetchError } = await admin
      .from("bookings")
      .select("id, booking_ref, booking_status, aadhaar_verified, dl_verified, docs_verified_at, docs_verified_by")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const previousState = {
      aadhaar_verified: booking.aadhaar_verified as boolean,
      dl_verified: booking.dl_verified as boolean,
      docs_verified_at: booking.docs_verified_at as string | null,
      docs_verified_by: booking.docs_verified_by as string | null,
    };

    // 6. Build update payload
    const eitherVerified = aadhaarVerified || dlVerified;

    const updatePayload: Record<string, unknown> = {
      aadhaar_verified: aadhaarVerified,
      dl_verified: dlVerified,
      docs_verified_at: eitherVerified ? new Date().toISOString() : null,
      docs_verified_by: eitherVerified ? user.id : null,
    };

    const { error: updateError } = await admin
      .from("bookings")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Document verification update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update document verification. Please try again." },
        { status: 500 }
      );
    }

    // 7. Build audit note
    const aadhaarLabel = aadhaarVerified ? "Aadhaar verified" : "Aadhaar pending";
    const dlLabel = dlVerified ? "Driving Licence verified" : "Driving Licence pending";
    const auditNote = `Document verification updated: ${aadhaarLabel}, ${dlLabel}`;

    const currentStatus = (booking.booking_status as string) || "pending_payment";
    const { error: historyError } = await admin
      .from("booking_status_history")
      .insert({
        booking_id: id,
        status: currentStatus,
        note: auditNote,
        changed_by: user.id,
      });

    // 8. If audit insert fails, attempt rollback to previous document verification state
    if (historyError) {
      console.error("Document verification audit log error:", historyError);

      const { error: revertError } = await admin
        .from("bookings")
        .update(previousState)
        .eq("id", id);

      if (revertError) {
        console.error(
          "CRITICAL: Failed to rollback document verification after audit log failure:",
          revertError
        );
        return NextResponse.json(
          {
            error:
              "CRITICAL: Audit log failed AND state rollback failed. Manual intervention required.",
            inconsistent: true,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to write audit log. Document verification reverted." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Document verification route error:", err);
    return NextResponse.json(
      { error: "Failed to update document verification. Please try again." },
      { status: 500 }
    );
  }
}

