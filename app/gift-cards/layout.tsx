import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gift Cards | ODE SPA",
  description: "Purchase gift cards for spa treatments and wellness services",
}

export default function GiftCardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 