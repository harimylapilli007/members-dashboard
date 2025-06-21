"use client"

import React from "react"
import { useMobileNav } from "@/hooks/use-mobile-nav"
import { cn } from "@/lib/utils"

interface MobileLayoutWrapperProps {
  children: React.ReactNode
}

export default function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const { isVisible } = useMobileNav()

  return (
    <div className={cn(
      "min-h-screen",
      isVisible ? "pb-20" : "pb-0",
      "md:pb-0"
    )}>
      {children}
    </div>
  )
} 