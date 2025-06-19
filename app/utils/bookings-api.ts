// Client-side API utilities for bookings

export interface Booking {
  id: string
  service_name: string
  center_name: string
  city: string
  outlet: string
  date: string
  time: string
  status: 'confirmed' | 'cancelled' | 'completed'
  price: number
  duration: number
  appointment_id: string
  invoice_id: string
  center_id: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

// Fetch user bookings
export async function fetchUserBookings(guestId: string): Promise<Booking[]> {
  try {
    const response = await fetch(`/api/bookings/user?guestId=${guestId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch bookings')
    }
    
    return data.appointments || []
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    throw error
  }
}

// Cancel a booking
export async function cancelBooking(appointmentId: string, reason: string = 'Cancelled by customer'): Promise<boolean> {
  try {
    const response = await fetch('/api/bookings/cancel', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        reason
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to cancel booking')
    }
    
    return true
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
}

// Create a new booking
export async function createBooking(bookingData: {
  centerId: string
  serviceId: string
  date: string
  time: string
  guestId: string
}): Promise<{ bookingId: string }> {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create booking')
    }
    
    return { bookingId: data.bookingId }
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
} 