"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, CreditCard, Calendar, ChevronDown, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Header from "./components/Header"
import { useState, useEffect } from "react"

export default function Component() {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const getMenuItemClasses = (path: string) => {
    const baseClasses = "relative flex items-center gap-3 px-6 py-3 rounded-r-lg z-10 transition-colors"
    const activeClasses = "text-[#a07735]  bg-[#e2c799]"
    const inactiveClasses = "text-white group-hover:text-[#a07735] group-hover:bg-[#f5f1e8]"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const getCutoutClasses = (path: string) => {
    const baseClasses = "absolute -left-5 top-0 bottom-0 w-5 rounded-l-2xl transition-colors"
    return `${baseClasses} ${isActive(path) ? "bg-[#e2c799]" : "bg-transparent group-hover:bg-[#f5f1e8]"}`
  }

  const memberships = [
    {
      id: 1,
      price: "Rs. 15,000",
      image: "/membership/15000.png",
    },
    {
      id: 2,
      price: "Rs. 25,000",
      image: "/membership/25000.png",
    },
    {
      id: 3,
      price: "Rs. 35,000",
      image: "/membership/35000.png",
    },
    {
      id: 4,
      price: "Rs. 50,000",
      image: "/membership/50000.png",
    },
    {
      id: 5,
      price: "Rs. 65,000",
      image: "/membership/65000.png",
    },
    {
      id: 6,
      price: "Rs. 1,00,000",
      image: "/membership/100000.png",
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
        }}
      />
      {/* Subtle blurred circles */}
      <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full -z-10" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-10" />
      <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 rounded-full -z-10" />

      <Header />

      <div className="flex flex-col lg:flex-row items-start max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Sidebar - Exact styling from the design */}
        <aside
          className="w-full lg:w-[300px] h-auto lg:h-[520px] mt-6 lg:mt-12 mb-6 lg:mb-12 flex-shrink-0 flex flex-col"
          style={{ minWidth: 'auto' }}
        >
          <div className="bg-[#a07735] opacity-90 rounded-2xl h-full shadow-xl flex flex-col">
            {/* Profile Section */}
            <div className="p-4 md:p-6 pt-6 md:pt-8 flex flex-col items-center">
              <Avatar className="w-16 h-16 mb-6 bg-[#e5e7eb]">
                <AvatarFallback className="text-[#454545]">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#a07735] bg-transparent px-6 py-2 w-full"
                onClick={() => router.push('/signin')}
              >
                Login
              </Button>
            </div>

            {/* Navigation Menu */}
            <div className="px-4 pb-6 mt-4">
              {/* Home menu item */}
              <div className="relative mb-3 mx-5 w-full group">
                <div className={getCutoutClasses("/dashboard/memberships")}></div>
                <Link href="/dashboard/memberships" className={getMenuItemClasses("/dashboard/memberships")}>
                  <Home className="w-4 h-4" />
                  <span className="font-medium text-sm">Home</span>
                </Link>
              </div>

              {/* Regular menu items with hover effect */}
              <div className="space-y-3">
                <div className="relative mb-3 mx-5 w-full group">
                  <div className={getCutoutClasses("/dashboard/memberships")}></div>
                  <Link href="/dashboard/memberships" className={getMenuItemClasses("/dashboard/memberships")}>
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium text-sm">Memberships</span>
                  </Link>
                </div>
                <div className="relative mb-3 mx-5 w-full group">
                  <div className={getCutoutClasses("/ServiceBookingPage")}></div>
                  <Link href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`} className={getMenuItemClasses("/ServiceBookingPage")}>
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium text-sm">Bookings</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="mb-6 md:mb-8">
            <p className="text-[#454545] mb-4 font-inter">{"Here's everything you need to live the Ode Life, seamlessly."}</p>
            <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Available Memberships</h1>
            <p className="text-[#454545] font-inter">Explore our membership options</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {memberships.map((membership) => (
              <Card key={membership.id} className="overflow-hidden shadow-lg border-0 bg-white rounded-lg h-[320px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <CardContent className="p-0">
                  <div className="relative h-40">
                    <Image
                      src={membership.image || "/placeholder.svg"}
                      alt="Spa interior"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h1 className="text-lg font-semibold text-[#232323] mb-2">Ode Spa Membership</h1>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-[#a07735]">{membership.price}</span>
                      <Link href="#" className="text-[#9d8c6a] hover:text-[#454545] flex items-center text-sm font-medium">
                        View Details
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        className="relative w-[222px] h-[41px] bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Inter'] font-bold text-[14px] leading-[17px] text-center text-[#98564D]"
                        onClick={() => router.push('/signin')}
                      >
                        Take Membership
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
