import type { Appointment, AppointmentType, Location } from "@/types/appointment"
import { nanoid } from "nanoid"

// Define AppointmentStatus type
type AppointmentStatus = "upcoming" | "completed" | "cancelled"

// Mock database for appointments
const appointments: Appointment[] = [
  {
    id: "appt-1",
    userId: "user-1",
    type: "spa",
    title: "Couple Day Spa Session",
    description: "Aromatherapy & Deep Tissue Massage",
    date: "2025-06-15",
    time: "10:00",
    duration: 120,
    location: "Ode Life Spa - Mumbai",
    status: "upcoming",
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-05-01T10:00:00Z",
  },
  {
    id: "appt-2",
    userId: "user-1",
    type: "spa",
    title: "Couple Day Spa Session",
    description: "Swedish Massage & Facial",
    date: "2025-05-10",
    time: "14:00",
    duration: 120,
    location: "Ode Life Spa - Delhi",
    status: "completed",
    createdAt: "2025-04-15T10:00:00Z",
    updatedAt: "2025-05-10T16:00:00Z",
  },
  {
    id: "appt-3",
    userId: "user-2",
    type: "wellness-checkup",
    title: "Yearly Wellness Check-up",
    description: "Comprehensive Health Assessment",
    date: "2025-08-22",
    time: "09:30",
    duration: 180,
    location: "Ode Life Wellness Center - Bangalore",
    status: "upcoming",
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-05-01T10:00:00Z",
  },
  {
    id: "appt-4",
    userId: "user-3",
    type: "spa",
    title: "Couple Day Spa Session",
    description: "Signature Rejuvenation Package",
    date: "2025-06-20",
    time: "13:00",
    duration: 180,
    location: "Ode Life Spa - Mumbai",
    status: "upcoming",
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-05-01T10:00:00Z",
  },
  {
    id: "appt-5",
    userId: "user-3",
    type: "wellness-checkup",
    title: "Yearly Wellness Check-up",
    description: "Premium Health Assessment",
    date: "2025-06-05",
    time: "11:00",
    duration: 120,
    location: "Ode Life Wellness Center - Mumbai",
    status: "upcoming",
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-05-01T10:00:00Z",
  },
]

// Mock locations
export const locations: Location[] = [
  {
    id: "loc-1",
    name: "Ode Life Spa - Mumbai",
    address: "123 Luxury Lane, Bandra",
    city: "Mumbai",
  },
  {
    id: "loc-2",
    name: "Ode Life Spa - Delhi",
    address: "456 Wellness Way, Connaught Place",
    city: "Delhi",
  },
  {
    id: "loc-3",
    name: "Ode Life Spa - Bangalore",
    address: "789 Serenity Street, Indiranagar",
    city: "Bangalore",
  },
  {
    id: "loc-4",
    name: "Ode Life Wellness Center - Mumbai",
    address: "321 Rejuvenation Road, Juhu",
    city: "Mumbai",
  },
  {
    id: "loc-5",
    name: "Ode Life Wellness Center - Bangalore",
    address: "654 Tranquility Trail, Koramangala",
    city: "Bangalore",
  },
]

// Mock available appointment types based on membership
export const membershipAppointmentTypes: Record<
  string,
  { type: AppointmentType; title: string; description: string; remaining: number }[]
> = {
  essential: [
    {
      type: "spa",
      title: "Couple Day Spa Session",
      description: "Choose from various massage and treatment options",
      remaining: 3,
    },
    {
      type: "wellness-stay",
      title: "4N/5D Couple Stay with Wellness Program",
      description: "Immersive wellness retreat experience",
      remaining: 1,
    },
  ],
  classic: [
    {
      type: "spa",
      title: "Couple Day Spa Session",
      description: "Choose from various massage and treatment options",
      remaining: 2,
    },
    {
      type: "wellness-stay",
      title: "1 Week Stay with Wellness Program",
      description: "Immersive wellness retreat experience",
      remaining: 1,
    },
    {
      type: "wellness-checkup",
      title: "Yearly Wellness Check-up for Couple",
      description: "Comprehensive health assessment",
      remaining: 1,
    },
  ],
  signature: [
    {
      type: "spa",
      title: "Couple Day Spa Session",
      description: "Choose from premium massage and treatment options",
      remaining: 4,
    },
    {
      type: "wellness-stay",
      title: "1 Week Stay with Wellness Program",
      description: "Luxury wellness retreat experience",
      remaining: 1,
    },
    {
      type: "wellness-checkup",
      title: "Yearly Wellness Check-up for Couple",
      description: "Premium health assessment",
      remaining: 1,
    },
  ],
}

// Helper functions to interact with the mock database
export function getUserAppointments(userId: string, status?: AppointmentStatus): Appointment[] {
  if (status) {
    return appointments.filter((appointment) => appointment.userId === userId && appointment.status === status)
  }
  return appointments.filter((appointment) => appointment.userId === userId)
}

export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find((appointment) => appointment.id === id)
}

export function createAppointment(
  userId: string,
  type: AppointmentType,
  title: string,
  description: string,
  date: string,
  time: string,
  duration: number,
  location: string,
): Appointment {
  const now = new Date().toISOString()
  const newAppointment: Appointment = {
    id: `appt-${nanoid(6)}`,
    userId,
    type,
    title,
    description,
    date,
    time,
    duration,
    location,
    status: "upcoming",
    createdAt: now,
    updatedAt: now,
  }

  appointments.push(newAppointment)
  return newAppointment
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const index = appointments.findIndex((appointment) => appointment.id === id)
  if (index === -1) return null

  const updatedAppointment = {
    ...appointments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  appointments[index] = updatedAppointment
  return updatedAppointment
}

export function cancelAppointment(id: string): Appointment | null {
  return updateAppointment(id, { status: "cancelled" })
}

// Generate available time slots for a given date
export function getAvailableTimeSlots(date: string, type: AppointmentType): string[] {
  // In a real app, this would check a database for available slots
  // For this demo, we'll return some mock time slots
  const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

  // Filter out times that are already booked
  const bookedTimes = appointments
    .filter((appointment) => appointment.date === date && appointment.status === "upcoming")
    .map((appointment) => appointment.time)

  return allTimeSlots.filter((time) => !bookedTimes.includes(time))
}

// Get treatment options for a given appointment type
export function getTreatmentOptions(
  type: AppointmentType,
): { id: string; title: string; description: string; duration: number }[] {
  if (type === "spa") {
    return [
      {
        id: "spa-1",
        title: "Aromatherapy & Deep Tissue Massage",
        description: "A therapeutic massage using essential oils and deep pressure techniques",
        duration: 120,
      },
      {
        id: "spa-2",
        title: "Swedish Massage & Facial",
        description: "A relaxing full-body massage followed by a rejuvenating facial",
        duration: 120,
      },
      {
        id: "spa-3",
        title: "Hot Stone Therapy & Swedish Massage",
        description: "Heated stones placed on key points combined with a gentle massage",
        duration: 120,
      },
      {
        id: "spa-4",
        title: "Signature Rejuvenation Package",
        description: "Our premium treatment combining multiple therapies for total relaxation",
        duration: 180,
      },
    ]
  } else if (type === "wellness-checkup") {
    return [
      {
        id: "check-1",
        title: "Comprehensive Health Assessment",
        description: "Complete physical examination and health consultation",
        duration: 120,
      },
      {
        id: "check-2",
        title: "Premium Health Assessment",
        description: "Extensive health screening with advanced diagnostics",
        duration: 180,
      },
    ]
  } else {
    return [
      {
        id: "stay-1",
        title: "Wellness Retreat Package",
        description: "Immersive wellness experience with personalized program",
        duration: 0, // Duration in days handled separately
      },
    ]
  }
}
