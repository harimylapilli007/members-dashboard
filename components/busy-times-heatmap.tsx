"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { getBusyTimes } from "@/actions/availability-actions"
import { cn } from "@/lib/utils"

interface BusyTimesHeatmapProps {
  date: Date | undefined
  className?: string
}

export function BusyTimesHeatmap({ date, className }: BusyTimesHeatmapProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [busyTimes, setBusyTimes] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!date) {
      setBusyTimes({})
      return
    }

    const fetchBusyTimes = async () => {
      setIsLoading(true)

      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const result = await getBusyTimes(formattedDate)

        if (result.success) {
          setBusyTimes(result.busyTimes)
        } else {
          setBusyTimes({})
        }
      } catch (error) {
        console.error("Error fetching busy times:", error)
        setBusyTimes({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusyTimes()
  }, [date])

  if (!date) {
    return null
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading busy times...
      </div>
    )
  }

  // Get the maximum number of bookings in any hour
  const maxBookings = Math.max(...Object.values(busyTimes), 1)

  // Format hour for display
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12} ${ampm}`
  }

  // Get color based on busyness
  const getColor = (count: number) => {
    const intensity = Math.min(count / maxBookings, 1)

    if (intensity === 0) return "bg-green-100"
    if (intensity < 0.3) return "bg-green-200"
    if (intensity < 0.6) return "bg-yellow-200"
    if (intensity < 0.8) return "bg-orange-200"
    return "bg-red-200"
  }

  // Get label based on busyness
  const getLabel = (count: number) => {
    if (count === 0) return "Not busy"
    if (count === 1) return "1 booking"
    return `${count} bookings`
  }

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-2">Busy Times</h4>
      <div className="grid grid-cols-9 gap-1">
        {Object.entries(busyTimes).map(([hour, count]) => (
          <div key={hour} className="flex flex-col items-center">
            <div
              className={cn("w-full h-6 rounded-sm", getColor(count))}
              title={`${formatHour(Number.parseInt(hour, 10))}: ${getLabel(count)}`}
            />
            <span className="text-xs mt-1">{formatHour(Number.parseInt(hour, 10))}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Less busy</span>
        <span>More busy</span>
      </div>
    </div>
  )
}
