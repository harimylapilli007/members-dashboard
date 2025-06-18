import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed | Luxury Spa & Wellness",
  description: "We're sorry, but your payment could not be processed. Please try again or contact our support team.",
};

export default function PaymentFailureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 