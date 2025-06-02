"use client"

import { Activity, CalendarDays, Clock, Gift, Heart, SpadeIcon as Spa, Trophy, User2, Wifi, Home, CreditCard, Calendar, Bell, User, ChevronDown } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MembershipModal } from "@/components/membership-modal"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "@/app/components/Header"

interface CreditBalance {
  total: number;
  service: number;
  product: number;
  other: number;
  comments: string | null;
}

interface Membership {
  type: number;
  code: string;
  name: string;
  id: string;
  description: string | null;
  freeze_fee_reason_enabled: boolean;
}

interface Invoice {
  receipt_no: string;
  status: number;
  id: string;
  item_id: string;
  no: string;
}

interface Guest {
  personal_info: {
    first_name: string;
    last_name: string;
  };
}

interface GuestMembership {
  user_membership_id: string;
  status: number;
  is_refunded: boolean;
  membership: Membership;
  invoice: Invoice;
  expiry_date: string;
  credit_balance: CreditBalance;
  credit_amount: CreditBalance;
  member_since: string;
  guestpass_total: number;
  guestpass_balance: number;
  guest: Guest;
}

interface MembershipResponse {
  guest_memberships: GuestMembership[];
}

interface MembershipDetail {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: number;
  freeze_fee_reason_enabled: boolean;
  price?: {
    sales: number;
  };
}

const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    [-1]: 'All',
    [1]: 'Active',
    [2]: 'Inactive',
    [3]: 'Frozen',
    [4]: 'Cancelled',
    [5]: 'Expired',
    [6]: 'Closed',
    [7]: 'Not Started',
    [8]: 'Suspended',
    [9]: 'Refund',
    [10]: 'Deleted',
    [12]: 'Failed'
  };
  return statusMap[status] || 'Unknown';
};

const getStatusColor = (status: number): string => {
  const colorMap: Record<number, string> = {
    [1]: 'text-green-600',
    [2]: 'text-gray-600',
    [3]: 'text-blue-600',
    [4]: 'text-red-600',
    [5]: 'text-red-600',
    [6]: 'text-gray-600',
    [7]: 'text-yellow-600',
    [8]: 'text-orange-600',
    [9]: 'text-purple-600',
    [10]: 'text-gray-600',
    [12]: 'text-red-600'
  };
  return colorMap[status] || 'text-gray-600';
};

function MembershipDashboardContent() {
  const [membershipData, setMembershipData] = useState<GuestMembership | null>(null)
  const [membershipDetails, setMembershipDetails] = useState<MembershipDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMembership, setSelectedMembership] = useState<MembershipDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const { toast } = useToast()
  const admincenterId = '92d41019-c790-4668-9158-a693e531c1a4'
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userData')
      setUserData(null)
      router.push('/signin')
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      })
    }
  }

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

  useEffect(() => {
    // Get user data from localStorage
    try {
      const storedUserData = localStorage.getItem('userData')
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData)
        if (!parsedData.id || !parsedData.center_id) {
          throw new Error('Invalid user data format')
        }
        setUserData(parsedData)
      } else {
        throw new Error('No user data found')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load user data')
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user data. Please try logging in again.",
      })
    }
  }, [toast])

  const createMembershipInvoice = async (membershipId: string) => {
    try {
      if (!userData?.id || !admincenterId) {
        throw new Error('Guest ID and Center ID are required')
      }

      const response = await fetch('https://api.zenoti.com/v1/invoices/memberships', {
        method: 'POST',
        headers: {
          'Authorization': 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          center_id: admincenterId,
          user_id: userData.id,
          membership_ids: membershipId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create invoice')
      }

      return data
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  const handleMembershipClick = (membership: MembershipDetail) => {
    setSelectedMembership(membership)
    setIsModalOpen(true)
  }

  const handleConfirmMembership = async () => {
    if (!selectedMembership) return

    setIsProcessing(true)
    try {
      const data = await createMembershipInvoice(selectedMembership.id)
      toast({
        title: "Success",
        description: `Membership invoice created successfully!`,
      })
      setIsModalOpen(false)
      router.push(`/payment?invoice_id=${data.invoice_id}`)
      return data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create membership invoice",
      })
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        if (!userData?.id || !userData?.center_id) {
          setError('User data not found')
          setLoading(false)
          return
        }

        // Fetch guest memberships
        const membershipResponse = await fetch(
          `https://api.zenoti.com/v1/guests/${userData.id}/memberships?center_id=${userData.center_id}`,
          {
            headers: {
              'Authorization': 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
              'accept': 'application/json',
              'content-type': 'application/json'
            }
          }
        )

        if (!membershipResponse.ok) {
          throw new Error('Failed to fetch membership data')
        }

        const membershipData: MembershipResponse = await membershipResponse.json()
        if (membershipData.guest_memberships && membershipData.guest_memberships.length > 0) {
          setMembershipData(membershipData.guest_memberships[0])
        } else {
          setError('No membership data found')
        }

        // Fetch all memberships for the center
        const detailsResponse = await fetch(
          `https://api.zenoti.com/v1/centers/${admincenterId}/memberships?show_in_catalog=true`,
          {
            headers: {
              'Authorization': 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
              'accept': 'application/json',
              'content-type': 'application/json'
            }
          }
        )

        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch membership details')
        }

        const detailsData = await detailsResponse.json()
        const sortedMemberships = (detailsData.memberships || []).sort((a: MembershipDetail, b: MembershipDetail) => {
          const priceA = a.price?.sales || 0;
          const priceB = b.price?.sales || 0;
          return priceA - priceB;
        });
        setMembershipDetails(sortedMemberships)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (userData) {
      fetchMembershipData()
    }
  }, [userData])

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

  if (loading) {
    return (
      <DashboardLayout membershipType="membership">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading membership data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const expiryDate = membershipData?.expiry_date ? new Date(membershipData.expiry_date).toLocaleDateString() : 'N/A'
  const memberSince = membershipData?.member_since ? new Date(membershipData.member_since).toLocaleDateString() : 'N/A'

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
        {/* Sidebar */}
        <aside
          className="w-full lg:w-[300px] h-auto lg:h-[520px] mt-6 lg:mt-12 mb-6 lg:mb-12 flex-shrink-0 flex flex-col"
          style={{ minWidth: 'auto' }}
        >
          <div className="bg-[#a07735] opacity-90 rounded-2xl h-full shadow-xl flex flex-col">
            {/* Profile Section */}
            <div className="p-4 md:p-6 pt-6 md:pt-8 flex flex-col items-center">
              <Avatar className="w-16 h-16 mb-6 bg-[#e5e7eb]">
                <AvatarImage src="/spa.jpg" alt="User avatar" />
                <AvatarFallback className="text-[#454545]">
                  {userData?.first_name ? userData.first_name[0].toUpperCase() : <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-white font-medium text-sm">{userData?.first_name} {userData?.last_name}</p>
                <p className="text-white text-xs">{userData?.email}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="px-4 pb-6 mt-4">
              {/* Home menu item */}
              {/* <div className="relative mb-3 mx-5 w-full group">
                <div className={getCutoutClasses("/")}></div>
                <Link href="/" className={getMenuItemClasses("/")}>
                  <Home className="w-4 h-4" />
                  <span className="font-medium text-sm">Home</span>
                </Link>
              </div> */}

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
                  <div className={getCutoutClasses("/ServiceBookingPage?openModal=true")}></div>
                  <Link href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`} className={getMenuItemClasses("/ServiceBookingPage?openModal=true")}>
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
            <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Membership Dashboard</h1>
            <p className="text-[#454545] font-inter">Welcome to your Ode Life membership dashboard.</p>
          </div>

          {/* Membership Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="overflow-hidden shadow-lg border-0 bg-white rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#232323]">Membership Status</CardTitle>
                <User2 className="h-4 w-4 text-[#a07735]" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(membershipData?.status || 2)}`}>
                  {getStatusText(membershipData?.status || 2)}
                </div>
                <p className="text-xs text-[#454545]">Valid until {expiryDate}</p>
                <p className="text-xs text-[#454545]">Member since {memberSince}</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg border-0 bg-white rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#232323]">Credit Balance</CardTitle>
                <Gift className="h-4 w-4 text-[#a07735]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#a07735]">₹{membershipData?.credit_balance?.total?.toLocaleString()}</div>
                <p className="text-xs text-[#454545]">Available Credit</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-[#454545]">
                    <p>Services</p>
                    <p>₹{membershipData?.credit_balance?.service?.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-xs text-[#454545]">
                    <p>Products</p>
                    <p>₹{membershipData?.credit_balance?.product?.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-xs text-[#454545]">
                    <p>Other</p>
                    <p>₹{membershipData?.credit_balance?.other?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg border-0 bg-white rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#232323]">Membership Details</CardTitle>
                <Spa className="h-4 w-4 text-[#a07735]" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-[#232323]">{membershipData?.membership?.name}</div>
                <p className="text-xs text-[#454545]">Code: {membershipData?.membership?.code}</p>
                <p className="text-xs text-[#454545]">Receipt: {membershipData?.invoice?.receipt_no}</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Memberships Section */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Available Memberships</h2>
            <p className="text-[#454545] font-inter mb-6">Explore our membership options</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {membershipDetails.map((membership) => (
                <Card key={membership.id} className="overflow-hidden shadow-lg border-0 bg-white rounded-lg h-[300px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                  <CardContent className="p-0">
                    <div className="relative h-40 w-full min-w-0 min-h-0">
                      <Image
                        src={`/membership/${membership.price?.sales || 'default'}.png`}
                        alt="Ode Spa Membership"
                        fill
                        className="object-cover block"
                      />
                    </div>
                    <div className="p-4">
                      <h1 className="text-base font-semibold text-[#232323] mb-2">Ode Spa Membership</h1>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-[#a07735]">₹{membership.price?.sales?.toLocaleString()}</span>
                        <button
                          className="text-[#9d8c6a] hover:text-[#454545] flex items-center text-sm font-medium bg-transparent border-0 outline-none"
                          onClick={() => {
                            setSelectedMembership(membership)
                            setIsModalOpen(true)
                          }}
                        >
                          View Details
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                      <div className="flex justify-center mt-2">
                        <Button 
                          className="relative w-[200px] h-[36px] bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Inter'] font-bold text-[13px] leading-[17px] text-center text-[#98564D]"
                          onClick={() => {
                            setSelectedMembership(membership)
                            setIsModalOpen(true)
                          }}
                        >
                          Take Membership
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Rest of the content */}
          {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 overflow-hidden shadow-lg border-0 bg-white rounded-lg">
              <CardHeader>
                <CardTitle className="text-[#232323]">Upcoming Appointments</CardTitle>
                <CardDescription className="text-[#454545]">Your scheduled wellness sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4 bg-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2c799]">
                      <Spa className="h-6 w-6 text-[#a07735]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#232323]">Couple Day Spa Session</h3>
                      <p className="text-sm text-[#454545]">Hot Stone Therapy & Swedish Massage</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#232323]">July 10, 2025</div>
                      <div className="flex items-center justify-end text-sm text-[#454545]">
                        <Clock className="mr-1 h-3 w-3" /> 2:00 PM
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4 bg-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2c799]">
                      <User2 className="h-6 w-6 text-[#a07735]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#232323]">Yearly Wellness Check-up</h3>
                      <p className="text-sm text-[#454545]">Comprehensive Health Assessment</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#232323]">August 22, 2025</div>
                      <div className="flex items-center justify-end text-sm text-[#454545]">
                        <Clock className="mr-1 h-3 w-3" /> 9:30 AM
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="relative w-full h-[41px] bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Inter'] font-bold text-[14px] leading-[17px] text-center text-[#98564D]"
                >
                  Book New Appointment
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden shadow-lg border-0 bg-white rounded-lg">
              <CardHeader>
                <CardTitle className="text-[#232323]">Wellness Journey</CardTitle>
                <CardDescription className="text-[#454545]">Your wellness milestones and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e2c799]">
                      <Trophy className="h-5 w-5 text-[#a07735]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#232323]">30-Day Fitness Challenge</h3>
                      <p className="text-sm text-[#454545]">Completed on June 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e2c799]">
                      <Heart className="h-5 w-5 text-[#a07735]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#232323]">Heart Health Milestone</h3>
                      <p className="text-sm text-[#454545]">Achieved on May 1, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e2c799]">
                      <Activity className="h-5 w-5 text-[#a07735]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#232323]">Perfect Activity Week</h3>
                      <p className="text-sm text-[#454545]">Achieved on April 20, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </main>
      </div>

      {selectedMembership && (
        <MembershipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          membership={selectedMembership}
          onConfirm={handleConfirmMembership}
          loading={isProcessing}
        />
      )}
    </div>
  )
}

export default function MembershipDashboard() {
  return (
    <Suspense fallback={
      <DashboardLayout membershipType="membership">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading membership data...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <MembershipDashboardContent />
    </Suspense>
  )
}
