"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Section } from "@/components/section";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  // On mount, verify the user has a valid recovery session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionValid(!!user);
    });
  }, []);

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
    const { error: authError } = await supabase.auth.updateUser({
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const fieldStyles =
    "w-full px-4 py-3 font-body-sm font-bold bg-surface border border-outline text-primary placeholder:text-outline/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200";

  // Loading state while checking session
  if (sessionValid === null) {
    return (
      <>
        <Section variant="dark" className="!py-0">
          <div className="py-14 md:py-24 text-center">
            <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
              Account Recovery
            </span>
            <h1 className="text-display-md text-white mb-4">Set New Password</h1>
            <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
              Verifying your recovery session...
            </p>
          </div>
        </Section>
        <Section variant="default">
          <div className="max-w-[28rem] mx-auto">
            <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10 flex justify-center">
              <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Account Recovery
          </span>
          <h1 className="text-display-md text-white mb-4">Set New Password</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            {sessionValid
              ? "Enter your new password below to complete the reset."
              : "Your recovery session has expired or is invalid."}
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-[28rem] mx-auto">
          <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10">
            {!sessionValid ? (
              /* Invalid / expired recovery session */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">link_off</span>
                </div>
                <h2 className="font-headline-md text-primary mb-4">
                  Recovery Link Expired
                </h2>
                <p className="font-body-lg text-outline mb-8">
                  This password reset link is no longer valid. Recovery links expire after a short time for security. Please request a new one.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-on-primary bg-primary-container hover:opacity-90 transition-all shadow-md active:scale-95"
                  >
                    Request New Link
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-primary border border-outline-variant hover:bg-surface-container transition-all"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : success ? (
              /* Password updated successfully */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h2 className="font-headline-md text-primary mb-4">Password Updated</h2>
                <p className="font-body-lg text-outline mb-8">
                  Your password has been changed successfully. You can now sign in with your new password.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-on-primary bg-primary-container hover:opacity-90 transition-all shadow-md active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              /* Password reset form */
              <>
                <h2 className="font-headline-md text-primary mb-4 text-center">
                  Create New Password
                </h2>
                <p className="font-body-sm text-outline text-center mb-8">
                  Choose a strong password that you haven&apos;t used before.
                </p>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 text-sm font-bold border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block font-body-sm font-bold text-primary mb-2">
                      New Password <span className="text-secondary">*</span>
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
                      Confirm New Password <span className="text-secondary">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
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
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-outline-variant text-center">
                  <p className="text-sm text-outline">
                    Remember your password?{" "}
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
