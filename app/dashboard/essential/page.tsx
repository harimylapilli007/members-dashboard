"use client"

import { useState, Suspense } from "react"
import { CalendarDays, Clock, Gift, SpadeIcon as Spa, User2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { BookingForm } from "@/components/booking-form"
import type { AppointmentType } from "@/types/appointment"

function EssentialDashboardContent() {
  const router = useRouter()
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<{
    type: AppointmentType
    title: string
  } | null>(null)

  // Mock user ID
  const userId = "user-1"

  // Static upcoming appointments data
  const upcomingAppointments = [
    {
      id: "apt-1",
      type: "spa" as AppointmentType,
      title: "Couple Day Spa Session",
      date: "2024-03-25",
      time: "10:00",
      location: "Wellness Center - Main Branch"
    }
  ]

  const handleBookClick = () => {
    setSelectedAppointmentType({
      type: "spa",
      title: "Couple Day Spa Session",
    })
    setIsBookingOpen(true)
  }

  return (
    <div className="container p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Essential Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Ode Life Essential membership dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <User2 className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Valid until May 14, 2030</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spa Sessions Used</CardTitle>
            <Spa className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1/4</div>
            <p className="text-xs text-muted-foreground">Couple Day Spa Sessions</p>
            <Progress className="mt-2" value={25} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellness Stay</CardTitle>
            <CalendarDays className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not Used</div>
            <p className="text-xs text-muted-foreground">4N/5D Couple Stay</p>
            <Progress className="mt-2" value={0} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voucher Status</CardTitle>
            <Gift className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground">₹5 Lakh Realty Voucher</p>
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
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <Spa className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{appointment.title}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{appointment.date}</div>
                      <div className="flex items-center justify-end text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" /> {appointment.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No Upcoming Appointments</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Book a new appointment to enjoy your membership benefits.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleBookClick}>
              Book New Appointment
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membership Benefits</CardTitle>
            <CardDescription>Your Essential membership includes</CardDescription>
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
                <span>4N/5D Couple Stay with Wellness Program</span>
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
                <span>Annual Spa Membership</span>
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
                <span>Access to 5-star Spa Outlets</span>
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
                <span>Winning Metric for Your Startup</span>
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
                <span>₹5 Lakh Realty Voucher (Limited Use)</span>
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
                <span>Spa Welcome Kit</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      {selectedAppointmentType && (
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <BookingForm
              appointmentType={selectedAppointmentType.type}
              appointmentTitle={selectedAppointmentType.title}
              onSuccess={() => {
                setIsBookingOpen(false)
                router.refresh()
              }}
              onCancel={() => setIsBookingOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default function EssentialDashboard() {
  return (
    <Suspense fallback={
      <DashboardLayout membershipType="essential">
        <div className="container p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading membership data..</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <EssentialDashboardContent />
    </Suspense>
  )
}
