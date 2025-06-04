"use client"

import { Button } from "@/components/ui/button"
import { Home, Bell, User, LogOut, ShoppingBag, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'

export default function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {}

  const handleLogout = async () => {
    try {
      // First clear all local storage data
      localStorage.removeItem('userData')
      localStorage.removeItem('guestId')
      localStorage.removeItem('dashboardParams')
      localStorage.removeItem('selectedArea')
      localStorage.removeItem('bookingFor')
      localStorage.removeItem('selectedCategory')
      localStorage.removeItem('selectedLocation')
      
      // Clear the auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      
      // Then sign out from Firebase
      await signOut(auth)
      
      // Finally use the auth context logout
      await logout()
      
      toast({
        title: "Success",
        description: "Successfully logged out",
      })
      
      // Force a hard refresh to clear any cached state
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  return (
    //  <header className="bg-white border-b border-[#ced4da] px-4 md:px-6 py-2">
     <header className="bg-white/10 backdrop-blur-sm px-4 md:px-6 py-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-2">
          {/* <div className="w-12 h-12 bg-[#a07735] rounded-full flex items-center justify-center"> */}
            <Image
              src="/Logo.png"
              alt="Ode Spa Logo"
              width={200}
              height={200}
            />
          {/* </div> */}
          {/* <div className="flex flex-col">
            <span className="text-[#a07735] font-bold text-xl leading-tight">ODE SPA</span>
            <span className="text-[#9d8c6a] text-xs">SPA.WELLNESS</span>
          </div> */}
        </div>

        <nav className="flex items-center gap-4 md:gap-8">
          {/* <Link href="#" className="text-[#454545] hover:text-[#a07735] font-bold font-inter text-sm md:text-base">
            SERVICES
          </Link> */}
          <Link href="/dashboard/memberships" className="text-[#454545] hover:text-[#a07735] font-bold font-inter text-sm md:text-base">
            MEMBERSHIP
          </Link>
          <Link href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`} className="text-[#454545] hover:text-[#a07735] font-bold font-inter text-sm md:text-base">
            BOOKING
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-6">
          
          {/* <Link href="" className="text-[#a07735] hover:text-[#8a6930]">
            <ShoppingCart className="w-6 h-6 font-bold" fill="currentColor" />
          </Link>
           */}
          {user ? (
            <Button 
              variant="outline" 
              className="border-[#a07735] text-[#a07735] w-36 font-manrope line-height-24 font-bold hover:bg-[#a07735] hover:text-white text-sm md:text-base mr-8"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-[#a07735] text-[#a07735] text-[20px] w-36 font-manrope line-height-24 font-400 hover:bg-[#a07735] hover:text-white " 
                onClick={() => router.push('/signin')}
              >
                Login
              </Button>
              <Button 
                variant="outline"
                className="bg-[#a07735] text-[20px] hover:bg-[#ffffff] w-36 font-manrope line-height-24 font-400 hover:text-[#a07735] border-[#a07735] text-white " 
                onClick={() => router.push('/signin')}
              >
                Signup
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 