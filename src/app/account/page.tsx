import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/section";
import { AccountForm } from "@/components/account-form";

export const metadata: Metadata = {
  title: "My Account | JP Rentals",
  description: "Manage your JP Rentals account profile.",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null; // ProtectedLayout handles redirect
  }

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // If the read fails due to missing row, we safely backfill utilizing the service role.
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: newProfile, error: insertError } = await admin
      .from("profiles")
      .insert({ id: user.id, email: user.email! })
      .select()
      .single();

    if (!insertError) {
      profile = newProfile;
      error = null;
    }
  }

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-20 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Settings
          </span>
          <h1 className="text-display-md text-white mb-3">
            My Account
          </h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Update your profile and contact information.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-[36rem] mx-auto w-full px-4 md:px-0">
          {error || !profile ? (
            <div className="text-center py-12 bg-surface-container-lowest border border-red-100 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-red-400">error</span>
              </div>
              <h2 className="font-headline-md text-primary mb-2">Unable to Load Profile</h2>
              <p className="text-outline text-sm">We couldn&apos;t retrieve your account details right now. Please try again later.</p>
            </div>
          ) : (
            <AccountForm profile={profile} />
          )}
        </div>
      </Section>
    </>
  );
}
