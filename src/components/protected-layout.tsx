import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side layout wrapper for authenticated pages.
 * Redirects unauthenticated users to /login?next=<full-destination>
 * preserving both pathname and search params so they return after login.
 *
 * Usage in a layout.tsx:
 *   import { ProtectedLayout } from "@/components/protected-layout";
 *   export default function AccountLayout({ children }) {
 *     return <ProtectedLayout>{children}</ProtectedLayout>;
 *   }
 */
export async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // x-next-pathname is set as a REQUEST header by the session refresh helper,
    // making it readable here via headers(). It includes pathname + search params.
    const headerList = await headers();
    const destination = headerList.get("x-next-pathname") ?? "/";
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }

  return <>{children}</>;
}
