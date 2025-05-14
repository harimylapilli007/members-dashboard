"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { TimeSlotSelector } from "@/components/time-slot-selector"
import { AvailabilityStatus } from "@/components/availability-status"
import { BusyTimesHeatmap } from "@/components/busy-times-heatmap"
import type { AppointmentType } from "@/types/appointment"
import { bookAppointment, getLocations, getTreatments, getNextAvailableSlot } from "@/actions/appointment-actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  type: z.enum(["spa", "wellness-stay", "wellness-checkup"]),
  treatmentId: z.string().min(1, "Please select a treatment"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
  locationId: z.string().min(1, "Please select a location"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface BookingFormProps {
  appointmentType: AppointmentType
  appointmentTitle: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function BookingForm({ appointmentType, appointmentTitle, onSuccess, onCancel }: BookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<{ id: string; name: string; city: string }[]>([])
  const [treatments, setTreatments] = useState<{ id: string; title: string; description: string }[]>([])
  const [dateSelectionTab, setDateSelectionTab] = useState<"calendar" | "next-available">("calendar")
  const [isCheckingNextAvailable, setIsCheckingNextAvailable] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: appointmentType,
      notes: "",
    },
  })

  // Fetch locations and treatments when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, treatmentsData] = await Promise.all([getLocations(), getTreatments(appointmentType)])

        setLocations(locationsData)
        setTreatments(treatmentsData)
      } catch (error) {
        console.error("Error fetching form data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [appointmentType])

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
      formData.append("type", data.type)
      formData.append("treatmentId", data.treatmentId)
      formData.append("date", format(data.date, "yyyy-MM-dd"))
      formData.append("time", data.time)
      formData.append("locationId", data.locationId)
      if (data.notes) {
        formData.append("notes", data.notes)
      }

      // Submit the form
      const result = await bookAppointment(formData)

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
      console.error("Error booking appointment:", error)
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
            <h3 className="text-lg font-medium">Book {appointmentTitle}</h3>
            <p className="text-sm text-muted-foreground">Fill in the details below to book your appointment.</p>
          </div>

          <FormField
            control={form.control}
            name="treatmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a treatment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {treatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Choose the treatment you would like to book.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>Date & Time</FormLabel>

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
                        <FormLabel className="mb-2">Date</FormLabel>
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
                          <FormLabel>Time</FormLabel>
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

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Choose the location for your appointment.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any special requests or preferences..." className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Optional: Add any special requests or preferences.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Book Appointment
          </Button>
        </div>
      </form>
    </Form>
  )
}
