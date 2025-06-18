import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment | Luxury Spa & Wellness",
  description: "Your payment has been processed successfully. Thank you for choosing our premium spa services.",
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 