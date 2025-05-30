"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { getMonth, getYear, startOfMonth } from "date-fns"
import { getAvailableDatesInMonth } from "@/actions/availability-actions"
import type { AppointmentType } from "@/types/appointment"
import { DayProps } from "react-day-picker"

interface AvailabilityCalendarProps {
  appointmentType: AppointmentType
  selectedDate: Date | undefined
  onSelect: (date: Date | undefined) => void
  className?: string
}

export function AvailabilityCalendar({
  appointmentType,
  selectedDate,
  onSelect,
  className,
}: AvailabilityCalendarProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [availableDates, setAvailableDates] = useState<Record<string, number[]>>({})
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()))

  // Fetch available dates when the month or appointment type changes
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoading(true)
      try {
        const month = getMonth(currentMonth)
        const year = getYear(currentMonth)

        const result = await getAvailableDatesInMonth(month, year, appointmentType)

        if (result.success) {
          setAvailableDates((prev) => ({
            ...prev,
            [`${year}-${month}`]: result.dates,
          }))
        }
      } catch (error) {
        console.error("Error fetching available dates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableDates()
  }, [currentMonth, appointmentType])

  // Handle month change
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(startOfMonth(date))
  }

  // Check if a date is available
  const isDateAvailable = (date: Date | undefined) => {
    if (!date) return false
    
    const month = getMonth(date)
    const year = getYear(date)
    const day = date.getDate()

    const key = `${year}-${month}`
    return availableDates[key]?.includes(day) || false
  }

  // Custom day renderer to show availability
  const renderDay = (props: DayProps) => {
    const day = props.date as Date
    const isAvailable = isDateAvailable(day)
    const isSelected = selectedDate && day.getTime() === selectedDate.getTime()

    return (
      <div
        className={`relative flex h-9 w-9 items-center justify-center p-0 font-normal ${
          isAvailable
            ? "hover:bg-primary hover:text-primary-foreground"
            : "text-muted-foreground opacity-50 cursor-not-allowed"
        } ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
      >
        {day.getDate()}
        {isAvailable && !isSelected && (
          <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"></div>
        )}
      </div>
    )
  }

  // Custom day click handler to only allow selecting available dates
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return
    if (isDateAvailable(day)) {
      onSelect(day)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDayClick}
      onMonthChange={handleMonthChange}
      className={className}
      disabled={(date) => {
        // Disable dates in the past and unavailable dates
        return date < new Date(new Date().setHours(0, 0, 0, 0)) || !isDateAvailable(date)
      }}
      components={{
        Day: renderDay,
      }}
      initialFocus
    />
  )
}
