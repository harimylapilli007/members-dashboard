import { addDays, addMinutes, format, isAfter, isBefore, isSameDay, parse } from "date-fns"
import { getUserAppointments } from "./appointment-db"
import type { AppointmentType } from "@/types/appointment"

// Constants for business hours
const BUSINESS_HOURS = {
  start: { hour: 9, minute: 0 }, // 9:00 AM
  end: { hour: 18, minute: 0 }, // 6:00 PM
}

// Slot duration in minutes by appointment type
const SLOT_DURATION: Record<AppointmentType, number> = {
  spa: 120, // 2 hours
  "wellness-stay": 60, // 1 hour for initial consultation
  "wellness-checkup": 180, // 3 hours
}

// Buffer time between appointments in minutes
const BUFFER_TIME = 30

// Maximum days in advance that can be booked
const MAX_ADVANCE_DAYS = 60

// Special dates that are unavailable (holidays, maintenance, etc.)
const UNAVAILABLE_DATES = [
  "2025-05-26", // Example holiday
  "2025-07-04", // Example holiday
  "2025-08-15", // Example maintenance day
]

// Get all booked slots for a specific date
export function getBookedSlots(date: string): { start: Date; end: Date }[] {
  // Get all appointments for the date
  const allAppointments = getUserAppointments("all", "upcoming")
  const dateAppointments = allAppointments.filter((appointment) => appointment.date === date)

  return dateAppointments.map((appointment) => {
    const startTime = parse(`${appointment.date} ${appointment.time}`, "yyyy-MM-dd HH:mm", new Date())
    const endTime = addMinutes(startTime, appointment.duration)
    return { start: startTime, end: endTime }
  })
}

// Check if a specific date is available for booking
export function isDateAvailable(date: Date, type: AppointmentType): boolean {
  // Check if date is in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (isBefore(date, today)) {
    return false
  }

  // Check if date is too far in the future
  const maxDate = addDays(today, MAX_ADVANCE_DAYS)
  if (isAfter(date, maxDate)) {
    return false
  }

  // Check if date is a weekend (0 = Sunday, 6 = Saturday)
  const day = date.getDay()
  if (day === 0) {
    return false // Closed on Sundays
  }

  // Check if date is in the unavailable dates list
  const dateString = format(date, "yyyy-MM-dd")
  if (UNAVAILABLE_DATES.includes(dateString)) {
    return false
  }

  // For wellness-stay, only allow bookings on Monday, Wednesday, and Friday
  if (type === "wellness-stay" && ![1, 3, 5].includes(day)) {
    return false
  }

  return true
}

// Generate available time slots for a specific date and appointment type
export function generateAvailableTimeSlots(date: Date, type: AppointmentType): string[] {
  // Check if date is available at all
  if (!isDateAvailable(date, type)) {
    return []
  }

  const dateString = format(date, "yyyy-MM-dd")
  const bookedSlots = getBookedSlots(dateString)
  const slotDuration = SLOT_DURATION[type]
  const slots: string[] = []

  // Start time
  let currentTime = new Date(date)
  currentTime.setHours(BUSINESS_HOURS.start.hour, BUSINESS_HOURS.start.minute, 0, 0)

  // End time
  const endTime = new Date(date)
  endTime.setHours(BUSINESS_HOURS.end.hour, BUSINESS_HOURS.end.minute, 0, 0)

  // Adjust for Saturday (shorter hours)
  if (date.getDay() === 6) {
    endTime.setHours(14, 0, 0, 0) // Close at 2 PM on Saturdays
  }

  // Generate slots
  while (isBefore(currentTime, endTime)) {
    const slotEnd = addMinutes(currentTime, slotDuration)

    // Check if slot end time is after business hours
    if (isAfter(slotEnd, endTime)) {
      break
    }

    // Check if slot overlaps with any booked slots
    const isOverlapping = bookedSlots.some((bookedSlot) => {
      // Add buffer time to booked slots
      const bookedStart = addMinutes(bookedSlot.start, -BUFFER_TIME)
      const bookedEnd = addMinutes(bookedSlot.end, BUFFER_TIME)

      // Check for overlap
      return (
        ((isAfter(currentTime, bookedStart) || isSameDay(currentTime, bookedStart)) &&
          (isBefore(currentTime, bookedEnd) || isSameDay(currentTime, bookedEnd))) ||
        ((isAfter(slotEnd, bookedStart) || isSameDay(slotEnd, bookedStart)) &&
          (isBefore(slotEnd, bookedEnd) || isSameDay(slotEnd, bookedEnd)))
      )
    })

    if (!isOverlapping) {
      slots.push(format(currentTime, "HH:mm"))
    }

    // Move to next slot
    currentTime = addMinutes(currentTime, 30) // 30-minute increments
  }

  return slots
}

// Get available dates for the next N days
export function getAvailableDatesForMonth(month: number, year: number, type: AppointmentType): number[] {
  const availableDays: number[] = []

  // Create a date for the first day of the month
  const firstDay = new Date(year, month, 1)

  // Get the number of days in the month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Check each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (isDateAvailable(date, type)) {
      // Check if there are any available time slots for this date
      const slots = generateAvailableTimeSlots(date, type)
      if (slots.length > 0) {
        availableDays.push(day)
      }
    }
  }

  return availableDays
}

// Get the next available date
export function getNextAvailableDate(type: AppointmentType): Date | null {
  const today = new Date()
  let currentDate = today

  // Check the next 30 days
  for (let i = 0; i < 30; i++) {
    if (isDateAvailable(currentDate, type)) {
      const slots = generateAvailableTimeSlots(currentDate, type)
      if (slots.length > 0) {
        return currentDate
      }
    }
    currentDate = addDays(currentDate, 1)
  }

  return null
}

// Get availability status for a specific date and time
export function getSlotAvailability(
  date: string,
  time: string,
  type: AppointmentType,
): {
  available: boolean
  reason?: string
} {
  const dateObj = parse(date, "yyyy-MM-dd", new Date())

  if (!isDateAvailable(dateObj, type)) {
    return {
      available: false,
      reason: "This date is not available for booking.",
    }
  }

  const availableSlots = generateAvailableTimeSlots(dateObj, type)

  if (!availableSlots.includes(time)) {
    return {
      available: false,
      reason: "This time slot is not available. It may be booked or outside business hours.",
    }
  }

  return { available: true }
}

// Get busy times of day (for heatmap visualization)
export function getBusyTimesOfDay(date: string): Record<string, number> {
  const bookedSlots = getBookedSlots(date)
  const busyTimes: Record<string, number> = {}

  // Initialize all hours with 0
  for (let hour = BUSINESS_HOURS.start.hour; hour < BUSINESS_HOURS.end.hour; hour++) {
    busyTimes[`${hour}`] = 0
  }

  // Count bookings for each hour
  bookedSlots.forEach((slot) => {
    const hour = slot.start.getHours()
    if (busyTimes[`${hour}`] !== undefined) {
      busyTimes[`${hour}`] += 1
    }
  })

  return busyTimes
}
