"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { checkSlotAvailability } from "@/actions/availability-actions"
import { cn } from "@/lib/utils"
import type { AppointmentType } from "@/types/appointment"

interface AvailabilityStatusProps {
  date: Date | undefined
  time: string | undefined
  appointmentType: AppointmentType
  className?: string
}

export function AvailabilityStatus({ date, time, appointmentType, className }: AvailabilityStatusProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!date || !time) {
      setIsAvailable(null)
      setMessage(null)
      return
    }

    const checkAvailability = async () => {
      setIsLoading(true)

      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const result = await checkSlotAvailability(formattedDate, time, appointmentType)

        setIsAvailable(result.available)
        setMessage(result.reason || null)
      } catch (error) {
        console.error("Error checking availability:", error)
        setIsAvailable(false)
        setMessage("An error occurred while checking availability")
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to prevent too many requests when user is selecting
    const timeoutId = setTimeout(() => {
      checkAvailability()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [date, time, appointmentType])

  if (!date || !time) {
    return null
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center text-muted-foreground", className)}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking availability...
      </div>
    )
  }

  if (isAvailable === null) {
    return (
      <div className={cn("flex items-center text-muted-foreground", className)}>
        <Clock className="mr-2 h-4 w-4" />
        Select a date and time to check availability
      </div>
    )
  }

  if (isAvailable) {
    return (
      <div className={cn("flex items-center text-green-600", className)}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        This slot is available
      </div>
    )
  }

  return (
    <div className={cn("flex items-center text-destructive", className)}>
      <AlertCircle className="mr-2 h-4 w-4" />
      {message || "This slot is not available"}
    </div>
  )
}
