import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const headerList = await headers();
    const destination = headerList.get("x-next-pathname") ?? "/admin/bookings";
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }

  if (!isAdminEmail(user.email)) {
    redirect("/"); // Or perhaps to an unauthorized page, but redirecting to home is standard
  }

  return <>{children}</>;
}
