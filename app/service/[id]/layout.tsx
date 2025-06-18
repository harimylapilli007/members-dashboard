import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Details | Luxury Spa & Wellness",
  description: "Book premium spa treatments, massages, facials, and wellness services at our luxury spa locations.",
};

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 