import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: "Checkout | Luxury Spa & Wellness",
  description: "Checkout for your spa services. Access exclusive benefits and track your membership status.",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 