export type AppointmentType = "spa" | "wellness-stay" | "wellness-checkup"

export type AppointmentStatus = "upcoming" | "completed" | "cancelled"

export interface Appointment {
  id: string
  userId: string
  type: AppointmentType
  title: string
  description: string
  date: string // ISO string
  time: string
  duration: number // in minutes
  location: string
  status: AppointmentStatus
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface BookingFormData {
  type: AppointmentType
  date: string
  time: string
  location: string
  notes?: string
}

export interface AppointmentSlot {
  date: string
  time: string
  available: boolean
}

export interface Location {
  id: string
  name: string
  address: string
  city: string
}
