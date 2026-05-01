"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Section } from "@/components/section";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
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

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Account Recovery
          </span>
          <h1 className="text-display-md text-white mb-4">Reset Password</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-[28rem] mx-auto">
          <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10">
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                </div>
                <h2 className="font-headline-md text-primary mb-4">Check Your Email</h2>
                <p className="font-body-lg text-outline mb-8">
                  We&apos;ve sent a password reset link to <strong className="text-primary">{email}</strong>.
                  Please check your inbox and follow the instructions.
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
                <h2 className="font-headline-md text-primary mb-4 text-center">
                  Forgot Your Password?
                </h2>
                <p className="font-body-sm text-outline text-center mb-8">
                  No worries. Enter the email address associated with your account and we&apos;ll send you a reset link.
                </p>

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest text-on-primary bg-primary-container hover:opacity-90 transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
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
