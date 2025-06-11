"use client"

import { Button } from "@/components/ui/button"
import { Home, Bell, User, LogOut, ShoppingBag, ShoppingCart, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="z-10 flex items-center justify-between bg-white/20 backdrop-blur-md border-b border-white/20 shadow-lg px-4 md:px-6 lg:px-8 py-2 sticky top-0 max-w-[1305px] mx-auto rounded-2xl mt-4">
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="flex items-center">
          <Image
            src="/Logo.png"
            alt="Ode Spa Logo"
            width={200}
            height={200}
            className="w-[150px] sm:w-[180px] md:w-[200px] h-auto"
          />
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-[#454545] hover:text-[#a07735]"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-8">
          <Link 
            href={user ? "/dashboard/memberships" : "/"}
            className={cn(
              "relative px-3 lg:px-4 py-2 rounded-lg font-bold font-inter text-sm lg:text-base transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
              "hover:scale-105 hover:shadow-lg hover:outline hover:outline-2 hover:outline-[#a07735]",
              pathname?.includes('/dashboard/memberships') || pathname === '/' || pathname==="/payment"
                ? "text-[#a07735] before:bg-[#a07735]/20 before:backdrop-blur-sm before:border before:border-[#a07735]/20 outline outline-2 outline-[#a07735]"
                : "text-[#454545] hover:text-[#a07735] before:backdrop-blur-sm hover:before:bg-[#a07735]/20 hover:before:border-[#a07735]/30"
            )}
          >
            <span className="relative z-10 text-[14px] lg:text-[16px]">MEMBERSHIP</span>
          </Link>
          <Link 
            href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`}
            className={cn(
              "relative px-3 lg:px-4 py-2 rounded-lg font-bold font-inter text-sm lg:text-base transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
              "hover:scale-105 hover:shadow-lg hover:outline hover:outline-2 hover:outline-[#a07735]",
              pathname?.includes('/ServiceBookingPage') || pathname?.includes('/checkout') || pathname?.includes('/service')
                ? "text-[#a07735] before:bg-[#a07735]/20 before:backdrop-blur-sm before:border before:border-[#a07735]/20 outline outline-2 outline-[#a07735]"
                : "text-[#454545] hover:text-[#a07735] before:backdrop-blur-sm hover:before:bg-[#a07735]/20 hover:before:border-[#a07735]/30"
            )}
          >
            <span className="relative z-10 text-[14px] lg:text-[16px]">BOOKING</span>
          </Link>
          {user && (
            <Link 
              href="/view-bookings" 
              className={cn(
                "relative px-3 lg:px-4 py-2 rounded-lg font-bold font-inter text-sm lg:text-base transition-all duration-300",
                "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
                "hover:scale-105 hover:shadow-lg hover:outline hover:outline-2 hover:outline-[#a07735]",
                pathname?.includes('/view-bookings')
                  ? "text-[#a07735] before:bg-[#a07735]/20 before:backdrop-blur-sm before:border before:border-[#a07735]/20 outline outline-2 outline-[#a07735]"
                  : "text-[#454545] hover:text-[#a07735] before:backdrop-blur-sm hover:before:bg-[#a07735]/20 hover:before:border-[#a07735]/30"
              )}
            >
              <span className="relative z-10 text-[14px] lg:text-[16px]">VIEW BOOKINGS</span>
            </Link>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          {user ? (
            <Button 
              variant="outline" 
              className="border-[#a07735] text-[#a07735] bg-transparent w-28 lg:w-36 font-marcellus line-height-24 font-bold hover:bg-[#a07735] hover:text-white text-sm lg:text-base mr-4 lg:mr-8"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="bg-transparent text-[16px] lg:text-[20px] text-[#a07735] w-28 lg:w-36 font-marcellus line-height-24 hover:text-[#a07735] border-[#a07735]" 
                onClick={() => router.push('/signin')}
              >
                Login
              </Button>
              <Button 
                variant="outline"
                className="bg-[#a07735] text-[16px] lg:text-[20px] text-white hover:bg-[#a07735] w-28 lg:w-36 font-marcellus line-height-24 hover:text-white border-[#a07735] hover:scale-105 transition-transform duration-300" 
                onClick={() => router.push('/signin')}
              >
                Signup
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg md:hidden animate-slideDown z-50">
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                href="/dashboard/memberships" 
                className={cn(
                  "relative px-4 py-3 rounded-lg font-bold font-inter text-base transition-all duration-300 bg-white/50",
                  "hover:bg-[#a07735]/20 hover:text-[#a07735] hover:scale-[1.02] active:scale-[0.98]",
                  "transform hover:translate-x-1",
                  pathname?.includes('/dashboard/memberships') ? "text-[#a07735] bg-[#a07735]/20" : "text-[#454545]",
                  "animate-fadeIn"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  MEMBERSHIP
                </span>
              </Link>
              <Link 
                href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`}
                className={cn(
                  "relative px-4 py-3 rounded-lg font-bold font-inter text-base transition-all duration-300 bg-white/50",
                  "hover:bg-[#a07735]/20 hover:text-[#a07735] hover:scale-[1.02] active:scale-[0.98]",
                  "transform hover:translate-x-1",
                  (pathname?.includes('/ServiceBookingPage') || pathname?.includes('/checkout') || pathname?.includes('/service')) 
                    ? "text-[#a07735] bg-[#a07735]/20" 
                    : "text-[#454545]",
                  "animate-fadeIn"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  BOOKING
                </span>
              </Link>
              {user && (
                <Link 
                  href="/view-bookings" 
                  className={cn(
                    "relative px-4 py-3 rounded-lg font-bold font-inter text-base transition-all duration-300 bg-white/50",
                    "hover:bg-[#a07735]/20 hover:text-[#a07735] hover:scale-[1.02] active:scale-[0.98]",
                    "transform hover:translate-x-1",
                    pathname?.includes('/view-bookings') ? "text-[#a07735] bg-[#a07735]/20" : "text-[#454545]",
                    "animate-fadeIn"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    VIEW BOOKINGS
                  </span>
                </Link>
              )}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 animate-fadeIn">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-[#a07735] text-[#a07735] bg-white/50 font-marcellus font-bold hover:bg-[#a07735] hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/50 text-[#a07735] font-marcellus hover:bg-[#a07735] hover:text-white border-[#a07735] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
                      onClick={() => {
                        router.push('/signin')
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full bg-white/50 text-[#a07735] hover:bg-[#a07735] font-marcellus hover:text-white border-[#a07735] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
                      onClick={() => {
                        router.push('/signin')
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Signup
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
} 