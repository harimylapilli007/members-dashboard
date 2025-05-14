"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { getAvailableSlots } from "@/actions/availability-actions"
import { cn } from "@/lib/utils"
import type { AppointmentType } from "@/types/appointment"

interface TimeSlotSelectorProps {
  date: Date | undefined
  appointmentType: AppointmentType
  selectedTime: string | undefined
  onSelectTime: (time: string) => void
  className?: string
}

export function TimeSlotSelector({
  date,
  appointmentType,
  selectedTime,
  onSelectTime,
  className,
}: TimeSlotSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch available time slots when the date changes
  useEffect(() => {
    if (!date) {
      setTimeSlots([])
      return
    }

    const fetchTimeSlots = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const result = await getAvailableSlots(formattedDate, appointmentType)

        if (result.success) {
          setTimeSlots(result.slots)

          // If the currently selected time is not available, clear it
          if (selectedTime && !result.slots.includes(selectedTime)) {
            onSelectTime("")
          }

          // If there are no available slots, show an error
          if (result.slots.length === 0) {
            setError("No available time slots for this date. Please select another date.")
          }
        } else {
          setError(result.message || "Failed to load time slots")
          setTimeSlots([])
        }
      } catch (error) {
        console.error("Error fetching time slots:", error)
        setError("An error occurred while fetching time slots")
        setTimeSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeSlots()
  }, [date, appointmentType, selectedTime, onSelectTime])

  // Group time slots by morning, afternoon, and evening
  const morningSlots = timeSlots.filter((time) => {
    const hour = Number.parseInt(time.split(":")[0], 10)
    return hour >= 9 && hour < 12
  })

  const afternoonSlots = timeSlots.filter((time) => {
    const hour = Number.parseInt(time.split(":")[0], 10)
    return hour >= 12 && hour < 17
  })

  const eveningSlots = timeSlots.filter((time) => {
    const hour = Number.parseInt(time.split(":")[0], 10)
    return hour >= 17
  })

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
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className={cn("text-center py-4 text-destructive", className)}>{error}</div>
  }

  if (!date) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground", className)}>
        Please select a date to view available time slots.
      </div>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground", className)}>
        No available time slots for this date. Please select another date.
      </div>
    )
  }

  return (
    <div className={className}>
      {morningSlots.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Morning</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {morningSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onSelectTime(time)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm transition-colors",
                  selectedTime === time
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {formatTimeDisplay(time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Afternoon</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {afternoonSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onSelectTime(time)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm transition-colors",
                  selectedTime === time
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {formatTimeDisplay(time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {eveningSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Evening</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {eveningSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onSelectTime(time)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm transition-colors",
                  selectedTime === time
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {formatTimeDisplay(time)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
