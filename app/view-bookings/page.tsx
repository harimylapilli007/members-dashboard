"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, Tag } from 'lucide-react'
import Image from 'next/image'
import Header from "@/app/components/Header";
import { fetchUserBookings, cancelBooking, Booking } from '../utils/bookings-api';

const cityOutlets: Record<string, Array<{ name: string, id: string }>> = {
  "Hyderabad": [
    { name: "Jubilee Hills St", id: "349f181f-5c56-438e-b128-70887eda09be" },
    { name: "RGIA Airport", id: "ea5d4cc7-9466-4135-b66e-02280d2ceb96" },
    { name: "Hyderabad Grand", id: "5b99f92a-53dc-43d9-b0eb-8b29c778bb7d" },
    { name: "Dom Airport Level F", id: "dd2070c6-5935-40b2-b13f-8425fd6915be" },
    { name: "Taj Vivanta", id: "e7def4e3-4f13-4022-85bd-fcbaa89df193" },
    { name: "GVK Mall", id: "43e4e02f-6e8c-4f71-acce-b42ac7ef89ad" },
    { name: "Radisson", id: "db97db51-fa88-40c7-8d14-e0de4a18853c" },
    { name: "Svm Grand", id: "382c7ba3-5db8-4b1a-b61c-820590a8ccef" },
    { name: "Ramada Manohar", id: "fd0b1849-c640-472e-a3de-b56165358e2b" },
    { name: "Royalton", id: "02f4f819-6e1c-49c5-b831-c08fc651d4c8" },
    { name: "Novotel HICC", id: "6f040deb-7bc3-4728-890e-696ad17cdafb" }
  ],
  "Bangalore": [
    { name: "Banashankari St", id: "5bee05b9-b470-4498-a6ad-0accb771ffe0" },
    { name: "Radisson Atria", id: "883ec38d-bf5e-4be0-b1fd-d2d7eb87ed5b" },
    { name: "La Marvella", id: "b6d6e3f0-8621-4717-b79a-370d87f8da89" },
    { name: "Adarsh Nagar", id: "3adc38ff-63ee-4974-9c6e-654fa558c85d" },
    { name: "Royal Orchid", id: "297393d6-ee20-4ebb-b25c-d6066a0b4df3" },
    { name: "Dom Airport", id: "fb82a94d-121f-4007-a42f-003a478e5d03" }
  ],
  "Vadodara": [
    { name: "Genda Circle St", id: "5a3186b6-7bf9-41ca-8d75-6ab0bb4185c0" }
  ],
  "Chennai": [
    { name: "Express Mall", id: "8c745587-427d-473b-9237-c87a35fd9521" },
    { name: "Courtyard Marriott", id: "d722725c-dfad-495f-928a-1fc1edec2674" },
    { name: "Forum Mall", id: "2afb599f-c6e3-400a-b958-51b1342597fa" }
  ],
  "Mumbai": [
    { name: "Niranta Hotel", id: "83f0c9f1-f91b-4201-9c43-edfced132d8f" },
    { name: "Niranta 2", id: "49de6c35-f2f4-48e3-b404-5f10ed007089" },
    { name: "Niranta 3", id: "770491a4-a5d0-4e34-a73f-30a62aad1a15" },
    { name: "Lemon Tree", id: "86a0da45-4cd6-4235-afaf-9e4ab0c3f916" },
    { name: "Courtyard Marriott", id: "4a1c048a-ae0f-44e6-aa06-01b33ffc1e37" }
  ],
  "Cochin": [
    { name: "Dom Airport", id: "a56973f6-704b-46f8-8200-f3c44744507e" },
    { name: "Int Airport", id: "dc404033-9b05-4757-b63c-fd1755395a8f" },
    { name: "Int Airport Lounge", id: "a1352d6c-63df-4bda-8a00-bf3786084155" }
  ],
  "Lucknow": [
    { name: "Int Airport", id: "94ff3df4-25a8-4b53-a61c-69644313926f" },
    { name: "Dom Airport", id: "94078349-47bf-4a3c-8272-7b20008ea266" }
  ],
  "Goa": [
    { name: "Fortune Candolim", id: "d069efee-094e-4a30-ba19-9458effffdd4" }
  ],
  "Ahmedabad": [
    { name: "DoubleTree Hilton", id: "60f37c05-f44a-4dd3-aab7-490c32c61d6e" },
    { name: "Novotel", id: "28d6d1a3-a375-4b7d-87c6-137528e280af" }
  ],
  "Udaipur": [
    { name: "Lemon Tree-Udaipur", id: "1efbbc03-3cb9-4c15-9073-a13482504d29" }
  ],
  "Jaipur": [
    { name: "Airport", id: "b0f2a5c7-2029-4d05-b2eb-4e6929844e27" }
  ],
  "Rajahmundry": [
    { name: "Manjeera", id: "59bf0758-8cd4-47f1-8447-3d3b1dd1e40f" }
  ],
  "NewDelhi": [
    { name: "Lemon Tree Premier", id: "e31deb8a-3d80-4e45-867a-87422f8c691a" }
  ],
  "Kodaikanal": [
    { name: "KODAIKANAL CARLTON HOTEL", id: "b44ece7f-ee8f-493a-a705-7c8edb50751d" }
  ]
}

const getCityAndOutletFromCenterId = (centerId: string): { city: string, outlet: string } => {
  for (const [city, outlets] of Object.entries(cityOutlets)) {
    const outlet = outlets.find(outlet => outlet.id === centerId)
    if (outlet) {
      console.log('Found match:', { city, outlet: outlet.name })
      return { city, outlet: outlet.name }
    }
  }
  return { city: 'Unknown City', outlet: 'Unknown Outlet' }
}

export default function BookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      // Get userData from localStorage each time we fetch
      const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {}
      
      // Get guest ID from localStorage
      const dashboardParams = new URLSearchParams(localStorage.getItem('dashboardParams') || '')
      const guestId = dashboardParams.get('id') || localStorage.getItem('guestId') || userData?.id

      console.log('UserData:', userData) // Debug log
      console.log('Guest ID:', guestId) // Debug log

      if (!guestId) {
        throw new Error('Guest ID not found')
      }

      // Use the new API utility function
      const appointments = await fetchUserBookings(guestId)
      
      console.log('API Response:', appointments) // Debug log

      if (!Array.isArray(appointments)) {
        console.error('Appointments is not an array:', appointments)
        throw new Error('Appointments data is not in the expected format')
      }

      // Transform the data into our Booking interface
      const transformedBookings = appointments.map((appointment: any) => {
        if (!appointment || !appointment.appointment_services || !appointment.appointment_services[0]) {
          console.warn('Invalid appointment data:', appointment)
          return null
        }

        const service = appointment.appointment_services[0]?.service
        const centerId = appointment.center?.id || appointment.center_id
        const { city, outlet } = getCityAndOutletFromCenterId(centerId)
        
        // Map appointment status to our Booking status type
        const appointmentStatus = appointment.appointment_services[0]?.appointment_status
        let status: 'confirmed' | 'cancelled' | 'completed'
        if (appointmentStatus === 0) {
          status = 'confirmed'
        } else if (appointmentStatus === 1) {
          status = 'completed'
        } else {
          status = 'cancelled'
        }
        
        return {
          id: appointment.appointment_group_id,
          appointment_id: appointment.appointment_services[0]?.appointment_id,
          invoice_id: appointment.invoice_id,
          service_name: service?.name || 'Unknown Service',
          center_name: 'ODE SPA',
          city,
          outlet,
          date: format(new Date(appointment.appointment_services[0]?.start_time), 'MMMM d, yyyy'),
          time: format(new Date(appointment.appointment_services[0]?.start_time), 'h:mm a'),
          status,
          price: appointment.price?.final || 0,
          duration: service?.duration || 0,
          center_id: centerId
        }
      }).filter((booking): booking is Booking => booking !== null)

      if (transformedBookings.length === 0) {
        console.log('No valid bookings found in the response')
      }

      setBookings(transformedBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancelBooking = async (bookingId: string, appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setCancellingBookingId(bookingId)

    try {
      // Use the new cancel API utility function
      await cancelBooking(appointmentId, 'Cancelled by customer')

      // Refresh the bookings list
      await fetchBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setCancellingBookingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
        }}
      />
      {/* Subtle blurred circles */}
      <div className="fixed top-20 -left-60 w-[600px] h-[600px] bg-[#e2c799] opacity-60 rounded-full -z-10 blur-3xl" />
      <div className="fixed bottom-20 right-0 w-[800px] h-[800px] bg-[#b2d5e4] opacity-50 rounded-full -z-10 blur-3xl" />
      <div className="fixed top-1/3 left-1/2 w-[2000px] h-[2000px] bg-[#b2d5e4] opacity-40 rounded-full -z-10 blur-3xl" />

      {/* Main content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <Header />
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Bookings</h1>
              <h2 className="mt-1 text-sm sm:text-base text-gray-500">View and manage your spa appointments</h2>
            </div>
            <button
              onClick={() => router.push('/ServiceBookingPage?openModal=true')}
              className="w-full sm:w-auto px-4 py-2 font-marcellus bg-[#a07735] text-white rounded-md hover:bg-[#8a6930] transition-colors"
            >
              Book New Service
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#a07735] mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-500">Loading your bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-sm sm:text-base text-red-500 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#a07735] font-marcellus text-white rounded-md hover:bg-[#8a6930] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-sm  sm:text-base text-gray-500 mb-4">No bookings found</div>
              <button
                onClick={() => router.push('/ServiceBookingPage?openModal=true')}
                className="px-4 py-2 bg-[#a07735] text-white font-marcellus rounded-md hover:bg-[#8a6930] transition-colors"
              >
                Book Your First Service
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-1">{booking.service_name}</h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3 flex-grow">
                      <div className="flex items-center text-sm sm:text-base text-gray-600">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#a07735] mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{booking.date}</span>
                      </div>
                      <div className="flex items-center text-sm sm:text-base text-gray-600">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#a07735] mr-2 flex-shrink-0" />
                        <span>{booking.time} ({booking.duration} mins)</span>
                      </div>
                      <div className="flex items-center text-sm sm:text-base text-gray-600">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#a07735] mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{booking.city} - {booking.outlet}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-[#a07735] mr-2" />
                          <span className="text-sm sm:text-base font-semibold text-[#a07735]">₹{booking.price}</span>
                        </div>
                        {/* {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.appointment_id)}
                            disabled={cancellingBookingId === booking.id}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors ${
                              cancellingBookingId === booking.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 