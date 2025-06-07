import type React from "react"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "ODE SPA",
  description: "Luxury spa treatments and wellness services",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: [
      { url: '/loading_logo.png', sizes: '32x32' },
      { url: '/loading_logo.png', sizes: '64x64' },
      { url: '/loading_logo.png', sizes: '96x96' },
      { url: '/loading_logo.png', sizes: '128x128' },
      { url: '/loading_logo.png', sizes: '192x192' },
      { url: '/loading_logo.png', sizes: '256x256' },
      { url: '/loading_logo.png', sizes: '512x512' }
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
