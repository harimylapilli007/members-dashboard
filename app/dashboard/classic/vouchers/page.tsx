import { Building2, Gift, Home, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ClassicVouchers() {
  return (
    <DashboardLayout membershipType="classic">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">Manage your membership vouchers and benefits.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ridhira Realty Voucher</CardTitle>
              <Building2 className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹5,00,000</div>
              <p className="text-xs text-muted-foreground">Valid until Dec 31, 2025</p>
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
              <div className="text-2xl font-bold">11 Available</div>
              <p className="text-xs text-muted-foreground">Transfer to friends or family</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Transfer Membership</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Welcome Kit</CardTitle>
              <Home className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Delivered</div>
              <p className="text-xs text-muted-foreground">Received on Jan 15, 2024</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Contents</Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Special Offers</CardTitle>
            <CardDescription>Exclusive deals for Classic members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Tag className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">20% Off on Spa Products</h3>
                  <p className="text-sm text-muted-foreground">Valid at all partner outlets</p>
                </div>
                <Button>Claim Offer</Button>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Tag className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Buy 1 Get 1 on Massages</h3>
                  <p className="text-sm text-muted-foreground">Weekend special offer</p>
                </div>
                <Button>Claim Offer</Button>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Tag className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Free Wellness Assessment</h3>
                  <p className="text-sm text-muted-foreground">First-time consultation</p>
                </div>
                <Button>Claim Offer</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 