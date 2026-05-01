import { ProtectedLayout } from "@/components/protected-layout";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
