"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Section } from "@/components/section";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If a session was returned, the user is logged in immediately
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    // No session means email confirmation is required
    setConfirmationRequired(true);
    setLoading(false);
  }

  const fieldStyles =
    "w-full px-4 py-3 font-body-sm font-bold bg-surface border border-outline text-primary placeholder:text-outline/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200";

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Get Started
          </span>
          <h1 className="text-display-md text-white mb-4">Create Account</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Create your JP Rentals account to book vehicles and track your rentals.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-[28rem] mx-auto">
          <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10">
            {confirmationRequired ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                </div>
                <h2 className="font-headline-md text-primary mb-4">Check Your Email</h2>
                <p className="font-body-lg text-outline mb-8">
                  We&apos;ve sent a confirmation link to <strong className="text-primary">{email}</strong>.
                  Please check your inbox and confirm your account to get started.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-primary border border-outline-variant hover:bg-surface-container transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            ) : (
            <>
            <h2 className="font-headline-md text-primary mb-8 text-center">
              Create Your Account
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container text-sm font-bold border border-error/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block font-body-sm font-bold text-primary mb-2">
                  Email Address <span className="text-secondary">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={fieldStyles}
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-body-sm font-bold text-primary mb-2">
                  Password <span className="text-secondary">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className={fieldStyles}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-body-sm font-bold text-primary mb-2">
                  Confirm Password <span className="text-secondary">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  className={fieldStyles}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest text-on-primary bg-primary-container hover:opacity-90 transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant text-center">
              <p className="text-sm text-outline">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-primary hover:text-secondary transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
            </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
