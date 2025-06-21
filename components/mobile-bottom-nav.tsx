"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useMobileNav } from "@/hooks/use-mobile-nav"
import { useAuth } from "@/lib/auth-context"
import { 
  Home, 
  ShoppingBag, 
  Calendar, 
  Heart,
  User
} from "lucide-react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { isVisible } = useMobileNav()
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('userData')
      if (storedData) {
        setUserData(JSON.parse(storedData))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  const mainNavigationItems = [
  
    {
      name: "Membership",
      href: "/dashboard/memberships",
      icon: ShoppingBag,
    },
    {
      name: "Booking",
      href: localStorage.getItem('selectedArea') ? `/ServiceBookingPage?guestId=${user?.uid || userData?.id}` : `/ServiceBookingPage?openModal=true&guestId=${user?.uid || userData?.id}`,
      icon: Calendar,
    },
    // Only show these items when user is logged in
    ...(user ? [
      {
        name: "View Bookings",
        href: "/view-bookings",
        icon: Heart,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
    ] : []),
  ]

  // Don't show navigation if not visible or not logged in
  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-md border-t border-white/20 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavigationItems.map((item) => {
            const isActive = item.href !== "#" && (
              pathname === item.href || 
              (item.href !== "/" && pathname?.startsWith(item.href)) ||
              (item.name === "Booking" && pathname?.includes('/ServiceBookingPage'))
            )
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                  "hover:bg-gray-100/50 active:scale-95",
                  isActive 
                    ? "text-[#a07735] bg-[#a07735]/10" 
                    : "text-gray-600 hover:text-[#a07735]"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 mb-1",
                    isActive ? "text-[#a07735]" : "text-gray-600"
                  )} 
                />
                <span className={cn(
                  "text-sm font-bold truncate max-w-full",
                  isActive ? "text-[#a07735]" : "text-gray-600"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 