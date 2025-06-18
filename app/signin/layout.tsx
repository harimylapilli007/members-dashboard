import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Luxury Spa & Wellness",
  description: "Sign in to your account to book spa services, manage appointments, and access exclusive member benefits.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 