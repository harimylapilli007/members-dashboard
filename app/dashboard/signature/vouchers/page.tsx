import { Building2, Crown, Gift, Home, Star, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SignatureVouchers() {
  return (
    <DashboardLayout membershipType="signature">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elite Vouchers</h1>
          <p className="text-muted-foreground">Access your premium membership benefits and exclusive offers.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ridhira Realty Voucher</CardTitle>
              <Building2 className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹5,00,000</div>
              <p className="text-xs text-muted-foreground">Valid until Dec 31, 2040</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Redeem Now</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Spa Memberships</CardTitle>
              <Gift className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 Available</div>
              <p className="text-xs text-muted-foreground">Premium transferable memberships</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Transfer Membership</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elite Welcome Kit</CardTitle>
              <Crown className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Delivered</div>
              <p className="text-xs text-muted-foreground">Exclusive premium package</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Contents</Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Elite Offers</CardTitle>
            <CardDescription>Exclusive deals for Signature members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">25% Off Premium Spa Treatments</h3>
                  <p className="text-sm text-muted-foreground">Valid at all partner outlets</p>
                </div>
                <Button>Claim Offer</Button>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Complimentary Airport Transfers</h3>
                  <p className="text-sm text-muted-foreground">For wellness stay bookings</p>
                </div>
                <Button>Book Transfer</Button>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Tag className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Priority Booking Access</h3>
                  <p className="text-sm text-muted-foreground">48-hour advance booking window</p>
                </div>
                <Button>View Calendar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elite Benefits</CardTitle>
            <CardDescription>Additional premium perks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium">Personal Concierge</h3>
                </div>
                <p className="text-sm text-muted-foreground">24/7 dedicated assistance for all your wellness needs</p>
                <Button variant="outline" className="w-full mt-4">Contact Concierge</Button>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium">Room Upgrades</h3>
                </div>
                <p className="text-sm text-muted-foreground">Complimentary upgrades during wellness stays</p>
                <Button variant="outline" className="w-full mt-4">View Rooms</Button>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium">Birthday Benefits</h3>
                </div>
                <p className="text-sm text-muted-foreground">Special treats and experiences on your special day</p>
                <Button variant="outline" className="w-full mt-4">View Benefits</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 