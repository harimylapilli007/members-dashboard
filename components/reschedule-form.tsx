"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast, toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { TimeSlotSelector } from "@/components/time-slot-selector"
import { AvailabilityStatus } from "@/components/availability-status"
import { BusyTimesHeatmap } from "@/components/busy-times-heatmap"
import type { AppointmentType } from "@/types/appointment"
import { getNextAvailableSlot, rescheduleAppointment } from "@/actions/appointment-actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
})

type FormValues = z.infer<typeof formSchema>

interface RescheduleFormProps {
  appointmentId: string
  appointmentType: AppointmentType
  currentDate: string
  currentTime: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function RescheduleForm({
  appointmentId,
  appointmentType,
  currentDate,
  currentTime,
  onSuccess,
  onCancel,
}: RescheduleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [dateSelectionTab, setDateSelectionTab] = useState<"calendar" | "next-available">("calendar")
  const [isCheckingNextAvailable, setIsCheckingNextAvailable] = useState(false)

  // Parse the current date
  const parsedDate = new Date(currentDate)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: parsedDate,
      time: currentTime,
    },
  })

  // Handle finding the next available slot
  const handleFindNextAvailable = async () => {
    setIsCheckingNextAvailable(true)

    try {
      const result = await getNextAvailableSlot(appointmentType)

      if (result.success && result.date && result.slots.length > 0) {
        // Set the form values
        form.setValue("date", new Date(result.date))
        form.setValue("time", result.slots[0])

        toast({
          title: "Success",
          description: "Found the next available slot!",
        })
      } else {
        toast({
          title: "No Available Slots",
          description: result.message || "No available slots found. Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error finding next available slot:", error)
      toast({
        title: "Error",
        description: "Failed to find the next available slot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingNextAvailable(false)
    }
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    try {
      // Create FormData object
      const formData = new FormData()
      formData.append("appointmentId", appointmentId)
      formData.append("date", format(data.date, "yyyy-MM-dd"))
      formData.append("time", data.time)

      // Submit the form
      const result = await rescheduleAppointment(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Refresh the page or redirect
        router.refresh()

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get the current values from the form
  const selectedDate = form.watch("date")
  const selectedTime = form.watch("time")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Reschedule Appointment</h3>
            <p className="text-sm text-muted-foreground">Select a new date and time for your appointment.</p>
          </div>

          <div className="space-y-3">
            <FormLabel>New Date & Time</FormLabel>

            <Tabs
              value={dateSelectionTab}
              onValueChange={(value) => setDateSelectionTab(value as "calendar" | "next-available")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar">Select Date & Time</TabsTrigger>
                <TabsTrigger value="next-available">Find Next Available</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mb-2">New Date</FormLabel>
                        <FormControl>
                          <AvailabilityCalendar
                            appointmentType={appointmentType}
                            selectedDate={field.value}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Time</FormLabel>
                          <FormControl>
                            <TimeSlotSelector
                              date={selectedDate}
                              appointmentType={appointmentType}
                              selectedTime={field.value}
                              onSelectTime={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedDate && <BusyTimesHeatmap date={selectedDate} className="mt-4" />}
                  </div>
                </div>

                <AvailabilityStatus
                  date={selectedDate}
                  time={selectedTime}
                  appointmentType={appointmentType}
                  className="mt-2"
                />
              </TabsContent>

              <TabsContent value="next-available">
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-center text-muted-foreground">
                    Let us find the next available slot for your appointment.
                  </p>
                  <Button
                    type="button"
                    onClick={handleFindNextAvailable}
                    disabled={isCheckingNextAvailable}
                    className="w-full max-w-xs"
                  >
                    {isCheckingNextAvailable && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Find Next Available Slot
                  </Button>

                  {selectedDate && selectedTime && (
                    <div className="text-center mt-4">
                      <p className="font-medium">Next Available Slot:</p>
                      <p>
                        {format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
                      </p>
                      <AvailabilityStatus
                        date={selectedDate}
                        time={selectedTime}
                        appointmentType={appointmentType}
                        className="mt-2 justify-center"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-4 border rounded-md bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Current Appointment</h4>
            <p className="text-sm">Date: {currentDate}</p>
            <p className="text-sm">Time: {currentTime}</p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reschedule
          </Button>
        </div>
      </form>
    </Form>
  )
}
