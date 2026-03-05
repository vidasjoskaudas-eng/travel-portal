import { requireAuth } from "@/lib/auth-utils";

export default async function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
