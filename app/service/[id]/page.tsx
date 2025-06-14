"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Phone, StarIcon, Tag } from "lucide-react"
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
  const dateContainerRef = useRef<HTMLDivElement>(null)

  // Update useEffect to scroll to the start of the list
  useEffect(() => {
    if (dateContainerRef.current) {
      // Scroll to the start of the container
      dateContainerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    }
  }, [selectedDate])

  const handleSelectLocation = (city: string, outlet: string, centerId: string) => {
    setSelectedLocation({ 
      city: city,
      outlet: { 
        name: outlet, 
        id: centerId 
      } 
    })
    // Reset booking-related states when location changes
    setBookingId(null)
    setAvailableSlots([])
    setSelectedSlot(null)
    setSelectedDate(new Date())
  }

  const generateDates = () => {
    const dates = []
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    
    // If selected month is current month, start from today or selected date (whichever is later)
    // If selected month is future month, start from selected date or 1st of month (whichever is later)
    const startDay = Math.max(
      (selectedDate.getMonth() === today.getMonth() && 
       selectedDate.getFullYear() === today.getFullYear()) 
       ? today.getDate() 
       : 1,
      selectedDate.getDate()
    )
    
    // Add all days of the selected month starting from appropriate date
    for (let i = startDay; i <= daysInMonth; i++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i)
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
          // First fetch the service details for the selected location
          const serviceResponse = await fetchWithRetry(
            `https://api.zenoti.com/v1/centers/${selectedLocation.outlet.id}/services/${serviceId}`,
            {
              headers: {
                'Authorization': process.env.NEXT_PUBLIC_ZENOTI_API_KEY ?? '',
                'accept': 'application/json'
              }
            },
            generateCacheKey('service-details', { serviceId, centerId: selectedLocation.outlet.id })
          )

          // Update service details if they exist
          if (serviceResponse) {
            // Update the service details in the URL without refreshing the page
            const params = new URLSearchParams(window.location.search)
            params.set('price', serviceResponse.price?.toString() || servicePrice.toString())
            params.set('duration', serviceResponse.duration?.toString() || duration)
            params.set('description', serviceResponse.description || description)
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
          }

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
        
        // Check if error is related to max tries
        if (errorMessage.toLowerCase().includes('max tries') || errorMessage.toLowerCase().includes('too many attempts')) {
          toast({
            variant: "destructive",
            title: "Maximum Attempts Reached",
            description: "Please wait a few minutes before trying again.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please refresh the page or select another date to try again.",
          })
        }
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
        outletId: selectedLocation?.outlet.id || '',
        city: selectedLocation?.city || ''
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
        
        <main className="mx-auto max-w-[1300px] px-4 sm:px-6 md:px-6 py-4 sm:py-6 md:py-8 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Left: Image only on mobile, Image + Tabs on desktop */}
            <div className="flex flex-col order-1 lg:order-1">
              <div className="rounded-lg overflow-hidden mb-4 sm:mb-6 relative">
                <Image
                  src="/spa-swedish-massage.png"
                  alt="Swedish Massage"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[200px] sm:h-[300px] md:h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent"></div>
                {/* <h1 className="absolute bottom-4 left-4 text-xl sm:text-2xl md:text-3xl text-white font-medium">{serviceName}</h1> */}
              </div>
              {/* Tabs and Content below image - hidden on mobile */}
              <div className="hidden lg:block bg-[#faf5eb] backdrop-blur-sm rounded-lg shadow p-3 sm:p-4">
                <div className="border-b border-gray-300">
                  <div className="flex flex-wrap justify-around ">
                    <button
                      className={`
                        font-['Marcellus'] text-lg sm:text-[24px] leading-[32px] sm:leading-[48px] ${activeTab === "benefits" ? "text-[#a07735] border-b-2 border-[#a07735]" : "text-gray-700"}
                      `}
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
                    <div className="bg-white bg-opacity-50 rounded-lg p-6 text-center flex flex-col items-center transition-transform duration-300 hover:scale-105">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Sleep icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2 font-marcellus">Better Sleep</h3>
                      <p className="text-sm text-gray-700">Promotes quality sleep and helps establish better sleep patterns.</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-6 text-center flex flex-col items-center transition-transform duration-300 hover:scale-105">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Pain relief icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2 font-marcellus">Relieves Pain</h3>
                      <p className="text-sm text-gray-700">Soothes sore muscles, melts away knots, and eases bodily aches for lasting comfort.</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-6 text-center flex flex-col items-center transition-transform duration-300 hover:scale-105">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Blood circulation icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2 font-marcellus">Improves Blood Circulation</h3>
                      <p className="text-sm text-gray-700">Enhances oxygen flow and promotes healthier, more energized tissues.</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-6 text-center flex flex-col items-center transition-transform duration-300 hover:scale-105">
                      <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        {/* Energy flow icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2 font-marcellus">Balances Energy Flow</h3>
                      <p className="text-sm text-gray-700">Restores harmony to your body's energy pathways.</p>
                    </div>
                  </div>
                </div>
                {/* What to Expect content */}
                <div className={`py-4 sm:py-8 ${activeTab === "expect" ? "block" : "hidden"}`}>
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 font-inter">
                    <h3 className="text-xl font-medium mb-4 font-marcellus">Before Your Massage</h3>
                    <ul className="list-disc pl-5 mb-6 space-y-2">
                      <li className="text-sm text-gray-700 font-inter">Arrive 15 minutes before your appointment to complete paperwork</li>
                      <li className="text-sm text-gray-700 font-inter">Wear comfortable clothing that's easy to remove</li>
                      <li className="text-sm text-gray-700 font-inter">Avoid heavy meals or alcohol before your session</li>
                      <li className="text-sm text-gray-700 font-inter">Let your therapist know about any health concerns or preferences</li>
                    </ul>
                    <h3 className="text-xl font-medium mb-4 font-marcellus">During Your Massage</h3>
                    <ul className="list-disc pl-5 mb-6 space-y-2">
                      <li className="text-sm text-gray-700 font-inter">Your therapist will leave the room while you undress to your comfort level</li>
                      <li className="text-sm text-gray-700 font-inter">You'll lie on a padded massage table under a sheet</li>
                      <li className="text-sm text-gray-700 font-inter">Only the area being worked on will be exposed</li>
                      <li className="text-sm text-gray-700 font-inter">Your therapist will use a combination of kneading, long strokes, and circular movements</li>
                      <li className="text-sm text-gray-700 font-inter">Communication is encouraged - let your therapist know if pressure is too light or too firm</li>
                    </ul>
                    <h3 className="text-xl font-medium mb-4 font-marcellus">After Your Massage</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li className="text-sm text-gray-700 font-inter">Take your time getting up from the table</li>
                      <li className="text-sm text-gray-700 font-inter">Drink plenty of water to help flush metabolic waste from tissues</li>
                      <li className="text-sm text-gray-700 font-inter">Avoid strenuous activity for the rest of the day if possible</li>
                      <li className="text-sm text-gray-700 font-inter">Notice how your body feels in the hours and days following your massage</li>
                    </ul>
                  </div>
                </div>
                {/* Reviews content */}
                <div className={`py-4 sm:py-8 ${activeTab === "reviews" ? "block" : "hidden"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-[#a07735] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          <span className="font-medium font-marcellus">RP</span>
                        </div>
                        <div>
                          <h4 className="font-medium font-marcellus">Rahul P.</h4>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 font-inter">Great experience! The massage was very relaxing and the therapist was professional.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Service details, slot selection, add-to-cart */}
            <div className="flex flex-col justify-start space-y-6 order-2 lg:order-2">
                {/* Add this after the service details section and before the booking section */}

                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row sm:justify-between gap-2 mb-2">
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white/70 transition-colors w-fit sm:w-fit lg:order-2"
                  >
                    <MapPin className="h-4 w-4 text-[#a07735] flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate max-w-[200px] sm:max-w-fit">
                      {selectedLocation ? `${selectedLocation.city} - ${selectedLocation.outlet.name}` : 'Select Location'}
                    </span>
                  </button>

                  <h1 className="text-2xl sm:text-2xl md:text-lg lg:text-3xl font-['Marcellus'] md:order-2 lg:order-1">{serviceName}</h1>
                </div>
              <div className="flex flex-row items-center justify-between gap-2 mb-4">
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 text-[#a07735] mr-2" />
                  <span>{duration} mins</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Tag className="h-5 w-5 text-[#a07735] mr-2" />
                  <span className="font-regular">₹{servicePrice}</span>
                </div>
                <div className="flex items-center text-gray-700 lg:w-1/2">
                </div>
              </div>
              <p className="text-gray-700 mb-2 sm:mb-3 text-base font-inter">
                {description}
              </p>
            
              {/* Booking section */}
              <div className="mt-2 md:hidden lg:block">
                <div className="flex flex-row items-center justify-between gap-2 mb-4">
                  <h2 className="text-xl text-[#a07735] font-medium font-['Marcellus']">Select Slot</h2>
                  <div className="flex items-center space-x-4 relative">
                    <button 
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
                    <h3 className="text-xl font-medium font-['Marcellus']">{format(selectedDate, 'MMMM yyyy')}</h3>
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
                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-80 z-50">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium font-['Marcellus'] text-gray-900">Select Date</h3>
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
                          
                          {/* Month and Year Navigation */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => setSelectedDate(addDays(selectedDate, -30))}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <span className="text-lg font-medium font-['Marcellus']">
                              {format(selectedDate, 'MMMM yyyy')}
                            </span>
                            <button
                              onClick={() => setSelectedDate(addDays(selectedDate, 30))}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Weekday Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                              const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                              const startingDay = firstDayOfMonth.getDay();
                              const daysInMonth = lastDayOfMonth.getDate();
                              
                              const days = [];
                              // Add empty cells for days before the first day of the month
                              for (let i = 0; i < startingDay; i++) {
                                days.push(<div key={`empty-${i}`} className="h-8" />);
                              }
                              
                              // Add cells for each day of the month
                              for (let day = 1; day <= daysInMonth; day++) {
                                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                const isToday = isSameDay(date, new Date());
                                const isSelected = isSameDay(date, selectedDate);
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                
                                days.push(
                                  <button
                                    key={day}
                                    onClick={() => {
                                      if (!isPast) {
                                        handleDateSelect(date);
                                        // Force a re-render of the date list
                                        setSelectedDate(new Date(date));
                                      }
                                    }}
                                    className={`
                                      h-8 w-8 rounded-full flex items-center justify-center text-sm
                                      ${isSelected ? 'bg-[#a07735] text-white' : ''}
                                      ${isToday && !isSelected ? 'border-2 border-[#a07735] text-[#a07735]' : ''}
                                      ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                                      transition-colors
                                    `}
                                    disabled={isPast}
                                  >
                                    {day}
                                  </button>
                                );
                              }
                              
                              return days;
                            })()}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Selected:</span>
                              <span className="text-sm font-medium text-[#a07735]">
                                {format(selectedDate, 'MMMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Date selection */}
                <div 
                  ref={dateContainerRef}
                  className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {generateDates().map((date, index) => (
                    <div
                      key={index}
                      data-selected={isSameDay(date.date, selectedDate)}
                      className={`flex flex-col items-center justify-center px-2 sm:px-3 py-2 rounded-full cursor-pointer min-w-[45px] sm:min-w-[50px]
                      ${date.selected ? "bg-[#a07735] text-white" : "bg-white/30 backdrop-blur-md shadow-md transition duration-200 outline-none hover:bg-white/60 hover:shadow-lg hover:border-[#a07735]"}
                      ${date.date < new Date(new Date().setHours(0, 0, 0, 0)) ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (date.date >= new Date(new Date().setHours(0, 0, 0, 0))) {
                          handleDateSelect(date.date)
                        }
                      }}
                    >
                      <span className={`text-sm sm:text-base font-medium ${date.selected ? "text-white" : "text-gray-700"}`}>{date.day}</span>
                      <span className={`text-xs ${date.selected ? "text-white" : "text-gray-700"}`}>{date.weekday}</span>
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
                              className={`
                                rounded-lg 
                                py-2 
                                text-center 
                                bg-white/30 
                                backdrop-blur-md 
                                shadow-md 
                                font-['Marcellus']
                                transition 
                                duration-200 
                                outline-none
                                hover:bg-white/60 
                                hover:shadow-lg
                                hover:border-[#a07735]
                               
                                ${time === selectedSlot
                                  ? "bg-[#a07735] border-[#a07735] shadow-lg"
                                  : "text-gray-700"
                                }
                              `}
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
                                  outletId: selectedLocation?.outlet.id || '',
                                  city: selectedLocation?.city || ''
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


          <div className="mt-2 hidden md:block lg:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2 className="text-xl text-[#a07735] font-medium font-['Marcellus']">Select Slot</h2>
                  <div className="flex items-center space-x-4 relative">
                    <button 
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
                    <h3 className="text-xl font-medium font-['Marcellus']">{format(selectedDate, 'MMMM yyyy')}</h3>
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
                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-80 z-50">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium font-['Marcellus'] text-gray-900">Select Date</h3>
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
                          
                          {/* Month and Year Navigation */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => setSelectedDate(addDays(selectedDate, -30))}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <span className="text-lg font-medium font-['Marcellus']">
                              {format(selectedDate, 'MMMM yyyy')}
                            </span>
                            <button
                              onClick={() => setSelectedDate(addDays(selectedDate, 30))}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Weekday Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                              const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                              const startingDay = firstDayOfMonth.getDay();
                              const daysInMonth = lastDayOfMonth.getDate();
                              
                              const days = [];
                              // Add empty cells for days before the first day of the month
                              for (let i = 0; i < startingDay; i++) {
                                days.push(<div key={`empty-${i}`} className="h-8" />);
                              }
                              
                              // Add cells for each day of the month
                              for (let day = 1; day <= daysInMonth; day++) {
                                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                const isToday = isSameDay(date, new Date());
                                const isSelected = isSameDay(date, selectedDate);
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                
                                days.push(
                                  <button
                                    key={day}
                                    onClick={() => {
                                      if (!isPast) {
                                        handleDateSelect(date);
                                        // Force a re-render of the date list
                                        setSelectedDate(new Date(date));
                                      }
                                    }}
                                    className={`
                                      h-8 w-8 rounded-full flex items-center justify-center text-sm
                                      ${isSelected ? 'bg-[#a07735] text-white' : ''}
                                      ${isToday && !isSelected ? 'border-2 border-[#a07735] text-[#a07735]' : ''}
                                      ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                                      transition-colors
                                    `}
                                    disabled={isPast}
                                  >
                                    {day}
                                  </button>
                                );
                              }
                              
                              return days;
                            })()}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Selected:</span>
                              <span className="text-sm font-medium text-[#a07735]">
                                {format(selectedDate, 'MMMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Date selection */}
                <div 
                  ref={dateContainerRef}
                  className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {generateDates().map((date, index) => (
                    <div
                      key={index}
                      data-selected={isSameDay(date.date, selectedDate)}
                      className={`flex flex-col items-center justify-center px-2 sm:px-3 py-2 rounded-full cursor-pointer min-w-[45px] sm:min-w-[50px]
                      ${date.selected ? "bg-[#a07735] text-white" : "bg-white/30 backdrop-blur-md shadow-md transition duration-200 outline-none hover:bg-white/60 hover:shadow-lg hover:border-[#a07735]"}
                      ${date.date < new Date(new Date().setHours(0, 0, 0, 0)) ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (date.date >= new Date(new Date().setHours(0, 0, 0, 0))) {
                          handleDateSelect(date.date)
                        }
                      }}
                    >
                      <span className={`text-sm sm:text-base font-medium ${date.selected ? "text-white" : "text-gray-700"}`}>{date.day}</span>
                      <span className={`text-xs ${date.selected ? "text-white" : "text-gray-700"}`}>{date.weekday}</span>
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
                              className={`
                                border-2 
                                rounded-lg 
                                py-2 
                                text-center 
                                bg-white/30 
                                backdrop-blur-md 
                                shadow-md 
                                font-['Marcellus']
                                transition 
                                duration-200 
                                outline-none
                                hover:bg-white/60 
                                hover:shadow-lg
                                hover:border-[#a07735]
                               
                                ${time === selectedSlot
                                  ? "bg-[#a07735] border-[#a07735] shadow-lg"
                                  : "text-gray-700"
                                }
                              `}
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
                                  outletId: selectedLocation?.outlet.id || '',
                                  city: selectedLocation?.city || ''
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

          

       

              <div className="lg:hidden mt-8 bg-[#faf5eb] backdrop-blur-sm rounded-lg shadow p-3 sm:p-4">
            <div className="border-b border-gray-300">
              <div className="flex flex-wrap  justify-between gap-4 sm:gap-8">
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
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center flex flex-col items-center">
                  <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 font-marcellus">Better Sleep</h3>
                  <p className="text-base text-gray-700 font-inter">Promotes quality sleep and helps establish better sleep patterns.</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center flex flex-col items-center">
                  <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 font-marcellus">Relieves Pain</h3>
                  <p className="text-base text-gray-700 font-inter">Soothes sore muscles, melts away knots, and eases bodily aches for lasting comfort.</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center flex flex-col items-center">
                  <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 font-marcellus">Improves Blood Circulation</h3>
                  <p className="text-base text-gray-700">Enhances oxygen flow and promotes healthier, more energized tissues.</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center flex flex-col items-center">
                  <div className="bg-[#d6c7b2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#a07735]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 font-marcellus">Balances Energy Flow</h3>
                  <p className="text-base text-gray-700">Restores harmony to your body's energy pathways.</p>
                </div>
              </div>
            </div>
            {/* What to Expect content */}
            <div className={`py-4 sm:py-8 ${activeTab === "expect" ? "block" : "hidden"}`}>
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-medium mb-4 font-marcellus">Before Your Massage</h3>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  <li className="text-base text-gray-700 font-inter">Arrive 15 minutes before your appointment to complete paperwork</li>
                  <li className="text-base text-gray-700 font-inter">Wear comfortable clothing that's easy to remove</li>
                  <li className="text-base text-gray-700 font-inter">Avoid heavy meals or alcohol before your session</li>
                  <li className="text-base text-gray-700 font-inter">Let your therapist know about any health concerns or preferences</li>
                </ul>
                <h3 className="text-xl font-medium mb-4 font-marcellus">During Your Massage</h3>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  <li className="text-base text-gray-700 font-inter">Your therapist will leave the room while you undress to your comfort level</li>
                  <li className="text-base text-gray-700 font-inter">You'll lie on a padded massage table under a sheet</li>
                  <li className="text-base text-gray-700 font-inter">Only the area being worked on will be exposed</li>
                  <li className="text-base text-gray-700 font-inter">Your therapist will use a combination of kneading, long strokes, and circular movements</li>
                  <li className="text-base text-gray-700 font-inter">Communication is encouraged - let your therapist know if pressure is too light or too firm</li>
                </ul>
                <h3 className="text-xl font-medium mb-4 font-marcellus">After Your Massage</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="text-base text-gray-700 font-inter">Take your time getting up from the table</li>
                  <li className="text-base text-gray-700 font-inter">Drink plenty of water to help flush metabolic waste from tissues</li>
                  <li className="text-base text-gray-700 font-inter">Avoid strenuous activity for the rest of the day if possible</li>
                  <li className="text-base text-gray-700 font-inter">Notice how your body feels in the hours and days following your massage</li>
                </ul>
              </div>
            </div>
            {/* Reviews content */}
            <div className={`py-4 sm:py-8 ${activeTab === "reviews" ? "block" : "hidden"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#a07735] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <span className="font-medium font-marcellus">RP</span>
                    </div>
                    <div>
                      <h4 className="font-medium font-marcellus">Rahul P.</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-base text-gray-700 font-inter">Great experience! The massage was very relaxing and the therapist was professional.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isLocationModalOpen && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </div>
  )
}