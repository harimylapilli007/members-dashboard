"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarDays, Clock, Gift, SpadeIcon as Spa, Star, User2, Wifi } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"

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

interface CreditBalance {
  total: number;
  service: number;
  product: number;
  other: number;
  comments: string | null;
}

interface Guest {
  first_name: string;
  last_name: string;
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

export default function SignatureDashboard() {
  const searchParams = useSearchParams()
  const [membershipData, setMembershipData] = useState<GuestMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        const response = await fetch(
          `https://api.zenoti.com/v1/guests/${guestId}/memberships?center_id=${centerId}`,
          {
            headers: {
              'Authorization': 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
              'accept': 'application/json',
              'content-type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch membership data')
        }

        const data: MembershipResponse = await response.json()
        if (data.guest_memberships && data.guest_memberships.length > 0) {
          setMembershipData(data.guest_memberships[0])
        } else {
          setError('No membership data found')
        }
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
      <DashboardLayout membershipType="signature">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading membership data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout membershipType="signature">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!membershipData) {
    return (
      <DashboardLayout membershipType="signature">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>No membership data available</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const expiryDate = new Date(membershipData.expiry_date).toLocaleDateString()
  const memberSince = new Date(membershipData.member_since).toLocaleDateString()

  return (
    <DashboardLayout membershipType="signature" fullName={membershipData?.guest?.first_name && membershipData?.guest?.last_name ? `${membershipData.guest.first_name} ${membershipData.guest.last_name}` : undefined}>
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signature Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your Ode Life Signature membership dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
              <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Elite Active</div>
              <p className="text-xs text-muted-foreground">Valid until {expiryDate}</p>
              <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spa Sessions Used</CardTitle>
              <Spa className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0/4</div>
              <p className="text-xs text-muted-foreground">Couple Day Spa Sessions</p>
              <Progress className="mt-2" value={0} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
              <Gift className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{membershipData.credit_balance.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available Credit</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Services</span>
                  <span>₹{membershipData.credit_balance.service.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Products</span>
                  <span>₹{membershipData.credit_balance.product.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Other</span>
                  <span>₹{membershipData.credit_balance.other.toLocaleString()}</span>
                </div>
              </div>
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
                  value={(membershipData?.guestpass_balance / membershipData?.guestpass_total) * 100} 
                />
              )}
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
                    <User2 className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Yearly Wellness Check-up</h3>
                    <p className="text-sm text-muted-foreground">Premium Health Assessment</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">June 5, 2025</div>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" /> 11:00 AM
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Spa className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Couple Day Spa Session</h3>
                    <p className="text-sm text-muted-foreground">Signature Rejuvenation Package</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">June 20, 2025</div>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" /> 1:00 PM
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
              <CardTitle>Membership Benefits</CardTitle>
              <CardDescription>Your Signature membership includes</CardDescription>
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
                  <span>1 Week Stay with Wellness Program</span>
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
                  <span>Exclusive Wellness Welcome Kit</span>
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
                  <span>Access to 5-star Spa Outlets across India</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Wellness Program</CardTitle>
              <CardDescription>Track your wellness journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Wellness Assessment</span>
                  <span className="text-sm font-medium">Not Started</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Nutrition Plan</span>
                  <span className="text-sm font-medium">Not Started</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Fitness Regimen</span>
                  <span className="text-sm font-medium">Not Started</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Mindfulness Practice</span>
                  <span className="text-sm font-medium">Not Started</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Wellness Program</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Voucher Status</CardTitle>
              <CardDescription>Your realty voucher details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">₹5 Lakh Ridhira Realty Voucher</div>
                  <div className="text-sm font-medium text-green-600">Available</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Voucher Code: <span className="font-mono">SIG-RR-25-0001</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Valid until: May 14, 2030</div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View Redemption Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exclusive Offers</CardTitle>
              <CardDescription>Special offers for Signature members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="font-medium">25% Off Premium Spa Treatments</div>
                  <div className="mt-1 text-sm text-muted-foreground">Valid until: December 31, 2025</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Exclusive access to premium treatments at all partner locations
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="font-medium">Complimentary Airport Transfers</div>
                  <div className="mt-1 text-sm text-muted-foreground">For your wellness stay booking</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Luxury vehicle service to and from the nearest airport
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="font-medium">Priority Booking</div>
                  <div className="mt-1 text-sm text-muted-foreground">Skip the queue for all spa appointments</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Book up to 48 hours in advance with guaranteed slots
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
