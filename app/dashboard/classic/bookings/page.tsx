import { Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ClassicBookings() {
  return (
    <DashboardLayout membershipType="classic">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage your spa and wellness appointments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Calendar className="h-6 w-6 text-amber-600" />
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
                  <Calendar className="h-6 w-6 text-amber-600" />
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
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Cancel Appointment</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Book New Session</CardTitle>
              <CardDescription>Available services for booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Couple Day Spa Session</h3>
                  <p className="text-sm text-muted-foreground mb-4">2 sessions remaining</p>
                  <Button className="w-full">Book Now</Button>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Wellness Program Stay</h3>
                  <p className="text-sm text-muted-foreground mb-4">1 week stay available</p>
                  <Button className="w-full">Book Now</Button>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Annual Wellness Check-up</h3>
                  <p className="text-sm text-muted-foreground mb-4">Next check-up due in 2025</p>
                  <Button className="w-full">Schedule Check-up</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 