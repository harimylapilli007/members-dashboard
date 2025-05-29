"use client"

import type React from "react"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  membershipType: string
  fullName?: string
}

export function DashboardLayout({ children, membershipType, fullName }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-white">
      <div className="relative">
        {/* Outer pulsing circle */}
        <div className="absolute inset-0 animate-ping rounded-full bg-amber-200/30" />
        
        {/* Middle pulsing circle */}
        <div className="absolute inset-2 animate-pulse rounded-full bg-amber-300/40" />
        
        {/* Inner circle with text */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
          <span className="text-2xl font-bold text-white">Ode</span>
        </div>
      </div>
    </div>
  )
}
