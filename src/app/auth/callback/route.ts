import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If this was a password recovery flow, send user to reset-password page
      // so they can enter a new password while the recovery session is active.
      if (data.session?.user?.recovery_sent_at) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails or no code is present, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
