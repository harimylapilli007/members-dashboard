"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Clock, Loader2, SpadeIcon as Spa } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingForm } from "@/components/booking-form"
import { RescheduleForm } from "@/components/reschedule-form"
import { QuickAvailabilityView } from "@/components/quick-availability-view"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AppointmentType } from "@/types/appointment"
import { cancelAppointmentAction } from "@/actions/appointment-actions"
import { toast } from "@/components/ui/use-toast"
import { getUserAppointments } from "@/lib/appointment-db"

export default function EssentialBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isReschedulingOpen, setIsReschedulingOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<{
    type: AppointmentType
    title: string
  } | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string
    type: AppointmentType
    date: string
    time: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quickBookDate, setQuickBookDate] = useState("")
  const [quickBookTime, setQuickBookTime] = useState("")

  // Mock user ID
  const userId = "user-1"

  // Get appointments
  const upcomingAppointments = getUserAppointments(userId, "upcoming")
  const pastAppointments = getUserAppointments(userId, "completed")

  // Get appointment types for Essential membership
  const appointmentTypes = [
    {
      type: "spa" as AppointmentType,
      title: "Couple Day Spa Session",
      description: "Choose from various massage and treatment options",
      remaining: 3,
    },
    {
      type: "wellness-stay" as AppointmentType,
      title: "4N/5D Couple Stay with Wellness Program",
      description: "Immersive wellness retreat experience",
      remaining: 1,
    },
  ]

  const handleBookingClick = (type: AppointmentType, title: string) => {
    setSelectedAppointmentType({ type, title })
    setIsBookingOpen(true)
  }

  const handleRescheduleClick = (appointment: {
    id: string
    type: AppointmentType
    date: string
    time: string
  }) => {
    setSelectedAppointment(appointment)
    setIsReschedulingOpen(true)
  }

  const handleCancelClick = (appointment: {
    id: string
    type: AppointmentType
    date: string
    time: string
  }) => {
    setSelectedAppointment(appointment)
    setIsCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("appointmentId", selectedAppointment.id)

      const result = await cancelAppointmentAction(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setIsCancelDialogOpen(false)
        // Force a refresh
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickBookSlot = (date: string, time: string) => {
    // If date or time is empty, just open the booking form
    if (!date || !time) {
      handleBookingClick("spa", "Couple Day Spa Session")
      return
    }

    // Set the quick book date and time
    setQuickBookDate(date)
    setQuickBookTime(time)

    // Open the booking form
    handleBookingClick("spa", "Couple Day Spa Session")
  }

  // Effect to pre-fill the form when quick booking
  useEffect(() => {
    if (isBookingOpen && quickBookDate && quickBookTime) {
      // Pre-fill the form with the quick book date and time
      // This would be handled by the BookingForm component
    }
  }, [isBookingOpen, quickBookDate, quickBookTime])

  return (
    <DashboardLayout membershipType="essential">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage your spa sessions and wellness stays.</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="book">Book New</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <CardTitle>{appointment.title}</CardTitle>
                    <CardDescription>{appointment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <Spa className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{appointment.location}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="mr-1 h-3 w-3" /> {appointment.date}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" /> {appointment.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleRescheduleClick({
                          id: appointment.id,
                          type: appointment.type,
                          date: appointment.date,
                          time: appointment.time,
                        })
                      }
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleCancelClick({
                          id: appointment.id,
                          type: appointment.type,
                          date: appointment.date,
                          time: appointment.time,
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Upcoming Bookings</CardTitle>
                  <CardDescription>You don't have any upcoming appointments scheduled.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Book a new appointment to enjoy your membership benefits.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveTab("book")}>Book Now</Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-4 mt-6">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <CardTitle>{appointment.title}</CardTitle>
                    <CardDescription>{appointment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <Spa className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{appointment.location}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="mr-1 h-3 w-3" /> {appointment.date}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" /> {appointment.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Past Bookings</CardTitle>
                  <CardDescription>You don't have any past appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your completed appointments will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="book" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Book New Session</CardTitle>
                    <CardDescription>Choose from available wellness experiences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointmentTypes.map((appointmentType) => (
                        <div
                          key={appointmentType.type}
                          className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleBookingClick(appointmentType.type, appointmentType.title)}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            {appointmentType.type === "spa" ? (
                              <Spa className="h-6 w-6 text-amber-600" />
                            ) : (
                              <CalendarDays className="h-6 w-6 text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{appointmentType.title}</h3>
                            <p className="text-sm text-muted-foreground">{appointmentType.description}</p>
                            <div className="mt-2 text-xs text-amber-600">
                              {appointmentType.remaining} remaining of {appointmentType.type === "spa" ? 4 : 1}
                            </div>
                          </div>
                          <Button size="sm">Select</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <QuickAvailabilityView appointmentType="spa" onBookSlot={handleQuickBookSlot} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Dialog */}
      {selectedAppointmentType && (
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <BookingForm
              appointmentType={selectedAppointmentType.type}
              appointmentTitle={selectedAppointmentType.title}
              onSuccess={() => {
                setIsBookingOpen(false)
                setQuickBookDate("")
                setQuickBookTime("")
              }}
              onCancel={() => {
                setIsBookingOpen(false)
                setQuickBookDate("")
                setQuickBookTime("")
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <Dialog open={isReschedulingOpen} onOpenChange={setIsReschedulingOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <RescheduleForm
              appointmentId={selectedAppointment.id}
              appointmentType={selectedAppointment.type}
              currentDate={selectedAppointment.date}
              currentTime={selectedAppointment.time}
              onSuccess={() => setIsReschedulingOpen(false)}
              onCancel={() => setIsReschedulingOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      {selectedAppointment && (
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium">Appointment Details:</p>
              <ul className="mt-2 text-sm text-muted-foreground">
                <li>Date: {selectedAppointment.date}</li>
                <li>Time: {selectedAppointment.time}</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Keep Appointment
              </Button>
              <Button variant="destructive" onClick={handleCancelConfirm} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  )
}
