import { Gift } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function EssentialVouchersPage() {
  return (
    <DashboardLayout membershipType="essential">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">Manage your membership vouchers and benefits.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Realty Voucher</CardTitle>
              <CardDescription>₹5 Lakh Realty Voucher (Limited Use)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">₹5 Lakh Realty Voucher</div>
                  <div className="text-sm font-medium text-green-600">Available</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Voucher Code: <span className="font-mono">ESS-RR-25-0001</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Valid until: May 14, 2030</div>
                <div className="mt-4 text-sm text-muted-foreground">
                  This voucher can be redeemed against the purchase of any Ridhira Realty property. Limited to one-time
                  use.
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Details</Button>
              <Button>Redeem</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Spa Welcome Kit</CardTitle>
              <CardDescription>Exclusive wellness products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Spa Welcome Kit</div>
                  <div className="text-sm font-medium text-amber-600">Ready for Pickup</div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Your exclusive Spa Welcome Kit includes premium wellness products, aromatherapy essentials, and a
                  personalized wellness guide.
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Available for pickup at any of our 5-star Spa Outlets.
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Schedule Pickup</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Annual Spa Membership</CardTitle>
              <CardDescription>Access to premium spa facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Annual Spa Membership</div>
                  <div className="text-sm font-medium text-green-600">Active</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Membership ID: <span className="font-mono">ESS-ASM-25-0001</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Valid until: May 14, 2026</div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Your Annual Spa Membership provides access to all 5-star Spa Outlets with special member pricing on
                  additional treatments.
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Member Benefits
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Benefits</CardTitle>
            <CardDescription>Additional benefits included in your membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Gift className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Access to 5-star Spa Outlets</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy premium access to all our 5-star Spa Outlets across the country.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Locations
                </Button>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Gift className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Winning Metric for Your Startup</h3>
                  <p className="text-sm text-muted-foreground">
                    Exclusive business consultation session to identify and optimize your startup's key metrics.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
