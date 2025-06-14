"use client"

import { Activity, CalendarDays, Clock, Gift, Heart, SpadeIcon as Spa, Trophy, User2, Wifi, Home, CreditCard, Calendar, Bell, User, ChevronDown, ChevronLeft, CheckCircle } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Header from "@/app/components/Header"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatPrice } from "@/app/utils/formatPrice"

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [showFirstOffer, setShowFirstOffer] = useState(true)
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
    const baseClasses = "relative flex items-center gap-3 px-6 py-6 rounded-r-lg z-10 transition-colors"
    const activeClasses = "text-[#a07735] bg-[#ecebe9]"
    const inactiveClasses = "text-white group-hover:text-[#a07735] group-hover:bg-[#ecebe9]"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const getCutoutClasses = (path: string) => {
    const baseClasses = "absolute -left-5 top-0 bottom-0 w-5 rounded-l-2xl transition-colors "
    return `${baseClasses} ${isActive(path) ? "bg-[#ecebe9]" : "bg-transparent group-hover:bg-[#f5f1e8]"}`
  }

  useEffect(() => {
    try {
      // Get user data from localStorage
      const storedUserData = localStorage.getItem('userData')
      if (storedUserData) {
        const userData = JSON.parse(storedUserData)
        setUserData(userData)
      } else {
        throw new Error('No user data found')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to view your memberships.",
      })
      router.push('/signin')
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFirstOffer(prev => !prev)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleMembershipClick = (membership: MembershipDetail) => {
    setSelectedMembership(membership)
    setIsDetailsModalOpen(true)
  }

  const handleTakeMembership = async (membership: MembershipDetail) => {
    setIsProcessing(true)
    try {
      // Get membership name based on price
      const membershipName = membership.price?.sales === 15000 ? "Bronze Membership" :
        membership.price?.sales === 25000 ? "Silver Membership" :
        membership.price?.sales === 35000 ? "Gold Membership" :
        membership.price?.sales === 50000 ? "Platinum Membership" :
        membership.price?.sales === 65000 ? "Diamond Membership" :
        membership.price?.sales === 100000 ? "Ode Signature Elite" :
        "Ode Spa Membership"

      // Encode parameters for URL
      const params = new URLSearchParams({
        membership_id: membership.id,
        membership_name: membershipName,
        price: membership.price?.sales?.toString() || '0'
      })

      router.push(`/payment?${params.toString()}`)
    } catch (error) {
      console.error('Error processing membership:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process membership. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmMembership = async () => {
    if (!selectedMembership) return
    setIsProcessing(true)
    try {
      // Get membership name based on price
      const membershipName = selectedMembership.price?.sales === 15000 ? "Bronze Membership" :
        selectedMembership.price?.sales === 25000 ? "Silver Membership" :
        selectedMembership.price?.sales === 35000 ? "Gold Membership" :
        selectedMembership.price?.sales === 50000 ? "Platinum Membership" :
        selectedMembership.price?.sales === 65000 ? "Diamond Membership" :
        selectedMembership.price?.sales === 100000 ? "Ode Signature Elite" :
        "Ode Spa Membership"

      // Encode parameters for URL
      const params = new URLSearchParams({
        membership_id: selectedMembership.id,
        membership_name: membershipName,
        price: selectedMembership.price?.sales?.toString() || '0'
      })

      setIsModalOpen(false)
      setIsDetailsModalOpen(false)
      router.push(`/payment?${params.toString()}`)
    } catch (error) {
      console.error('Error processing membership:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process membership. Please try again.",
      })
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

  if (isProcessing) {
    return (
      <DashboardLayout membershipType="membership">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>Processing your membership purchase...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-30"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          minHeight: "100vh",
          width: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-40"
        style={{
          background: "linear-gradient(120deg, rgba(245, 241, 232, 0.85) 0%, rgba(229, 231, 235, 0.85) 60%, rgba(178, 213, 228, 0.85) 100%)"
        }}
      />
      {/* Subtle blurred circles */}
      <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full blur-sm -z-30" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />
      <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 blur-3xl rounded-full -z-30" />

      <Header />

      <div className="flex flex-col lg:flex-row items-start max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Sidebar */}
        {/* <aside
          className="w-full lg:w-[300px] h-auto lg:h-[520px] mt-6 lg:mt-12 mb-6 lg:mb-12 flex-shrink-0 flex flex-col"
          style={{ minWidth: 'auto' }}
        >
          <div className="bg-[#a07735] opacity-90 rounded-2xl h-full shadow-xl flex flex-col">
          
            <div className="p-4 md:p-6 pt-6 md:pt-8 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <Avatar className="w-16 h-16 mb-2 bg-[#e5e7eb]">
                  <AvatarFallback className="text-[#454545] text-xl font-medium">
                    {userData?.first_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">
                  {userData?.first_name || 'User'}
                </span>
              </div>
            </div>

            
            <div className="px-4 pb-6 mt-4">
             

             
              <div className="space-y-3">
                <div className="relative mb-3 mx-5 w-full group ">
                  <div className={getCutoutClasses("/dashboard/memberships")}></div>
                  <Link href="/dashboard/memberships" className={getMenuItemClasses("/dashboard/memberships")}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-[#a07735]">
                  <path d="M3.84667 2.5H16.1542C16.5375 2.5 16.8575 2.62861 17.1142 2.88584C17.3708 3.14306 17.4994 3.46306 17.5 3.84583V11.9875C17.5 12.3708 17.3714 12.6908 17.1142 12.9475C16.8569 13.2042 16.5369 13.3328 16.1542 13.3333H12.4358V16.8917L10 15.6725L7.56417 16.89V13.3333H3.84667C3.46278 13.3333 3.1425 13.205 2.88583 12.9483C2.62917 12.6917 2.50056 12.3714 2.5 11.9875V3.84583C2.5 3.4625 2.62861 3.14222 2.88583 2.885C3.14306 2.62778 3.46306 2.49945 3.84583 2.5M3.33333 10.4808H16.6667V8.68584H3.33333V10.4808Z" fill="currentColor"/>
                  </svg>
                    <span className="font-medium  text-md">Memberships</span>
                  </Link>
                </div>
                <div className="relative mb-3 mx-5 w-full group">
                  <div className={getCutoutClasses("/ServiceBookingPage?openModal=true")}></div>
                  <Link href={`/ServiceBookingPage?openModal=true&guestId=${userData?.id}`} className={getMenuItemClasses("/ServiceBookingPage?openModal=true")}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-[#a07735]">
                  <path d="M1.66699 15.8327C1.66699 17.2493 2.75033 18.3327 4.16699 18.3327H15.8337C17.2503 18.3327 18.3337 17.2493 18.3337 15.8327V9.16602H1.66699V15.8327ZM15.8337 3.33268H14.167V2.49935C14.167 1.99935 13.8337 1.66602 13.3337 1.66602C12.8337 1.66602 12.5003 1.99935 12.5003 2.49935V3.33268H7.50033V2.49935C7.50033 1.99935 7.16699 1.66602 6.66699 1.66602C6.16699 1.66602 5.83366 1.99935 5.83366 2.49935V3.33268H4.16699C2.75033 3.33268 1.66699 4.41602 1.66699 5.83268V7.49935H18.3337V5.83268C18.3337 4.41602 17.2503 3.33268 15.8337 3.33268Z" fill="currentColor"/>
                  </svg>
                    <span className="font-medium text-md text-[#ffffff] group-hover:text-black">Bookings</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside> */}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="mb-6 md:mb-8 max-w-[1100px] mx-auto">
            <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Membership Dashboard</h1>
            <h2 className="text-[#454545] font-inter">Welcome to your Ode Life membership dashboard.</h2>
          </div>

          {/* Membership Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8 max-w-[1100px] mx-auto">
            {/* Membership Status Card */}
            <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm flex flex-col justify-center p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex flex-row items-center w-full">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#e2c799] mr-6">
                <svg width="34" height="24" viewBox="0 0 34 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.2305 4.96094C18.8984 4.55078 19.3438 3.80664 19.3438 2.96875C19.3438 1.67383 18.2949 0.625 17 0.625C15.7051 0.625 14.6562 1.67383 14.6562 2.96875C14.6562 3.8125 15.1016 4.55078 15.7695 4.96094L12.4121 11.6758C11.8789 12.7422 10.4961 13.0469 9.56445 12.3027L4.34375 8.125C4.63672 7.73242 4.8125 7.24609 4.8125 6.71875C4.8125 5.42383 3.76367 4.375 2.46875 4.375C1.17383 4.375 0.125 5.42383 0.125 6.71875C0.125 8.01367 1.17383 9.0625 2.46875 9.0625C2.48047 9.0625 2.49805 9.0625 2.50977 9.0625L5.1875 23.793C5.50977 25.5742 7.0625 26.875 8.87891 26.875H25.1211C26.9316 26.875 28.4844 25.5801 28.8125 23.793L31.4902 9.0625C31.502 9.0625 31.5195 9.0625 31.5312 9.0625C32.8262 9.0625 33.875 8.01367 33.875 6.71875C33.875 5.42383 32.8262 4.375 31.5312 4.375C30.2363 4.375 29.1875 5.42383 29.1875 6.71875C29.1875 7.24609 29.3633 7.73242 29.6562 8.125L24.4355 12.3027C23.5039 13.0469 22.1211 12.7422 21.5879 11.6758L18.2305 4.96094Z" fill="#A07735"/>
                </svg>

                </div>
                <div className="flex flex-col">
                  <div className="font-semibold font-marcellus text-lg text-[#232323]">Membership Status</div>
                  <div className="flex mt-2">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${membershipData?.status === 1 ? 'bg-[#afebb1] text-[#214d23]' : 'bg-red-100 text-red-700'}`}>{getStatusText(membershipData?.status || 2)}</span>
                  </div>
                  {membershipData?.status === 1 && (
                    <>
                      <div className="text-sm font-inter text-black mt-2">Valid until {expiryDate}</div>
                      <div className="text-sm font-inter text-black mt-2">Member since {memberSince}</div>
                    </>
                  )}
                </div>
              </div>
            </Card>
            {/* Credit Balance Card */}
            <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm flex flex-col justify-center p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex flex-row items-center w-full">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#e2c799] mr-6">
                <svg width="34" height="30" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 12.5C10.0717 12.5 9.1815 12.8687 8.52513 13.5251C7.86875 14.1815 7.5 15.0717 7.5 16C7.5 16.9283 7.86875 17.8185 8.52513 18.4749C9.1815 19.1313 10.0717 19.5 11 19.5C11.9283 19.5 12.8185 19.1313 13.4749 18.4749C14.1313 17.8185 14.5 16.9283 14.5 16C14.5 15.0717 14.1313 14.1815 13.4749 13.5251C12.8185 12.8687 11.9283 12.5 11 12.5ZM9.5 16C9.5 15.6022 9.65804 15.2206 9.93934 14.9393C10.2206 14.658 10.6022 14.5 11 14.5C11.3978 14.5 11.7794 14.658 12.0607 14.9393C12.342 15.2206 12.5 15.6022 12.5 16C12.5 16.3978 12.342 16.7794 12.0607 17.0607C11.7794 17.342 11.3978 17.5 11 17.5C10.6022 17.5 10.2206 17.342 9.93934 17.0607C9.65804 16.7794 9.5 16.3978 9.5 16Z" fill="#A07735"/>
                <path d="M16.526 5.1152L13.347 0.658203L1.658 9.9962L1.01 9.9892V9.9992H0.5V21.9992H21.5V9.9992H20.538L18.624 4.4002L16.526 5.1152ZM18.425 9.9992H8.397L15.866 7.4532L17.388 6.9662L18.425 9.9992ZM14.55 5.7892L6.84 8.4172L12.946 3.5392L14.55 5.7892ZM2.5 18.1682V13.8282C2.92218 13.6792 3.30565 13.4376 3.62231 13.1211C3.93896 12.8046 4.18077 12.4213 4.33 11.9992H17.67C17.8191 12.4215 18.0609 12.805 18.3775 13.1217C18.6942 13.4383 19.0777 13.6801 19.5 13.8292V18.1692C19.0777 18.3183 18.6942 18.5601 18.3775 18.8767C18.0609 19.1934 17.8191 19.5769 17.67 19.9992H4.332C4.18218 19.5769 3.93996 19.1933 3.62302 18.8766C3.30607 18.5598 2.9224 18.3178 2.5 18.1682Z" fill="#A07735"/>
                </svg>


                </div>
                <div className="flex flex-col">
                  <div className="font-semibold font-marcellus text-lg text-[#232323]">Credit Balance</div>
                  <div className="text-xl font-bold font-inter text-[#232323] mt-2 pl-1">₹{membershipData?.credit_balance?.total?.toLocaleString() || 0}</div>
                  {/* <div className="flex flex-col gap-2 text-base font-inter text-[#232323] font-normal mt-2">
                    <div>Products: {membershipData?.credit_balance?.product?.toLocaleString() || 0}</div>
                    <div>Services: {membershipData?.credit_balance?.service?.toLocaleString() || 0}</div>
                  </div> */}
                </div>
              </div>
            </Card>
            {/* <Card className="overflow-hidden shadow-lg border-0 bg-white rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#232323]">Membership Details</CardTitle>
                <Spa className="h-4 w-4 text-[#a07735]" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-[#232323]">{membershipData?.membership?.name}</div>
                <p className="text-xs text-[#454545]">Code: {membershipData?.membership?.code}</p>
                <p className="text-xs text-[#454545]">Receipt: {membershipData?.invoice?.receipt_no}</p>
              </CardContent>
            </Card> */}
          </div>

          {/* Available Memberships Section */}
          <div className="mb-8 max-w-[1100px] mx-auto">
            <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Available Memberships</h1>
            <h2 className="text-[#454545] font-inter mb-6">Explore our membership options</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0 items-stretch max-w-[1100px] mx-auto">
              {membershipDetails.map((membership) => (
                <Card key={membership.id} className="group overflow-hidden shadow-lg border-0 bg-white/50 backdrop-blur-sm rounded-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] min-w-0">
                  <CardContent className="p-0">
                  <div className="relative aspect-[16/9] w-full min-w-0 min-h-0 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-110">
                        <Image
                          src={`/membership/${membership.price?.sales || 'default'}.png`}
                          alt="Spa interior"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h1 className="font-semibold text-[22px] text-[#232323] mb-2">
                        {membership.price?.sales === 15000 ? "Bronze Membership" :
                         membership.price?.sales === 25000 ? "Silver Membership" :
                         membership.price?.sales === 35000 ? "Gold Membership" :
                         membership.price?.sales === 50000 ? "Platinum Membership" :
                         membership.price?.sales === 65000 ? "Diamond Membership" :
                         membership.price?.sales === 100000 ? "Ode Signature Elite" :
                         "Ode Spa Membership"}
                      </h1>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-[#98564D]">{formatPrice(membership.price?.sales || 0)}</span>
                        <span className="text-[18px] font-inter">Validity: 12 months</span>
                      </div>
                      <div className="flex items-center mt-4 relative h-[24px]">
                        <span className="text-[#232323] text-[18px] font-regular font-inter">
                          {membership.price?.sales === 15000 ? (
                            <>
                              <span className={`absolute text-[#232323] font-regular text-[18px] transition-all duration-3000 delay-1000 ${showFirstOffer ? 'opacity-100' : 'opacity-0'}`} style={{ marginTop: '-10px' }}>
                                35% off on all weekdays
                              </span>
                              <span className={`absolute text-[#232323] font-regular text-[18px] transition-all duration-3000 delay-1000 ${!showFirstOffer ? 'opacity-100' : 'opacity-0'}`} style={{ marginTop: '-10px' }}>
                                20% off on weekends
                              </span>
                            </>
                          ) : membership.price?.sales === 25000 ? "50% off on all services" :
                             membership.price?.sales === 35000 ? "50% off on all services" :
                             membership.price?.sales === 50000 ? "50% off on all services" :
                             membership.price?.sales === 65000 ? "50% off on all services" :
                             membership.price?.sales === 100000 ? "50% off on all services" :
                             "Special offer available"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center text-center mx-auto mt-4">
                        <Button
                          variant="outline"
                          className="text-[#a07735] border-[#a07735] font-marcellus bg-transparent hover:text-[#a07735] flex items-center text-[18px] w-full"
                          onClick={() => handleMembershipClick(membership)}
                        >
                          View Details
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button 
                          className="relative w-full h-[36px] p-6 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Marcellus'] font-bold text-[20px] leading-[17px] text-center text-[#98564D] disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleTakeMembership(membership)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-[#98564D] border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Buy Membership"
                          )}
                        </Button>
                      </div>
                      <div className="w-full sm:w-[140px] flex justify-center sm:justify-end">
                  
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
        <>
          {/* <MembershipModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            membership={selectedMembership}
            onConfirm={handleConfirmMembership}
            loading={isProcessing}
          /> */}
          <MembershipDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            membership={selectedMembership}
            onConfirm={handleConfirmMembership}
            loading={isProcessing}
            setIsDetailsModalOpen={setIsDetailsModalOpen}
          />
        </>
      )}
    </div>
  )
}

const MembershipDetailsModal = ({ 
  membership, 
  onClose,
  isOpen,
  onConfirm,
  loading,
  setIsDetailsModalOpen
}: { 
  membership: MembershipDetail, 
  onClose: () => void,
  isOpen: boolean,
  onConfirm: () => Promise<any>,
  loading: boolean,
  setIsDetailsModalOpen: (value: boolean) => void
}) => (
  <Dialog open={isOpen} onOpenChange={() => {
    onClose();
    setIsDetailsModalOpen(false);
  }}>
    <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-2xl w-[92%] sm:w-full mx-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
      <DialogTitle className="sr-only">Membership Details</DialogTitle>
      <div className="bg-[#a07735] p-3 sm:p-4 rounded-t-lg text-center relative">
        <button
          className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 hover:text-[#f5f1e8] text-white"
          onClick={() => {
            onClose();
            setIsDetailsModalOpen(false);
          }}
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-2xl font-marcellus text-white mb-0.5 sm:mb-1">
          {membership.price?.sales === 15000 ? "Bronze Membership" :
           membership.price?.sales === 25000 ? "Silver Membership" :
           membership.price?.sales === 35000 ? "Gold Membership" :
           membership.price?.sales === 50000 ? "Platinum Membership" :
           membership.price?.sales === 65000 ? "Diamond Membership" :
           membership.price?.sales === 100000 ? "Ode Signature Elite" :
           "Ode Spa Membership"}
        </h1>
      </div>
      <div className="px-0 pt-0 pb-0 rounded-t-2xl text-center relative">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6 pb-2 gap-3">
      <button
                  className="hidden sm:flex hover:text-[#a07735] text-base sm:text-lg font-bold font-inter items-center gap-2 cursor-pointer"
                  onClick={() => {
              onClose();
              setIsDetailsModalOpen(false);
            }}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-bold font-inter">Back</span>
          </button>
          <div className="flex-1 flex flex-col items-center">
           
            <h1 className="text-xl sm:text-2xl font-bold font-marcellus mb-1">{membership.price?.sales?.toLocaleString() || "0"}</h1>

          </div>
          <div className="w-full sm:w-[140px] flex justify-center sm:justify-end">
          <Button 
                    className="relative w-full sm:w-[300px] h-[32px] sm:h-[36px] p-4 sm:p-6 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Marcellus'] font-bold text-base sm:text-[20px] leading-[17px] text-center text-[#98564D]"
                    onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#98564D] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Buy Membership"
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-8 bg-white">
        {/* Benefits */}
        <div className="bg-[#f5f1e8] rounded-xl p-4 sm:p-6 flex flex-col shadow-sm">
          <div className="flex items-center mb-2">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.30176 3.35938L11.001 6.25H10.9375H7.42188C6.34277 6.25 5.46875 5.37598 5.46875 4.29688C5.46875 3.21777 6.34277 2.34375 7.42188 2.34375H7.5293C8.25684 2.34375 8.93555 2.72949 9.30176 3.35938ZM3.125 4.29688C3.125 5 3.2959 5.66406 3.59375 6.25H1.5625C0.698242 6.25 0 6.94824 0 7.8125V10.9375C0 11.8018 0.698242 12.5 1.5625 12.5H23.4375C24.3018 12.5 25 11.8018 25 10.9375V7.8125C25 6.94824 24.3018 6.25 23.4375 6.25H21.4062C21.7041 5.66406 21.875 5 21.875 4.29688C21.875 1.92383 19.9512 0 17.5781 0H17.4707C15.9131 0 14.4678 0.825195 13.6768 2.16797L12.5 4.1748L11.3232 2.17285C10.5322 0.825195 9.08691 0 7.5293 0H7.42188C5.04883 0 3.125 1.92383 3.125 4.29688ZM19.5312 4.29688C19.5312 5.37598 18.6572 6.25 17.5781 6.25H14.0625H13.999L15.6982 3.35938C16.0693 2.72949 16.7432 2.34375 17.4707 2.34375H17.5781C18.6572 2.34375 19.5312 3.21777 19.5312 4.29688ZM1.5625 14.0625V22.6562C1.5625 23.9502 2.6123 25 3.90625 25H10.9375V14.0625H1.5625ZM14.0625 25H21.0938C22.3877 25 23.4375 23.9502 23.4375 22.6562V14.0625H14.0625V25Z" fill="#9E5F45"/>
            </svg>
            <h1 className="font-semibold text-lg sm:text-[22px] text-[#98564d] ml-4">Benefits</h1>
          </div>
          <ul className="space-y-2 text-sm text-[#454545]">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Flat 5% OFF on all subsequent bookings after redemption</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">10% OFF on ODE skincare and wellness products</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Birthday month special: One free head massage</span>
            </li>
          </ul>
        </div>
        {/* Terms */}
        <div className="bg-[#f5f1e8] rounded-xl p-4 sm:p-6 flex flex-col shadow-sm">
          <div className="flex items-center mb-2">
            <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_937_2657)">
                <path d="M27.1785 12.5479C29.827 9.89946 29.827 5.6104 27.1785 2.96196C24.8348 0.618211 21.141 0.313524 18.4457 2.24009L18.3707 2.29165C17.6957 2.77446 17.541 3.71196 18.0238 4.38227C18.5066 5.05259 19.4441 5.21196 20.1145 4.72915L20.1895 4.67759C21.6941 3.60415 23.752 3.7729 25.0551 5.08071C26.5316 6.55727 26.5316 8.9479 25.0551 10.4245L19.7957 15.6932C18.3191 17.1698 15.9285 17.1698 14.452 15.6932C13.1441 14.3854 12.9754 12.3276 14.0488 10.8276L14.1004 10.7526C14.5832 10.0776 14.4238 9.14009 13.7535 8.66196C13.0832 8.18384 12.141 8.33852 11.6629 9.00884L11.6113 9.08384C9.68008 11.7745 9.98477 15.4682 12.3285 17.812C14.977 20.4604 19.266 20.4604 21.9145 17.812L27.1785 12.5479ZM2.82227 11.451C0.173828 14.0995 0.173828 18.3885 2.82227 21.037C5.16602 23.3807 8.85977 23.6854 11.5551 21.7588L11.6301 21.7073C12.3051 21.2245 12.4598 20.287 11.977 19.6167C11.4941 18.9463 10.5566 18.787 9.88633 19.2698L9.81133 19.3213C8.30664 20.3948 6.24883 20.226 4.9457 18.9182C3.46914 17.437 3.46914 15.0463 4.9457 13.5698L10.2051 8.30571C11.6816 6.82915 14.0723 6.82915 15.5488 8.30571C16.8566 9.61352 17.0254 11.6713 15.952 13.176L15.9004 13.251C15.4176 13.926 15.577 14.8635 16.2473 15.3417C16.9176 15.8198 17.8598 15.6651 18.3379 14.9948L18.3895 14.9198C20.3207 12.2245 20.016 8.53071 17.6723 6.18696C15.0238 3.53852 10.7348 3.53852 8.08633 6.18696L2.82227 11.451Z" fill="#98564D"/>
              </g>
            </svg>
            <h1 className="font-semibold text-lg sm:text-[22px] text-[#98564d] ml-4">Terms</h1>
          </div>
          <ul className="space-y-2 text-sm text-[#454545]">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Non-transferable</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Cannot be clubbed with other promotional offers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Advance booking recommended on weekends</span>
            </li>
          </ul>
        </div>
        {/* Discounts & Offers */}
        <div className="bg-[#f5f1e8] rounded-xl p-4 sm:p-6 flex flex-col shadow-sm">
          <div className="flex items-center mb-2">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_937_2625)">
                <g clipPath="url(#clip1_937_2625)">
                  <path d="M20.2148 2.29102L27.7031 9.86719C30.7734 12.9727 30.7734 17.9648 27.7031 21.0703L21.1406 27.709C20.5957 28.2598 19.7051 28.2656 19.1543 27.7207C18.6035 27.1758 18.5977 26.2852 19.1426 25.7344L25.6992 19.0957C27.6855 17.0859 27.6855 13.8574 25.6992 11.8477L18.2168 4.27148C17.6719 3.7207 17.6777 2.83008 18.2285 2.28516C18.7793 1.74023 19.6699 1.74609 20.2148 2.29688V2.29102ZM0 13.4473V4.6875C0 3.13477 1.25977 1.875 2.8125 1.875H11.5723C12.5684 1.875 13.5234 2.26758 14.2266 2.9707L24.0703 12.8145C25.5352 14.2793 25.5352 16.6523 24.0703 18.1172L16.248 25.9395C14.7832 27.4043 12.4102 27.4043 10.9453 25.9395L1.10156 16.0957C0.392578 15.3926 0 14.4434 0 13.4473ZM8.4375 8.4375C8.4375 7.94022 8.23996 7.46331 7.88832 7.11168C7.53669 6.76004 7.05978 6.5625 6.5625 6.5625C6.06522 6.5625 5.58831 6.76004 5.23667 7.11168C4.88504 7.46331 4.6875 7.94022 4.6875 8.4375C4.6875 8.93478 4.88504 9.41169 5.23667 9.76333C5.58831 10.115 6.06522 10.3125 6.5625 10.3125C7.05978 10.3125 7.53669 10.115 7.88832 9.76333C8.23996 9.41169 8.4375 8.93478 8.4375 8.4375Z" fill="#9E5F45"/>
                </g>
              </g>
            </svg>
            <h1 className="font-semibold text-lg sm:text-[22px] text-[#98564d] ml-4">Discounts & Offers</h1>
          </div>
          <ul className="space-y-2 text-sm text-[#454545]">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Flat 5% OFF on all subsequent bookings after redemption</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">10% OFF on ODE skincare and wellness products</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">Birthday month special: One free head massage</span>
            </li>
          </ul>
        </div>
        {/* Validity */}
        <div className="bg-[#f5f1e8] rounded-xl p-4 sm:p-6 flex flex-col shadow-sm">
          <div className="flex items-center mb-2">
            <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_937_2647)">
                <g clipPath="url(#clip1_937_2647)">
                  <path d="M6 0C6.82969 0 7.5 0.670312 7.5 1.5V3H13.5V1.5C13.5 0.670312 14.1703 0 15 0C15.8297 0 16.5 0.670312 16.5 1.5V3H18.75C19.9922 3 21 4.00781 21 5.25V7.5H0V5.25C0 4.00781 1.00781 3 2.25 3H4.5V1.5C4.5 0.670312 5.17031 0 6 0ZM0 9H21V21.75C21 22.9922 19.9922 24 18.75 24H2.25C1.00781 24 0 22.9922 0 21.75V9ZM3 12.75V14.25C3 14.6625 3.3375 15 3.75 15H5.25C5.6625 15 6 14.6625 6 14.25V12.75C6 12.3375 5.6625 12 5.25 12H3.75C3.3375 12 3 12.3375 3 12.75ZM9 12.75V14.25C9 14.6625 9.3375 15 9.75 15H11.25C11.6625 15 12 14.6625 12 14.25V12.75C12 12.3375 11.6625 12 11.25 12H9.75C9.3375 12 9 12.3375 9 12.75ZM15.75 12C15.3375 12 15 12.3375 15 12.75V14.25C15 14.6625 15.3375 15 15.75 15H17.25C17.6625 15 18 14.6625 18 14.25V12.75C18 12.3375 17.6625 12 17.25 12H15.75ZM3 18.75V20.25C3 20.6625 3.3375 21 3.75 21H5.25C5.6625 21 6 20.6625 6 20.25V18.75C6 18.3375 5.6625 18 5.25 18H3.75C3.3375 18 3 18.3375 3 18.75ZM9.75 18C9.3375 18 9 18.3375 9 18.75V20.25C9 20.6625 9.3375 21 9.75 21H11.25C11.6625 21 12 20.6625 12 20.25V18.75C12 18.3375 11.6625 18 11.25 18H9.75ZM15 18.75V20.25C15 20.6625 15.3375 21 15.75 21H17.25C17.6625 21 18 20.6625 18 20.25V18.75C18 18.3375 17.6625 18 17.25 18H15.75C15.3375 18 15 18.3375 15 18.75Z" fill="#98564D"/>
                </g>
              </g>
            </svg>
            <h1 className="font-semibold text-lg sm:text-[22px] text-[#98564d] ml-4">Validity</h1>
          </div>
          <ul className="space-y-2 text-sm text-[#454545]">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 min-w-[16px] sm:min-w-[20px] min-h-[16px] sm:min-h-[20px] text-[#98564d]" />
              <span className="font-inter text-xs sm:text-sm">12 months from the date of activation</span>
            </li>
          </ul>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

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
