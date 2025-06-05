"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Phone, Tag } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import LocationModal from "@/components/location-modal"
import "@/styles/globals.css"
import { format, addDays, isSameDay } from "date-fns"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from '@/lib/auth-context'
import Header from "@/app/components/Header"
import { fetchWithRetry, generateCacheKey } from '../../utils/api'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"


export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { logout, user } = useAuth()
  const { toast } = useToast()
  const serviceName = searchParams.get('name') || 'Swedish Massage'
  const servicePrice = parseInt(searchParams.get('price') || '3999', 10)
  const locationName = searchParams.get('location') || ''
  const outletId = searchParams.get('outletId') || ''
  const duration = searchParams.get('duration') || '30'
  const description = searchParams.get('description') || ''
  const serviceId = searchParams.get('id') || ''
  
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("benefits")
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; outlet: { name: string, id: string } } | null>(
    locationName ? { 
      city: searchParams.get('city') || '',
      outlet: { 
        name: locationName, 
        id: outletId 
      } 
    } : null
  )
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<Array<{
    date: string;
    times: string[];
  }>>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const isMounted = useRef(false)
  const requestInProgress = useRef(false)
  const lastRequestTime = useRef(0)
  const [guestId, setGuestId] = useState<string | null>(null)

  const handleSelectLocation = (city: string, outlet: string, centerId: string) => {
    setSelectedLocation({ 
      city: city,
      outlet: { 
        name: outlet, 
        id: centerId 
      } 
    })
  }

  const generateDates = () => {
    const dates = []
    for (let i = 0; i < 10; i++) {
      const date = addDays(new Date(), i)
      dates.push({
        day: date.getDate(),
        weekday: format(date, 'EEE'),
        date: date,
        selected: isSameDay(date, selectedDate)
      })
    }
    return dates
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowDatePicker(false)
    setBookingId(null)
    setAvailableSlots([])
    setSelectedSlot(null)
  }

  const convertToDateSlots = (inputData: any) => {
    if (!inputData.slots || inputData.slots.length === 0) {
      return { slots: [] };
    }

    // Group time slots by date
    const dateSlots: { [key: string]: string[] } = {};

    inputData.slots.forEach((slot: { Time: string }) => {
      const dateTime = new Date(slot.Time);
      const date = dateTime.toISOString().split('T')[0]; // Extract the date (e.g., "2025-03-20")
      
      // Round the minutes to the nearest 15-minute interval
      const minutes = dateTime.getMinutes();
      const roundedMinutes = Math.floor(minutes / 15) * 15;
      dateTime.setMinutes(roundedMinutes);

      // Format time in 12-hour format with AM/PM
      const hours = dateTime.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert to 12-hour format
      const formattedMinutes = roundedMinutes.toString().padStart(2, '0');
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

      // Initialize the date slot array if it doesn't exist
      if (!dateSlots[date]) {
        dateSlots[date] = [];
      }

      // Add the formatted time to the corresponding date slot, ensuring unique times only
      if (!dateSlots[date].includes(formattedTime)) {
        dateSlots[date].push(formattedTime);
      }
    });

    // Convert the dateSlots object into the desired format
    const result = {
      slots: Object.keys(dateSlots).map(date => ({
        date: date,
        times: dateSlots[date].sort((a, b) => {
          // Sort times properly considering AM/PM
          const timeA = new Date(`2000-01-01 ${a}`);
          const timeB = new Date(`2000-01-01 ${b}`);
          return timeA.getTime() - timeB.getTime();
        })
      }))
    };

    return result;
  };

  // Helper function to add delay between API calls
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true

    const fetchData = async () => {
      // Prevent duplicate requests within 1 second
      const now = Date.now()
      if (now - lastRequestTime.current < 1000 || requestInProgress.current) {
        return
      }

      if (selectedLocation?.outlet.id) {
        requestInProgress.current = true
        lastRequestTime.current = now
        
        try {
          await createBooking()
        } finally {
          requestInProgress.current = false
        }
      }
    }

    fetchData()

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [selectedLocation?.outlet.id, format(selectedDate, 'yyyy-MM-dd')])

  useEffect(() => {
    const dashboardParams = new URLSearchParams(localStorage.getItem('dashboardParams') || '')
    const guestId = dashboardParams.get('id')  || localStorage.getItem('guestId')
    setGuestId(guestId)
  }, [])

  const createBooking = async () => {
    if (!selectedLocation?.outlet.id || !isMounted.current) {
      return
    }

    if (!serviceId) {
      setError('Service ID is missing')
      return
    }

    // Get guest ID from localStorage
    const dashboardParams = new URLSearchParams(localStorage.getItem('dashboardParams') || '')
    const guestId = dashboardParams.get('id')  || localStorage.getItem('guestId')

    setIsLoading(true)
    setError(null)

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      console.log('Creating booking with date:', formattedDate)
      console.log('Selected location:', selectedLocation)
      console.log('Service ID:', serviceId)

      const payload = {
        is_only_catalog_employees: true,
        center_id: selectedLocation.outlet.id,
        date: formattedDate,
        guests: [{
          id: guestId,
          items: [{
            item: {
              id: serviceId
            }
          }]
        }]
      }

      console.log('Booking payload:', payload)

      const result = await fetchWithRetry(
        'https://api.zenoti.com/v1/bookings?is_double_booking_enabled=true',
        {
          method: 'POST',
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_ZENOTI_API_KEY ?? '',
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify(payload)
        },
        generateCacheKey('create-booking', { serviceId, date: formattedDate, centerId: selectedLocation.outlet.id })
      )

      console.log('Booking created:', result)
      
      if (isMounted.current) {
        setBookingId(result.id)
        await fetchAvailableSlots(result.id)
      }
    } catch (error) {
      console.error('Booking error:', error)
      if (isMounted.current) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create booking'
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please refresh the page or select another date to try again.",
        })
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  const fetchAvailableSlots = async (bookingId: string) => {
    if (!isMounted.current) return;

    try {
      const result = await fetchWithRetry(
        `https://api.zenoti.com/v1/bookings/${bookingId}/slots?check_future_day_availability=false`,
        {
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_ZENOTI_API_KEY ?? '',
            'accept': 'application/json'
          }
        },
        generateCacheKey('available-slots', { bookingId })
      );

      console.log('Original slots:', result);
      const convertedSlots = convertToDateSlots(result);
      console.log('Converted slots:', convertedSlots);
      
      if (isMounted.current) {
        setAvailableSlots(convertedSlots.slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      if (isMounted.current) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch available slots';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please refresh the page or select another date to try again.",
        });
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedLocation?.outlet.id) {
      setError('Please select a location first');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    // Check if user is logged in
    const authToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
    if (!authToken) {
      // Store the current URL to redirect back after login
      const currentUrl = window.location.href;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      router.push('/spa-signin');
      return;
    }

    setIsReserving(true);
    setReservationError(null);

    try {
      // First reserve the slot
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      // Convert 12-hour format to 24-hour format without AM/PM
      const timeWithoutAmPm = selectedSlot.replace(' AM', '').replace(' PM', '');
      const [hours, minutes] = timeWithoutAmPm.split(':');
      const isPM = selectedSlot.includes('PM');
      const hour24 = isPM ? (parseInt(hours) === 12 ? 12 : parseInt(hours) + 12) : (parseInt(hours) === 12 ? 0 : parseInt(hours));
      const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;
      const slotTime = `${formattedDate}T${formattedTime}`;
      
      await fetchWithRetry(
        `https://api.zenoti.com/v1/bookings/${bookingId}/slots/reserve`,
        {
          method: 'POST',
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_ZENOTI_API_KEY ?? '',
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            slot_time: slotTime,
            create_invoice: false
          })
        },
        generateCacheKey('reserve-slot', { bookingId, slotTime })
      );

      // Navigate to checkout page with all required parameters
      const params = new URLSearchParams({
        serviceName: serviceName,
        duration: duration,
        price: servicePrice.toString(),
        location: selectedLocation?.outlet.name || '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedSlot,
        serviceId: serviceId,
        outletId: selectedLocation?.outlet.id || ''
      });
      
      router.push(`/checkout?${params.toString()}`);
    } catch (error) {
      console.error('Reservation error:', error);
      setReservationError(error instanceof Error ? error.message : 'Failed to reserve slot');
    } finally {
      setIsReserving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/spa-signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingId) {
      setReservationError('Booking ID is missing');
      return;
    }

    setIsConfirming(true);
    setReservationError(null);

    try {
      await fetchWithRetry(
        `https://api.zenoti.com/v1/bookings/${bookingId}/slots/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_ZENOTI_API_KEY ?? '',
            'accept': 'application/json',
            'content-type': 'application/json'
          }
        },
        generateCacheKey('confirm-booking', { bookingId })
      );

      setIsBookingConfirmed(true);
    } catch (error) {
      console.error('Booking confirmation error:', error);
      setReservationError(error instanceof Error ? error.message : 'Failed to confirm booking');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-30"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          minHeight: "100vh",
          width: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-40"
        style={{
          background: "linear-gradient(120deg, rgba(245, 241, 232, 0.85) 0%, rgba(229, 231, 235, 0.85) 60%, rgba(178, 213, 228, 0.85) 100%)"
        }}
      />
      {/* <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 rounded-full -z-30" /> */}

      <div className={`min-h-screen relative overflow-hidden ${isLocationModalOpen ? "blur-sm" : ""}`}>
        <Header />
        
        <main className="mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Left: Image + Tabs/Content */}
            <div className="flex flex-col">
              <div className="rounded-lg overflow-hidden mb-4 sm:mb-6 relative">
                <Image
                  src="/spa-swedish-massage.png"
                  alt="Swedish Massage"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[200px] sm:h-[300px] md:h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent"></div>
                <h1 className="absolute bottom-4 left-4 text-xl sm:text-2xl md:text-3xl text-white font-medium">{serviceName}</h1>
              </div>
              {/* Tabs and Content below image */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-3 sm:p-4">
                <div className="border-b border-gray-300">
                  <div className="flex flex-wrap gap-4 sm:gap-8">
                    <button
                      className={`font-['Marcellus'] text-lg sm:text-[24px] leading-[32px] sm:leading-[48px] ${activeTab === "benefits" ? "text-[#a07735] border-b-2 border-[#a07735]" : "text-gray-700"}`}
                      onClick={() => setActiveTab("benefits")}
                    >
                      Benefits
                    </button>
                    <button
                      className={`font-['Marcellus'] text-lg sm:text-[24px] leading-[32px] sm:leading-[48px] ${activeTab === "expect" ? "text-[#a07735] border-b-2 border-[#a07735]" : "text-gray-700"}`}
                      onClick={() => setActiveTab("expect")}
                    >
                      What to Expect
                    </button>
                    <button
                      className={`font-['Marcellus'] text-lg sm:text-[24px] leading-[32px] sm:leading-[48px] ${activeTab === "reviews" ? "text-[#a07735] border-b-2 border-[#a07735]" : "text-gray-700"}`}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Reviews
                    </button>
                  </div>
                </div>
                {/* Tab Content */}
                <div className={`py-4 sm:py-8 ${activeTab === "benefits" ? "block" : "hidden"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#ede5db] rounded-lg p-6 text-center flex flex-col items-center">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Sleep icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Better Sleep</h3>
                      <p className="text-sm text-gray-700">Promotes quality sleep and helps establish better sleep patterns.</p>
                    </div>
                    <div className="bg-[#ede5db] rounded-lg p-6 text-center flex flex-col items-center">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Pain relief icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Relieves Pain</h3>
                      <p className="text-sm text-gray-700">Soothes sore muscles, melts away knots, and eases bodily aches for lasting comfort.</p>
                    </div>
                    <div className="bg-[#ede5db] rounded-lg p-6 text-center flex flex-col items-center">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Blood circulation icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Improves Blood Circulation</h3>
                      <p className="text-sm text-gray-700">Enhances oxygen flow and promotes healthier, more energized tissues.</p>
                    </div>
                    <div className="bg-[#ede5db] rounded-lg p-6 text-center flex flex-col items-center">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Energy flow icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Balances Energy Flow</h3>
                      <p className="text-sm text-gray-700">Restores harmony to your body's energy pathways.</p>
                    </div>
                  </div>
                </div>
                {/* What to Expect content */}
                <div className={`py-4 sm:py-8 ${activeTab === "expect" ? "block" : "hidden"}`}>
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-xl font-medium mb-4">Before Your Massage</h3>
                    <ul className="list-disc pl-5 mb-6 space-y-2">
                      <li>Arrive 15 minutes before your appointment to complete paperwork</li>
                      <li>Wear comfortable clothing that's easy to remove</li>
                      <li>Avoid heavy meals or alcohol before your session</li>
                      <li>Let your therapist know about any health concerns or preferences</li>
                    </ul>
                    <h3 className="text-xl font-medium mb-4">During Your Massage</h3>
                    <ul className="list-disc pl-5 mb-6 space-y-2">
                      <li>Your therapist will leave the room while you undress to your comfort level</li>
                      <li>You'll lie on a padded massage table under a sheet</li>
                      <li>Only the area being worked on will be exposed</li>
                      <li>Your therapist will use a combination of kneading, long strokes, and circular movements</li>
                      <li>Communication is encouraged - let your therapist know if pressure is too light or too firm</li>
                    </ul>
                    <h3 className="text-xl font-medium mb-4">After Your Massage</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Take your time getting up from the table</li>
                      <li>Drink plenty of water to help flush metabolic waste from tissues</li>
                      <li>Avoid strenuous activity for the rest of the day if possible</li>
                      <li>Notice how your body feels in the hours and days following your massage</li>
                    </ul>
                  </div>
                </div>
                {/* Reviews content */}
                <div className={`py-4 sm:py-8 ${activeTab === "reviews" ? "block" : "hidden"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-[#a07735] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          <span className="font-medium">RP</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Rahul P.</h4>
                          <div className="flex text-yellow-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        <div className="bg-[#a07735] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          <span className="font-medium">SM</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Sneha M.</h4>
                          <div className="flex text-yellow-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Service details, slot selection, add-to-cart */}
            <div className="flex flex-col justify-start space-y-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl mb-1">{serviceName}</h1>
             
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 text-[#a07735] mr-2" />
                  <span>{duration} mins</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Tag className="h-5 w-5 text-[#a07735] mr-2" />
                  <span className="font-semibold">₹{servicePrice}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">
                {description}
              </p>
              {/* Booking section */}
              <div className="mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h2 className="text-xl text-[#a07735] font-medium">Select Slot</h2>
                  <div className="flex items-center space-x-4 relative">
                    <button 
                      className="text-gray-400"
                      onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-medium">{format(selectedDate, 'MMMM yyyy')}</h3>
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-[#a07735]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      {/* Date picker modal */}
                      {showDatePicker && (
                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-64 z-50">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Select Date</h3>
                            <button
                              onClick={() => setShowDatePicker(false)}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                          <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a07735] focus:border-[#a07735] outline-none transition-colors"
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => handleDateSelect(new Date(e.target.value))}
                            min={format(new Date(), 'yyyy-MM-dd')}
                          />
                          <div className="mt-4 text-sm text-gray-500">
                            <p>Selected: {format(selectedDate, 'MMMM d, yyyy')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Date selection */}
                <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
                  {generateDates().map((date, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-full cursor-pointer min-w-[50px] sm:min-w-[60px]
                      ${date.selected ? "bg-[#a07735] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      onClick={() => handleDateSelect(date.date)}
                    >
                      <span className="text-base sm:text-lg font-medium">{date.day}</span>
                      <span className="text-xs">{date.weekday}</span>
                    </div>
                  ))}
                </div>
                {/* Time selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {isLoading ? (
                    <div className="col-span-full text-center py-4">Loading available slots...</div>
                  ) : error ? (
                    <div className="col-span-full text-center py-4 text-red-500">{error}</div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map((slotGroup, index) => (
                      <div key={index} className="col-span-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {slotGroup.times.map((time, timeIndex) => (
                            <button
                              key={timeIndex}
                              className={`border rounded-md py-2 text-center
                              ${
                                time === selectedSlot
                                  ? "bg-[#a07735] text-white border-[#a07735]"
                                  : time === "⬅️ Back to date"
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "border-gray-300 text-gray-700 hover:border-[#a07735]"
                              }`}
                              onClick={() => {
                                setSelectedSlot(time);
                                // Directly redirect to cart page when slot is selected
                                const params = new URLSearchParams({
                                  serviceName: serviceName,
                                  duration: duration,
                                  price: servicePrice.toString(),
                                  location: selectedLocation?.outlet.name || '',
                                  date: format(selectedDate, 'yyyy-MM-dd'),
                                  time: time,
                                  serviceId: serviceId,
                                  outletId: selectedLocation?.outlet.id || ''
                                });
                                router.push(`/checkout?${params.toString()}`);
                              }}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4">No slots available for selected date</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            {!isBookingConfirmed ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Confirmation</h2>
                <div className="space-y-3">
                  <p className="font-inter"><span className="font-medium">City:</span> {selectedLocation?.city}</p>
                  <p className="font-inter"><span className="font-medium">Outlet:</span> {selectedLocation?.outlet.name}</p>
                  <p className="font-inter"><span className="font-medium">Date & Time:</span> {format(selectedDate, 'MMMM d, yyyy')} ⏰ {selectedSlot}</p>
                  <p className="font-inter"><span className="font-medium">Service:</span> {serviceName}</p>
                </div>
                {reservationError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {reservationError}
                  </div>
                )}
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setShowConfirmation(false)
                      setReservationError(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-[#a07735] text-white rounded-md hover:bg-[#8a6930] disabled:opacity-50"
                    onClick={handleConfirmBooking}
                    disabled={isConfirming}
                  >
                    {isConfirming ? 'Confirming...' : 'Continue'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your appointment has been confirmed. You can view your booking details in your account.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setShowConfirmation(false)
                      setIsBookingConfirmed(false)
                      router.push('/')
                    }}
                  >
                    Back to Home
                  </button>
                  <button
                    className="px-4 py-2 bg-[#a07735] text-white rounded-md hover:bg-[#8a6930]"
                    onClick={() => {
                      setShowConfirmation(false)
                      setIsBookingConfirmed(false)
                      router.push('/bookings')
                    }}
                  >
                    View Bookings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Modal - outside the blurred container */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
      />
      <Toaster />
    </div>
  )
}