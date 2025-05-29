"use client"

import { Button } from "@/components/ui/button"
import { Home, Bell, User, LogOut } from "lucide-react"
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

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Clear the auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      // Clear user data from localStorage
      localStorage.removeItem('userData')
      localStorage.removeItem('guestId')
      toast({
        title: "Success",
        description: "Successfully logged out",
      })
      router.push('/signin')
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
    <header className="bg-white border-b border-[#ced4da] px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-[#a07735] rounded-full flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=30&width=30&query=gold lotus flower icon"
              alt="Ode Spa Logo"
              width={30}
              height={30}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[#a07735] font-bold text-xl leading-tight">ODE SPA</span>
            <span className="text-[#9d8c6a] text-xs">SPA.WELLNESS</span>
          </div>
        </div>

        <nav className="flex items-center gap-4 md:gap-8">
          <Link href="#" className="text-[#454545] hover:text-[#a07735] font-medium text-sm md:text-base">
            SERVICES
          </Link>
          <Link href="#" className="text-[#454545] hover:text-[#a07735] font-medium text-sm md:text-base">
            MEMBERSHIP
          </Link>
          <Link href="#" className="text-[#454545] hover:text-[#a07735] font-medium text-sm md:text-base">
            BOOKING
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="text-[#a07735]">
            <Home className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#a07735]">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#a07735]">
            <User className="w-5 h-5" />
          </Button>
          {user ? (
            <Button 
              variant="outline" 
              className="border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white text-sm md:text-base"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white text-sm md:text-base" 
                onClick={() => router.push('/signin')}
              >
                Login
              </Button>
              <Button 
                className="bg-[#a07735] hover:bg-[#8a6930] text-white text-sm md:text-base" 
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