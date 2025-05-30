"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, CreditCard, Calendar, ChevronDown, User, X, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Header from "./components/Header"
import { useState, useEffect } from "react"

export default function Component() {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMembership, setSelectedMembership] = useState<any>(null)

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('userData')
      if (storedData) {
        setUserData(JSON.parse(storedData))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === ""
    }
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

  // Modal component for membership details
  const MembershipModal = ({ membership, onClose }: { membership: any, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-[#9E5F45] p-4 rounded-t-2xl text-center relative">
          <h2 className="text-2xl font-marcellus text-white mb-1">Odespa Membership</h2>
        </div>
        <div className="px-0 pt-0 pb-0 rounded-t-2xl text-center relative">
        <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <button
              className="hover:text-[#a07735] text-lg font-bold font-inter flex items-center gap-2"
              onClick={onClose}
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-bold font-inter">Back</span>
            </button>
            <div className="flex-1 flex flex-col items-center">
             
              <h1 className="text-2xl font-bold font-marcellus mb-1">{membership.price}</h1>
            </div>
            <div className="w-[140px] flex justify-end">
              <Button
                className="bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] text-[#98564D] font-bold px-6 py-2 rounded-xl shadow-md"
                onClick={() => router.push('/signin')}
              >
                Take Membership
              </Button>
            </div>
          </div>
        </div>
        {/* Details Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-6 p-8 bg-white">
          
          {/* Benefits */}
          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🎁</span>
              <h1 className="font-semibold text-[#a07735] text-lg">Benefits</h1>
            </div>
            <ul className="list-disc ml-6 text-sm text-[#454545] space-y-1">
              <li>Flat 5% OFF on all subsequent bookings after redemption</li>
              <li>10% OFF on ODE skincare and wellness products</li>
              <li>Birthday month special: One free head massage</li>
            </ul>
          </div>
          {/* Terms */}
          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📜</span>
              <h1 className="font-semibold text-[#a07735] text-lg">Terms</h1>
            </div>
            <ul className="list-disc ml-6 text-sm text-[#454545] space-y-1">
              <li>Non-transferable</li>
              <li>Cannot be clubbed with other promotional offers</li>
              <li>Advance booking recommended on weekends</li>
            </ul>
          </div>
          {/* Discounts & Offers */}
          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">⭐</span>
              <h1 className="font-semibold text-[#a07735] text-lg">Discounts & Offers</h1>
            </div>
            <ul className="list-disc ml-6 text-sm text-[#454545] space-y-1">
              <li>Flat 5% OFF on all subsequent bookings after redemption</li>
              <li>10% OFF on ODE skincare and wellness products</li>
              <li>Birthday month special: One free head massage</li>
            </ul>
          </div>
          {/* Validity */}
          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">⏳</span>
              <h1 className="font-semibold text-[#a07735] text-lg">Validity</h1>
            </div>
            <ul className="list-disc ml-6 text-sm text-[#454545] space-y-1">
              <li>12 months from the date of activation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Modal for membership details */}
      {selectedMembership && (
        <MembershipModal
          membership={selectedMembership}
          onClose={() => setSelectedMembership(null)}
        />
      )}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a07735]"></div>
        </div>
      ) : (
        <>
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
                    <div className={getCutoutClasses("/")}></div>
                    <Link href="/" className={getMenuItemClasses("/")}>
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
                          <button
                            className="text-[#9d8c6a] hover:text-[#454545] flex items-center text-sm font-medium bg-transparent border-0 outline-none"
                            onClick={() => setSelectedMembership(membership)}
                          >
                            View Details
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </button>
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
        </>
      )}
    </div>
  )
}
