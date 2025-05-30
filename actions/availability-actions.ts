"use server"
import { format, parse } from "date-fns"
import { z } from "zod"
import {
  generateAvailableTimeSlots,
  getAvailableDatesForMonth,
  getNextAvailableDate,
  getSlotAvailability,
  getBusyTimesOfDay,
} from "@/lib/availability-service"
import type { AppointmentType } from "@/types/appointment"

// Validation schema for checking availability
const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["spa", "wellness-stay", "wellness-checkup"]),
})

const monthAvailabilitySchema = z.object({
  month: z.number().min(0).max(11),
  year: z.number().min(2020).max(2100),
  type: z.enum(["spa", "wellness-stay", "wellness-checkup"]),
})

// Get available time slots for a specific date
export async function getAvailableSlots(date: string, type: AppointmentType): Promise<{ success: boolean; slots: string[]; message?: string }> {
  try {
    // Validate input
    const validatedData = availabilitySchema.parse({ date, type })

    // Parse the date string to a Date object
    const dateObj = parse(validatedData.date, "yyyy-MM-dd", new Date())

    // Get available time slots
    const slots = generateAvailableTimeSlots(dateObj, validatedData.type)

    return {
      success: true,
      slots,
    }
  } catch (error) {
    console.error("Error getting available slots:", error)
    return {
      success: false,
      message: "Failed to get available time slots",
      slots: [],
    }
  }
}

// Get available dates for a specific month
export async function getAvailableDatesInMonth(month: number, year: number, type: AppointmentType) {
  try {
    // Validate input
    const validatedData = monthAvailabilitySchema.parse({ month, year, type })

    // Get available dates
    const availableDates = getAvailableDatesForMonth(validatedData.month, validatedData.year, validatedData.type)

    return {
      success: true,
      dates: availableDates,
    }
  } catch (error) {
    console.error("Error getting available dates:", error)
    return {
      success: false,
      message: "Failed to get available dates",
      dates: [],
    }
  }
}

// Get the next available date
export async function getNextAvailableSlot(type: AppointmentType) {
  try {
    const nextDate = getNextAvailableDate(type)

    if (!nextDate) {
      return {
        success: false,
        message: "No available slots found in the next 30 days",
      }
    }

    const formattedDate = format(nextDate, "yyyy-MM-dd")
    const slots = generateAvailableTimeSlots(nextDate, type)

    return {
      success: true,
      date: formattedDate,
      slots,
    }
  } catch (error) {
    console.error("Error getting next available slot:", error)
    return {
      success: false,
      message: "Failed to get next available slot",
    }
  }
}

// Check if a specific slot is available
export async function checkSlotAvailability(date: string, time: string, type: AppointmentType) {
  try {
    // Validate date
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return {
        success: false,
        message: "Invalid date format",
        available: false,
      }
    }

    // Validate time
    if (!time.match(/^\d{2}:\d{2}$/)) {
      return {
        success: false,
        message: "Invalid time format",
        available: false,
      }
    }

    const availability = getSlotAvailability(date, time, type)

    return {
      success: true,
      available: availability.available,
      reason: availability.reason,
    }
  } catch (error) {
    console.error("Error checking slot availability:", error)
    return {
      success: false,
      message: "Failed to check slot availability",
      available: false,
    }
  }
}

// Get busy times for a specific date (for heatmap)
export async function getBusyTimes(date: string) {
  try {
    // Validate date
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return {
        success: false,
        message: "Invalid date format",
        busyTimes: {},
      }
    }

    const busyTimes = getBusyTimesOfDay(date)

    return {
      success: true,
      busyTimes,
    }
  } catch (error) {
    console.error("Error getting busy times:", error)
    return {
      success: false,
      message: "Failed to get busy times",
      busyTimes: {},
    }
  }
}
