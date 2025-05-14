import { Calendar, Clock, Crown, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SignatureBookings() {
  return (
    <DashboardLayout membershipType="signature">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elite Bookings</h1>
          <p className="text-muted-foreground">Manage your premium spa and wellness appointments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Priority Appointments</CardTitle>
              <CardDescription>Your scheduled premium sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Luxury Couple Spa Experience</h3>
                  <p className="text-sm text-muted-foreground">Premium Massage & Hydrotherapy</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">July 15, 2024</div>
                  <div className="flex items-center justify-end text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> 2:00 PM
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Elite Health Assessment</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive Wellness Evaluation</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">August 22, 2024</div>
                  <div className="flex items-center justify-end text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> 10:00 AM
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">Reschedule</Button>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Book Premium Services</CardTitle>
              <CardDescription>Available luxury experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-amber-600" />
                    <h3 className="font-medium">Signature Spa Experience</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">4 premium sessions remaining</p>
                  <div className="flex gap-2">
                    <Button className="flex-1">Book Now</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-amber-600" />
                    <h3 className="font-medium">Luxury Wellness Retreat</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">1-week premium stay available</p>
                  <div className="flex gap-2">
                    <Button className="flex-1">Book Now</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <h3 className="font-medium">Elite Health Check-up</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Annual premium assessment</p>
                  <div className="flex gap-2">
                    <Button className="flex-1">Book Now</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Elite Booking Benefits</CardTitle>
            <CardDescription>Exclusive booking privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <Crown className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Priority Access</h3>
                <p className="text-sm text-muted-foreground">48-hour advance booking window for all services</p>
              </div>
              <div className="rounded-lg border p-4">
                <Star className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Flexible Cancellation</h3>
                <p className="text-sm text-muted-foreground">Free cancellation up to 24 hours before appointment</p>
              </div>
              <div className="rounded-lg border p-4">
                <Calendar className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Concierge Booking</h3>
                <p className="text-sm text-muted-foreground">Personal assistance for all your bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 