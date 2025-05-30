"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { AppointmentType } from "@/types/appointment"
import { generateAvailableTimeSlots, getNextAvailableDate } from "@/lib/availability-service"
import { format } from "date-fns"

// Mock user ID - in a real app, this would come from authentication
const MOCK_USER_ID = "user-1"

// Mock data
export const locations = [
  { id: "loc-1", name: "Wellness Center - Main Branch", city: "Mumbai" },
  { id: "loc-2", name: "Wellness Resort - Beach Location", city: "Goa" },
  { id: "loc-3", name: "Wellness Center - Downtown", city: "Bangalore" },
]

export const membershipAppointmentTypes: Record<string, Array<{ type: AppointmentType; title: string }>> = {
  essential: [
    { type: "spa", title: "Couple Day Spa Session" },
    { type: "wellness-stay", title: "4N/5D Couple Stay with Wellness Program" },
  ],
  classic: [
    { type: "spa", title: "Couple Day Spa Session" },
    { type: "wellness-stay", title: "4N/5D Couple Stay with Wellness Program" },
    { type: "wellness-checkup", title: "Annual Wellness Checkup" },
  ],
  signature: [
    { type: "spa", title: "Couple Day Spa Session" },
    { type: "wellness-stay", title: "4N/5D Couple Stay with Wellness Program" },
    { type: "wellness-checkup", title: "Quarterly Wellness Checkup" },
  ],
}

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
  return locations.map(location => ({
    id: location.id,
    name: location.name,
    city: location.city
  }))
}

// Get available time slots for a date
export async function getAvailableTimes(date: string, type: AppointmentType) {
  // Return mock time slots
  return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
}

// Get treatment options for an appointment type
export async function getTreatments(type: AppointmentType) {
  const treatments = {
    spa: [
      {
        id: "spa-1",
        title: "Swedish Massage",
        description: "Relaxing full body massage",
        duration: 120,
      },
      {
        id: "spa-2",
        title: "Deep Tissue Massage",
        description: "Therapeutic massage targeting deep muscle tissue",
        duration: 120,
      },
    ],
    "wellness-stay": [
      {
        id: "stay-1",
        title: "Detox Program",
        description: "Comprehensive detox and wellness program",
        duration: 60,
      },
      {
        id: "stay-2",
        title: "Stress Management Retreat",
        description: "Focus on stress relief and mental wellness",
        duration: 60,
      },
    ],
    "wellness-checkup": [
      {
        id: "checkup-1",
        title: "Complete Health Assessment",
        description: "Comprehensive health and wellness evaluation",
        duration: 180,
      },
    ],
  }
  return treatments[type] || []
}

// Book a new appointment
export async function bookAppointment(formData: FormData) {
  try {
    // Parse and validate form data
    const data = Object.fromEntries(formData.entries())
    const validatedData = bookAppointmentSchema.parse(data)

    // Get treatment details
    const treatments = await getTreatments(validatedData.type as AppointmentType)
    const treatment = treatments.find((t) => t.id === validatedData.treatmentId)

    if (!treatment) {
      return { success: false, message: "Invalid treatment selected" }
    }

    // Get location details
    const location = locations.find((l) => l.id === validatedData.locationId)

    if (!location) {
      return { success: false, message: "Invalid location selected" }
    }

    // Mock appointment creation
    const appointment = {
      id: `apt-${Date.now()}`,
      userId: MOCK_USER_ID,
      type: validatedData.type,
      title: treatment.title,
      description: treatment.description,
      date: validatedData.date,
      time: validatedData.time,
      duration: treatment.duration,
      location: location.name,
      status: "upcoming",
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

    // Mock appointment update
    const updatedAppointment = {
      id: validatedData.appointmentId,
      date: validatedData.date,
      time: validatedData.time,
      status: "upcoming",
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

    // Mock appointment cancellation
    const updatedAppointment = {
      id: appointmentId,
      status: "cancelled",
    }

    // Revalidate the dashboard and bookings pages
    revalidatePath("/dashboard/essential")
    revalidatePath("/dashboard/essential/bookings")
    revalidatePath("/dashboard/memberships")
    revalidatePath("/dashboard/memberships/bookings")
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
