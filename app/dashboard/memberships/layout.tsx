import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: "Memberships | Luxury Spa & Wellness",
  description: "View and manage your spa memberships. Access exclusive benefits and track your membership status.",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function MembershipsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 