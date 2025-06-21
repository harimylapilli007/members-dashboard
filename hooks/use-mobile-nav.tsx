"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

// Pages where bottom navigation should be hidden
const hiddenPages = [
  '/signin',
  '/register',
  '/checkout',
  '/payment',
]

export function useMobileNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const shouldHide = hiddenPages.some(page => pathname?.startsWith(page))
    setIsVisible(!shouldHide)
  }, [pathname])

  return { isVisible }
} 