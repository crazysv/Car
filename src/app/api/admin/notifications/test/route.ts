import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { checkEmailConfiguration } from "@/lib/mailer";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST() {
  try {
    // 1. Verify Authentication & Authorization
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Check Configuration
    const config = checkEmailConfiguration();
    if (!config.configured) {
      return NextResponse.json(
        { error: "Email is not fully configured. Check environment variables." },
        { status: 400 }
      );
    }

    // 3. Send Test Email
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { data, error } = await resend.emails.send({
      from: `JP Rentals <${process.env.BOOKING_FROM_EMAIL}>`,
      to: process.env.ADMIN_NOTIFICATION_EMAIL!,
      subject: "[JP Rentals] Test Notification",
      html: `
        <h2>Test Notification</h2>
        <p>This is a test notification to verify that emails are configured correctly.</p>
        <p>Site URL: <a href="${process.env.NEXT_PUBLIC_SITE_URL}">${process.env.NEXT_PUBLIC_SITE_URL}</a></p>
      `,
    });

    if (error) {
      console.error("Test email error from provider:", error);
      return NextResponse.json(
        { error: "Provider rejected the test email. Check server logs." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Test notification route error:", err);
    return NextResponse.json(
      { error: "Failed to send test email. Please try again." },
      { status: 500 }
    );
  }
}
