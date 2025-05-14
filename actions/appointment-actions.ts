"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  cancelAppointment,
  createAppointment,
  getAvailableTimeSlots,
  getTreatmentOptions,
  locations,
  membershipAppointmentTypes,
  updateAppointment,
} from "@/lib/appointment-db"
import type { AppointmentType } from "@/types/appointment"
import { generateAvailableTimeSlots, getNextAvailableDate } from "@/lib/availability-service"
import { format } from "date-fns"

// Mock user ID - in a real app, this would come from authentication
const MOCK_USER_ID = "user-1"

// Validation schemas
const bookAppointmentSchema = z.object({
  type: z.enum(["spa", "wellness-stay", "wellness-checkup"]),
  treatmentId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  locationId: z.string(),
  notes: z.string().optional(),
})

const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

// Get appointment types for a membership tier
export async function getAppointmentTypes(membershipType: string) {
  return membershipAppointmentTypes[membershipType] || []
}

// Get available locations
export async function getLocations() {
  return locations
}

// Get available time slots for a date
export async function getAvailableTimes(date: string, type: AppointmentType) {
  return getAvailableTimeSlots(date, type)
}

// Get treatment options for an appointment type
export async function getTreatments(type: AppointmentType) {
  return getTreatmentOptions(type)
}

// Book a new appointment
export async function bookAppointment(formData: FormData) {
  try {
    // Parse and validate form data
    const data = Object.fromEntries(formData.entries())
    const validatedData = bookAppointmentSchema.parse(data)

    // Get treatment details
    const treatments = getTreatmentOptions(validatedData.type as AppointmentType)
    const treatment = treatments.find((t) => t.id === validatedData.treatmentId)

    if (!treatment) {
      return { success: false, message: "Invalid treatment selected" }
    }

    // Get location details
    const location = locations.find((l) => l.id === validatedData.locationId)

    if (!location) {
      return { success: false, message: "Invalid location selected" }
    }

    // Create the appointment
    const appointment = createAppointment(
      MOCK_USER_ID,
      validatedData.type as AppointmentType,
      treatment.title,
      treatment.description,
      validatedData.date,
      validatedData.time,
      treatment.duration,
      location.name,
    )

    // Revalidate the dashboard and bookings pages
    revalidatePath("/dashboard/essential")
    revalidatePath("/dashboard/essential/bookings")
    revalidatePath("/dashboard/classic")
    revalidatePath("/dashboard/classic/bookings")
    revalidatePath("/dashboard/signature")
    revalidatePath("/dashboard/signature/bookings")

    return {
      success: true,
      message: "Appointment booked successfully",
      appointment,
    }
  } catch (error) {
    console.error("Error booking appointment:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid form data", errors: error.errors }
    }
    return { success: false, message: "Failed to book appointment" }
  }
}

// Reschedule an appointment
export async function rescheduleAppointment(formData: FormData) {
  try {
    // Parse and validate form data
    const data = Object.fromEntries(formData.entries())
    const validatedData = rescheduleAppointmentSchema.parse(data)

    // Update the appointment
    const updatedAppointment = updateAppointment(validatedData.appointmentId, {
      date: validatedData.date,
      time: validatedData.time,
    })

    if (!updatedAppointment) {
      return { success: false, message: "Appointment not found" }
    }

    // Revalidate the dashboard and bookings pages
    revalidatePath("/dashboard/essential")
    revalidatePath("/dashboard/essential/bookings")
    revalidatePath("/dashboard/classic")
    revalidatePath("/dashboard/classic/bookings")
    revalidatePath("/dashboard/signature")
    revalidatePath("/dashboard/signature/bookings")

    return {
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    }
  } catch (error) {
    console.error("Error rescheduling appointment:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid form data", errors: error.errors }
    }
    return { success: false, message: "Failed to reschedule appointment" }
  }
}

// Cancel an appointment
export async function cancelAppointmentAction(formData: FormData) {
  try {
    const appointmentId = formData.get("appointmentId") as string

    if (!appointmentId) {
      return { success: false, message: "Appointment ID is required" }
    }

    const updatedAppointment = cancelAppointment(appointmentId)

    if (!updatedAppointment) {
      return { success: false, message: "Appointment not found" }
    }

    // Revalidate the dashboard and bookings pages
    revalidatePath("/dashboard/essential")
    revalidatePath("/dashboard/essential/bookings")
    revalidatePath("/dashboard/classic")
    revalidatePath("/dashboard/classic/bookings")
    revalidatePath("/dashboard/signature")
    revalidatePath("/dashboard/signature/bookings")

    return {
      success: true,
      message: "Appointment cancelled successfully",
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return { success: false, message: "Failed to cancel appointment" }
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
