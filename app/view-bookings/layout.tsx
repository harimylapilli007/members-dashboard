import { Metadata } from "next";

export const metadata: Metadata = {
  title: "View Bookings | Luxury Spa & Wellness",
  description: "View and manage your spa appointments and bookings. Check your upcoming and past treatments.",
};

export default function ViewBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 