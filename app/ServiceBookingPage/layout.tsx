import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Services | Luxury Spa & Wellness",
  description: "Book premium spa treatments, massages, facials, and wellness services at our luxury spa locations.",
};

export default function ServiceBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 