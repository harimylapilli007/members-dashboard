"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

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
        
        {/* Inner circle with logo */}
        <div className="relative flex h-48 w-48 items-center justify-center rounded-full ">
          <Image
            src="/loading_logo.png"
            alt="Loading Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}
