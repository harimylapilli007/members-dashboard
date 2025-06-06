"use client"

import { Button } from "@/components/ui/button"
import { Home, Bell, User, LogOut, ShoppingBag, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'
import { cn } from "@/lib/utils"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
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
     <header className="z-10 flex items-center justify-between bg-white/20 backdrop-blur-md border-b border-white/20 shadow-lg px-4 md:px-6 py-2 sticky top-0 max-w-[1305px] mx-auto rounded-2xl mt-4">
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="flex items-center">
            <Image
              src="/Logo.png"
              alt="Ode Spa Logo"
              width={200}
              height={200}
            />
        </Link>

        <nav className="flex items-center gap-4 md:gap-8">
          {/* <Link href="#" className="text-[#454545] hover:text-[#a07735] font-bold font-inter text-sm md:text-base">
            SERVICES
          </Link> */}
          <Link 
            href="/dashboard/memberships" 
            className={cn(
              "relative px-4 py-2 rounded-lg font-bold font-inter text-sm md:text-base transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
              "hover:scale-105 hover:shadow-lg hover:outline hover:outline-2 hover:outline-[#a07735]",
              pathname?.includes('/dashboard/memberships')
                ? "text-white before:bg-[#a07735]/80 before:backdrop-blur-md before:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] before:border before:border-[#a07735]/30"
                : "text-[#454545] hover:text-[#a07735] before:backdrop-blur-sm hover:before:border-[#a07735]/30"
            )}
          >
            <span className="relative z-10 text-[16px]">MEMBERSHIP</span>
          </Link>
          <Link 
            href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`}
            className={cn(
              "relative px-4 py-2 rounded-lg font-bold font-inter text-sm md:text-base transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
              "hover:scale-105 hover:shadow-lg hover:outline hover:outline-2 hover:outline-[#a07735]",
              pathname?.includes('/ServiceBookingPage')
                ? "text-white before:bg-[#a07735]/80 before:backdrop-blur-md before:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] before:border before:border-[#a07735]/30"
                : "text-[#454545] hover:text-[#a07735] before:backdrop-blur-sm hover:before:border-[#a07735]/30"
            )}
          >
            <span className="relative z-10 text-[16px]">BOOKING</span>
          </Link>
          {user && (
          <Link 
            href="/view-bookings" 
            className={cn(
              "relative px-4 py-2 rounded-lg font-bold font-inter text-sm md:text-base transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
              "hover:scale-105 hover:shadow-lg hover:outline hover:outline-2 hover:outline-[#a07735]",
              pathname?.includes('/view-bookings')
                ? "text-white before:bg-[#a07735]/80 before:backdrop-blur-md before:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] before:border before:border-[#a07735]/30"
                : "text-[#454545] hover:text-[#a07735] before:backdrop-blur-sm hover:before:border-[#a07735]/30"
            )}
          >
            <span className="relative z-10 text-[16px]">VIEW BOOKINGS</span>
          </Link>
          )}
        </nav>


        <div className="flex items-center gap-4">
          
          {/* <Link href="" className="text-[#a07735] hover:text-[#8a6930]">
            <ShoppingCart className="w-6 h-6 font-bold" fill="currentColor" />
          </Link>
           */}
          {user ? (
            <Button 
              variant="outline" 
              className="border-[#a07735] text-[#a07735] w-36 font-marcellus line-height-24 font-bold hover:bg-[#a07735] hover:text-white text-sm md:text-base mr-8"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-[#a07735] text-[#a07735] text-[20px] w-36 font-marcellus line-height-24 hover:bg-[#a07735] hover:text-white " 
                onClick={() => router.push('/signin')}
              >
                Login
              </Button>
              <Button 
                variant="outline"
                className="bg-[#a07735] text-[20px] hover:bg-[#ffffff] w-36 font-marcellus line-height-24 hover:text-[#a07735] border-[#a07735] text-white " 
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