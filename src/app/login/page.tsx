"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Section } from "@/components/section";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    callbackError === "auth_callback_failed"
      ? "Authentication failed. Please try again."
      : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  const fieldStyles =
    "w-full px-4 py-3 font-body-sm font-bold bg-surface border border-outline text-primary placeholder:text-outline/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200";

  return (
    <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10">
      <h2 className="font-headline-md text-primary mb-8 text-center">
        Sign In to Your Account
      </h2>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 text-sm font-bold border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block font-body-sm font-bold text-primary mb-2"
          >
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
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block font-body-sm font-bold text-primary"
            >
              Password <span className="text-secondary">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-secondary hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant text-center">
        <p className="text-sm text-outline">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-primary hover:text-secondary transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Welcome Back
          </span>
          <h1 className="text-display-md text-white mb-4">Sign In</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Sign in to your JP Rentals account to manage your bookings.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-[28rem] mx-auto">
          <Suspense
            fallback={
              <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10 text-center">
                <span className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
