"use client"

import { Activity, CalendarDays, Clock, Gift, Heart, SpadeIcon as Spa, Trophy, User2, Wifi } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MembershipModal } from "@/components/membership-modal"
import { useToast } from "@/components/ui/use-toast"

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

export default function ClassicDashboard() {
  const searchParams = useSearchParams()
  const [membershipData, setMembershipData] = useState<GuestMembership | null>(null)
  const [membershipDetails, setMembershipDetails] = useState<MembershipDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMembership, setSelectedMembership] = useState<MembershipDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

   // Get name from URL parameters
   const firstName = searchParams.get('first_name')
   const lastName = searchParams.get('last_name')
   const fullName = firstName && lastName ? (firstName === lastName ? firstName : `${firstName} ${lastName}`) : undefined
   const admincenterId = '92d41019-c790-4668-9158-a693e531c1a4'

  const createMembershipInvoice = async (membershipId: string) => {
    try {
      const guestId = searchParams.get('id')

      if (!guestId || !admincenterId) {
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
          user_id: guestId,
          membership_ids: membershipId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
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
        description: `Membership invoice created successfully ${data.invoice_id}!`,
      })
      setIsModalOpen(false)
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
        const guestId = searchParams.get('id')
        const centerId = searchParams.get('center_id')
        
        if (!guestId || !centerId) {
          setError('Guest ID and Center ID are required')
          setLoading(false)
          return
        }

        // Fetch guest memberships
        const membershipResponse = await fetch(
          `https://api.zenoti.com/v1/guests/${guestId}/memberships?center_id=${centerId}`,
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

    fetchMembershipData()
  }, [searchParams])

  if (loading) {
    return (
      <DashboardLayout membershipType="classic">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading membership data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // if (error) {
  //   return (
  //     <DashboardLayout membershipType="classic">
  //       <div className="container p-4 md:p-8">
  //         <div className="flex items-center justify-center h-64">
  //           <p className="text-red-500">Error: {error}</p>
  //         </div>
  //       </div>
  //     </DashboardLayout>
  //   )
  // }

  // if (!membershipData) {
  //   return (
  //     <DashboardLayout membershipType="classic">
  //       <div className="container p-4 md:p-8">
  //         <div className="flex items-center justify-center h-64">
  //           <p>No membership data available</p>
  //         </div>
  //       </div>
  //     </DashboardLayout>
  //   )
  // }

  const expiryDate = membershipData?.expiry_date ? new Date(membershipData.expiry_date).toLocaleDateString() : 'N/A'
  const memberSince = membershipData?.member_since ? new Date(membershipData.member_since).toLocaleDateString() : 'N/A'

  return (
    <DashboardLayout membershipType="classic" fullName={fullName}>
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classic Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your Ode Life Classic membership dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
              <User2 className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(membershipData?.status || 2)}`}>
                {getStatusText(membershipData?.status || 2)}
              </div>
              <p className="text-xs text-muted-foreground">Valid until {expiryDate}</p>
              <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
              <Gift className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{membershipData?.credit_balance?.total?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available Credit</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Services</span>
                  <span>₹{membershipData?.credit_balance?.service?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Products</span>
                  <span>₹{membershipData?.credit_balance?.product?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Other</span>
                  <span>₹{membershipData?.credit_balance?.other?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership Details</CardTitle>
              <Spa className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{membershipData?.membership?.name}</div>
              <p className="text-xs text-muted-foreground">Code: {membershipData?.membership?.code}</p>
              <p className="text-xs text-muted-foreground">Receipt: {membershipData?.invoice?.receipt_no}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guest Pass</CardTitle>
              <CalendarDays className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {membershipData?.guestpass_balance === -1 ? 'Unlimited' : membershipData?.guestpass_balance}
              </div>
              <p className="text-xs text-muted-foreground">Available Guest Passes</p>
              {membershipData?.guestpass_total !== -1 && (
                <Progress 
                  className="mt-2" 
                  value={((membershipData?.guestpass_balance ?? 0) / (membershipData?.guestpass_total ?? 1)) * 100} 
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Available Memberships</CardTitle>
              <CardDescription>Explore our membership options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {membershipDetails.map((membership) => (
                  <div key={membership.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <Trophy className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{membership.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {membership.code}</p>
                      {membership.description && (
                        <p className="text-sm text-muted-foreground mt-1">{membership.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {membership.freeze_fee_reason_enabled && (
                        <div className="text-sm text-muted-foreground">Freeze Available</div>
                      )}
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => handleMembershipClick(membership)}
                      >
                        Take Membership
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membership Benefits</CardTitle>
              <CardDescription>Your Classic membership includes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>4 Couple Day Spa Sessions</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>12 Annual Spa Memberships</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>1 Week Stay with Wellness Program (worth ₹1,50,000)</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Yearly Wellness Check-up for Couple</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>₹5 Lakh Ridhira Realty Voucher</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Wellness Welcome Kit</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-amber-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="flex items-center">
                    <Wifi className="mr-1 h-3 w-3" /> Free WiFi
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled wellness sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Spa className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Couple Day Spa Session</h3>
                    <p className="text-sm text-muted-foreground">Hot Stone Therapy & Swedish Massage</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">July 10, 2025</div>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" /> 2:00 PM
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <User2 className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Yearly Wellness Check-up</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive Health Assessment</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">August 22, 2025</div>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" /> 9:30 AM
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Book New Appointment
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wellness Journey</CardTitle>
              <CardDescription>Your wellness milestones and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">30-Day Fitness Challenge</h3>
                    <p className="text-sm text-muted-foreground">Completed on June 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Heart className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Heart Health Milestone</h3>
                    <p className="text-sm text-muted-foreground">Achieved on May 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Perfect Activity Week</h3>
                    <p className="text-sm text-muted-foreground">Achieved on April 20, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
    </DashboardLayout>
  )
}
