"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { Loader2 } from "lucide-react"
import { getAvailableSlots } from "@/actions/availability-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { AppointmentType } from "@/types/appointment"

interface QuickAvailabilityViewProps {
  appointmentType: AppointmentType
  onBookSlot?: (date: string, time: string) => void
}

export function QuickAvailabilityView({ appointmentType, onBookSlot }: QuickAvailabilityViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [nextDaysAvailability, setNextDaysAvailability] = useState<{ date: string; slots: string[] }[]>([])

  useEffect(() => {
    const fetchNextDaysAvailability = async () => {
      setIsLoading(true)

      try {
        const today = new Date()
        const nextDays = []

        // Check availability for the next 5 days
        for (let i = 0; i < 5; i++) {
          const date = addDays(today, i)
          const formattedDate = format(date, "yyyy-MM-dd")

          const result = await getAvailableSlots(formattedDate, appointmentType)

          if (result.success && result.slots.length > 0) {
            nextDays.push({
              date: formattedDate,
              slots: result.slots,
            })
          }

          // If we have 3 days with availability, stop checking
          if (nextDays.length >= 3) {
            break
          }
        }

        setNextDaysAvailability(nextDays)
      } catch (error) {
        console.error("Error fetching next days availability:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNextDaysAvailability()
  }, [appointmentType])

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "EEEE, MMMM d")
  }

  // Format time for display
  const formatTimeDisplay = (time: string) => {
    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour, 10)
    const ampm = hourNum >= 12 ? "PM" : "AM"
    const hour12 = hourNum % 12 || 12
    return `${hour12}:${minute} ${ampm}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Availability</CardTitle>
          <CardDescription>Checking available slots...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (nextDaysAvailability.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Availability</CardTitle>
          <CardDescription>No available slots in the next few days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn't find any available slots in the next few days. Please use the booking form to check availability
            for specific dates.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Availability</CardTitle>
        <CardDescription>Next available slots</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nextDaysAvailability.map((day) => (
            <div key={day.date} className="border rounded-md p-4">
              <h3 className="font-medium mb-2">{formatDateDisplay(day.date)}</h3>
              <div className="grid grid-cols-3 gap-2">
                {day.slots.slice(0, 3).map((time) => (
                  <Button
                    key={`${day.date}-${time}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onBookSlot?.(day.date, time)}
                  >
                    {formatTimeDisplay(time)}
                  </Button>
                ))}
                {day.slots.length > 3 && (
                  <Button variant="ghost" size="sm" onClick={() => onBookSlot?.(day.date, "")}>
                    +{day.slots.length - 3} more
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => onBookSlot?.("", "")}>
          Check More Dates
        </Button>
      </CardFooter>
    </Card>
  )
}
