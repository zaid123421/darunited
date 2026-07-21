import type { Metadata } from "next";
import { AuthCard } from "@/modules/auth/components/auth-card";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCard>{children}</AuthCard>;
}
