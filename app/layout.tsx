import type React from "react"
import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const GTM_ID = 'GTM-PD4SGRDF'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "ODE SPA",
  description: "Luxury spa treatments and wellness services",
  generator: 'v0.dev',
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
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
