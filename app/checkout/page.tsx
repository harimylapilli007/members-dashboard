"use client"

import Image from "next/image"
import Link from "next/link"
import { Tag, Ticket, Zap } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "../components/Header"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

interface ServiceData {
  name: string
  duration: number
  price: number
  location: string
  city: string
}

interface SlotData {
  date: string
  time: string
  formattedDate: string
}

export default function CheckoutPage() {
  const [bookingType, setBookingType] = useState("self")
  const [serviceData, setServiceData] = useState<ServiceData | null>(null)
  const [slotData, setSlotData] = useState<SlotData | null>(null)
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {}
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  useEffect(() => {
    // Get service data from URL params
    const serviceName = searchParams.get('serviceName')
    const duration = searchParams.get('duration')
    const price = searchParams.get('price')
    const location = searchParams.get('location')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const city = searchParams.get('city')


    if (serviceName && duration && price && location && date && time) {
      setServiceData({
        name: serviceName,
        duration: parseInt(duration),
        price: parseInt(price),
        location: location,
        city: city || '',
      })

      // Format the date
      const dateObj = new Date(date)
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })

      setSlotData({
        date: date,
        time: time,
        formattedDate: formattedDate
      })

      // Add dataLayer push for checkout page
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'service_checkout_page',
          service_id: searchParams.get('serviceId') || '',
          service_name: serviceName,
          service_price: parseInt(price),
          booking_date: date,
          booking_time: time,
          location: `${city} - ${location}`,
          outlet: location
        });
      }
    }
  }, [searchParams])

  if (!serviceData || !slotData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-[#1f2937]">No booking data found</h2>
            <Link href="/" className="text-[#a07735] hover:underline mt-4 inline-block">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Calculate convenience fee and GST
  const gstAmount = Math.round(serviceData.price * 0.18)
  const totalAmount = serviceData.price + gstAmount - discountAmount

  // Add handleConfirmBooking function
  const handleConfirmBooking = async () => {
    // Step 1: Authentication Check
    const authToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
    if (!authToken) {
      const currentUrl = window.location.href;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      router.push('/spa-signin');
      return;
    }

    // Step 2: Validate required data
    if (!slotData?.date || !slotData?.time) {
      toast({
        title: "Missing booking data",
        description: "Please ensure you have selected a date and time for your booking.",
        variant: "destructive",
      });
      return;
    }

    const centerId = searchParams.get('outletId');
    const serviceId = searchParams.get('serviceId');

    if (!centerId || !serviceId) {
      toast({
        title: "Missing service information",
        description: "Please ensure you have selected a valid service.",
        variant: "destructive",
      });
      return;
    }

    // Step 3: Start Booking Process
    setIsConfirming(true);
    try {
      // Step 4: Get Guest Information
      const guestId = userData?.id || localStorage.getItem('guestId') 

      if (!guestId) {
        throw new Error('Guest ID is missing')
      }

      // Debug logging
      console.log('Sending booking data:', {
        centerId,
        serviceId,
        date: slotData.date,
        time: slotData.time,
        guestId
      });

      // Step 5: Call our API endpoint
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centerId: centerId,
          serviceId: serviceId,
          date: slotData.date,
          time: slotData.time,
          guestId: guestId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      // Add dataLayer push for successful booking completion with actual booking ID
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'service_booking_complete',
          service_id: serviceId,
          service_name: serviceData?.name || '',
          service_price: serviceData?.price || 0,
          booking_date: slotData.date,
          booking_time: slotData.time,
          location: `${serviceData?.city} - ${serviceData?.location}`,
          outlet: serviceData?.location || '',
          transaction_id: data.id || data.bookingId || `booking_${Date.now()}` // Use actual booking ID from response
        });
      }

      // Step 6: Handle Successful Booking
      setIsBookingConfirmed(true);
      toast({
        title: "Booking Successful!",
        description: "Your appointment has been confirmed. You can view your booking details in your account.",
        variant: "default",
      })
      // Redirect to bookings page
      router.push('/view-bookings');
    } catch (error) {
      // Step 7: Error Handling
      console.error('Booking confirmation error:', error);
      toast({
        title: "Failed to confirm booking.",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      // Step 8: Cleanup
      setIsConfirming(false);
    }
  };

  const handleApplyCoupon = async () => {
    setIsApplyingCoupon(true);
    try {
      // Implement coupon validation logic here
      // For now, we'll assume the coupon is valid
      // setCouponStatus('valid');
      // setDiscountAmount(Math.round(serviceData.price * 0.05));
      // In a real application, you'd call an API to validate the coupon
    } catch (error) {
      console.error('Coupon application error:', error);
      setCouponStatus('invalid');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponStatus('');
    setDiscountAmount(0);
  };

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
        <Header />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
            {/* Booking Details */}
            <div className="bg-[#faf5eb] backdrop-blur-sm rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 flex items-center justify-center mr-4">
                  <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.7153 16.3828C15.0556 18 17.0833 20.1406 18.6736 22.6719C19.1597 23.4453 19.6042 24.2578 20 25.0938C20.3958 24.25 20.8403 23.4453 21.3264 22.6719C22.9167 20.1406 24.9444 18 27.2847 16.3828C30.3889 14.2344 34.0347 13 37.9167 13H38.6042C39.375 13 40 13.7031 40 14.5703C40 26.1328 31.6736 35.5 21.3958 35.5H20H18.6042C8.32639 35.5 0 26.1328 0 14.5703C0 13.7031 0.625 13 1.39583 13H2.08333C5.96528 13 9.61111 14.2344 12.7153 16.3828ZM20.9375 0.9375C22.0278 2.25781 25.1806 6.54687 26.7986 13.7969C24.1597 15.4844 21.8403 17.7656 20 20.4844C18.1597 17.7656 15.8403 15.4922 13.2014 13.7969C14.8125 6.54687 17.9653 2.25781 19.0625 0.9375C19.3056 0.648437 19.6458 0.5 20 0.5C20.3542 0.5 20.6944 0.648437 20.9375 0.9375Z" fill="#A07735"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-['Marcellus'] text-[#1f2937]">Booking Details</h1>
              </div>

              <div className="space-y-8">
                <div className="flex">
                  <div className="w-36 text-[#6b7280] font-['Marcellus'] text-base">Service :</div>
                  <div className="flex-1 text-[#1f2937] font-['Marcellus'] text-base">{serviceData.name} for {serviceData.duration} Minutes</div>
                </div>

                <div className="flex">
                  <div className="w-36 text-[#6b7280] font-['Marcellus'] text-base">Location:</div>
                  <div className="flex-1 text-[#1f2937] font-['Marcellus'] text-base">{serviceData.city} - {serviceData.location}</div>
                </div>

                <div className="flex">
                  <div className="w-36 text-[#6b7280] font-['Marcellus'] text-base">Date & Time:</div>
                  <div className="flex-1 text-[#1f2937] font-['Marcellus'] text-base">{slotData.time}, {slotData.formattedDate}</div>
                </div>

                {/* <div className="flex">
                  <div className="w-36 text-[#6b7280] font-['Marcellus'] text-base">Price:</div>
                  <div className="flex-1 text-[#a07735] font-['Marcellus'] text-lg font-semibold">₹ {serviceData.price.toLocaleString()}</div>
                </div> */}
              </div>

              {/* <div className="mt-10 flex space-x-10">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input 
                      type="radio" 
                      name="bookingType" 
                      value="self"
                      checked={bookingType === "self"}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="sr-only" 
                    />
                    <div className={`h-6 w-6 rounded-full border-2 ${bookingType === "self" ? "border-[#a07735]" : "border-gray-300"}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {bookingType === "self" && (
                          <div className="h-3 w-3 rounded-full bg-[#a07735]"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[#1f2937]">Book for self</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input 
                      type="radio" 
                      name="bookingType" 
                      value="other"
                      checked={bookingType === "other"}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="sr-only" 
                    />
                    <div className={`h-6 w-6 rounded-full border-2 ${bookingType === "other" ? "border-[#a07735]" : "border-gray-300"}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {bookingType === "other" && (
                          <div className="h-3 w-3 rounded-full bg-[#a07735]"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[#1f2937]">Book for someone else</span>
                </label>
              </div> */}

              {/* Apply Coupon */}
              <div className="mt-12 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-8">
                <div className="flex items-center mb-4">
                  <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.88889 0C1.74392 0 0 1.86849 0 4.16667V8.33333C0 8.90625 0.449653 9.35547 0.953993 9.54427C2.09635 9.96745 2.91667 11.1328 2.91667 12.5C2.91667 13.8672 2.09635 15.0326 0.953993 15.4557C0.449653 15.6445 0 16.0938 0 16.6667V20.8333C0 23.1315 1.74392 25 3.88889 25H31.1111C33.2561 25 35 23.1315 35 20.8333V16.6667C35 16.0938 34.5503 15.6445 34.046 15.4557C32.9036 15.0326 32.0833 13.8672 32.0833 12.5C32.0833 11.1328 32.9036 9.96745 34.046 9.54427C34.5503 9.35547 35 8.90625 35 8.33333V4.16667C35 1.86849 33.2561 0 31.1111 0H3.88889ZM7.77778 7.29167V17.7083C7.77778 18.2812 8.21528 18.75 8.75 18.75H26.25C26.7847 18.75 27.2222 18.2812 27.2222 17.7083V7.29167C27.2222 6.71875 26.7847 6.25 26.25 6.25H8.75C8.21528 6.25 7.77778 6.71875 7.77778 7.29167ZM5.83333 6.25C5.83333 5.09766 6.70226 4.16667 7.77778 4.16667H27.2222C28.2977 4.16667 29.1667 5.09766 29.1667 6.25V18.75C29.1667 19.9023 28.2977 20.8333 27.2222 20.8333H7.77778C6.70226 20.8333 5.83333 19.9023 5.83333 18.75V6.25Z" fill="#A07735"/>
                  </svg>
                  <h1 className="text-2xl font-['Marcellus'] text-[#1f2937] ml-4">Apply Coupon</h1>
                </div>
                <p className="text-[#6b7280] mb-6 font-['Marcellus'] text-base">Choose and add an additional discount on your booking.</p>
                
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className={`w-full px-4 py-3 rounded-lg border font-['Marcellus'] text-base ${
                        couponStatus === 'valid' 
                          ? 'border-green-500 bg-green-50' 
                          : couponStatus === 'invalid' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-[#a07735] focus:border-transparent transition-all duration-200`}
                    />
                    {couponStatus === 'valid' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {couponStatus === 'invalid' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || isApplyingCoupon}
                      className={`flex-1 flex items-center justify-center bg-[#a07735] text-white px-6 py-3 rounded-lg hover:bg-[#8a6830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-['Marcellus'] text-base`}
                    >
                      {isApplyingCoupon ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Applying...
                        </>
                      ) : (
                        <>
                          <Tag className="w-5 h-5 mr-2" />
                          Apply Coupon
                        </>
                      )}
                    </button>
                    {couponStatus === 'valid' && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[#a07735] hover:text-[#8a6830] transition-colors font-['Marcellus'] text-base"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {couponStatus === 'valid' && (
                    <div className="text-green-600 text-base flex items-center font-['Marcellus']">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Coupon applied successfully! You've saved ₹{discountAmount.toLocaleString()}
                    </div>
                  )}
                  {couponStatus === 'invalid' && (
                    <div className="text-red-600 text-base flex items-center font-['Marcellus']">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Invalid or expired coupon code
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#faf5eb] backdrop-blur-sm rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 flex items-center justify-center mr-4">
                  <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C9.77865 0 7.46094 1.56445 6.60807 3.75H4.16667C1.86849 3.75 0 5.43164 0 7.5V26.25C0 28.3184 1.86849 30 4.16667 30H20.8333C23.1315 30 25 28.3184 25 26.25V7.5C25 5.43164 23.1315 3.75 20.8333 3.75H18.3919C17.5391 1.56445 15.2214 0 12.5 0ZM12.5 3.75C13.0525 3.75 13.5824 3.94754 13.9731 4.29917C14.3638 4.65081 14.5833 5.12772 14.5833 5.625C14.5833 6.12228 14.3638 6.59919 13.9731 6.95083C13.5824 7.30246 13.0525 7.5 12.5 7.5C11.9475 7.5 11.4176 7.30246 11.0269 6.95083C10.6362 6.59919 10.4167 6.12228 10.4167 5.625C10.4167 5.12772 10.6362 4.65081 11.0269 4.29917C11.4176 3.94754 11.9475 3.75 12.5 3.75ZM4.6875 15.9375C4.6875 15.5645 4.85212 15.2069 5.14515 14.9431C5.43817 14.6794 5.8356 14.5313 6.25 14.5312C6.6644 14.5313 7.06183 14.6794 7.35485 14.9431C7.64788 15.2069 7.8125 15.5645 7.8125 15.9375C7.8125 16.3105 7.64788 16.6681 7.35485 16.9319C7.06183 17.1956 6.6644 17.3438 6.25 17.3438C5.8356 17.3438 5.43817 17.1956 5.14515 16.9319C4.85212 16.6681 4.6875 16.3105 4.6875 15.9375ZM11.4583 15H19.7917C20.3646 15 20.8333 15.4219 20.8333 15.9375C20.8333 16.4531 20.3646 16.875 19.7917 16.875H11.4583C10.8854 16.875 10.4167 16.4531 10.4167 15.9375C10.4167 15.4219 10.8854 15 11.4583 15ZM4.6875 21.5625C4.6875 21.1895 4.85212 20.8319 5.14515 20.5681C5.43817 20.3044 5.8356 20.1562 6.25 20.1562C6.6644 20.1562 7.06183 20.3044 7.35485 20.5681C7.64788 20.8319 7.8125 21.1895 7.8125 21.5625C7.8125 21.9355 7.64788 22.2931 7.35485 22.5569C7.06183 22.8206 6.6644 22.9688 6.25 22.9688C5.8356 22.9688 5.43817 22.8206 5.14515 22.5569C4.85212 22.2931 4.6875 21.9355 4.6875 21.5625ZM10.4167 21.5625C10.4167 21.0469 10.8854 20.625 11.4583 20.625H19.7917C20.3646 20.625 20.8333 21.0469 20.8333 21.5625C20.8333 22.0781 20.3646 22.5 19.7917 22.5H11.4583C10.8854 22.5 10.4167 22.0781 10.4167 21.5625Z" fill="#A07735"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-['Marcellus'] text-[#1f2937]">Summary</h1>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-[#1f2937] font-['Marcellus'] text-base">Service Price:</div>
                  <div className="text-[#a07735] font-['Marcellus'] text-lg font-semibold">₹ {serviceData.price.toLocaleString()}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[#1f2937] font-['Marcellus'] text-base">GST(18%):</div>
                  <div className="text-[#a07735] font-['Marcellus'] text-lg font-semibold">₹ {gstAmount.toLocaleString()}</div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-[#1f2937] font-['Marcellus'] text-lg font-semibold">Total Amount:</div>
                    <div className="text-[#a07735] font-['Marcellus'] text-xl font-bold">₹ {totalAmount.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Promo Box */}
              <div className="mt-810 bg-opacity-50 backdrop-blur-sm rounded-xl p-6"></div>
              {/* <div className="mt-8 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center">
                  <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1_51)">
                      <path d="M19.4978 2.61311C19.827 1.81038 19.5815 0.872875 18.9062 0.35725C18.231 -0.158375 17.3103 -0.1115 16.6797 0.462719L2.39396 13.5877C1.83592 14.1033 1.63503 14.9295 1.89731 15.6561C2.15958 16.3826 2.82923 16.8748 3.57141 16.8748H9.79351L5.50222 27.3865C5.17298 28.1893 5.41851 29.1268 6.09373 29.6424C6.76896 30.158 7.68972 30.1112 8.3203 29.5369L22.606 16.4119C23.164 15.8963 23.3649 15.0701 23.1027 14.3436C22.8404 13.617 22.1763 13.1307 21.4286 13.1307H15.2065L19.4978 2.61311Z" fill="#A07735"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_1_51">
                        <path d="M0 0H25V30H0V0Z" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <p className="text-[#a07735] font-['Marcellus'] text-base font-medium ml-2">Instant 5% Off On the Cart by becoming Fest Member.</p>
                </div>
              </div> */}

              {/* Terms & Conditions */}
              {/* <div className="mt-10 flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  className="mt-1 border-gray-300 h-4 w-4 data-[state=checked]:bg-[#a07735] data-[state=checked]:border-[#a07735]" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-[#4b5563]">
                  I agree to Odespa <span className="text-[#a07735] font-medium">Terms & Conditions</span>
                </label>
              </div> */}

              {/* Refund Policy */}
              {/* <div className="mt-8 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-6">
                <div className="flex">
                  <div className="w-7 h-7 rounded-full bg-[#a07735] text-white flex items-center justify-center mr-4 shrink-0 font-['Marcellus'] font-medium">
                    i
                  </div>
                  <div>
                    <p className="text-base text-[#374151] leading-relaxed font-['Marcellus']">
                      Full refund of the booking amount on cancellation up to 2 hours of appointment time.
                    </p>
                    <div className="text-right mt-2">
                      <span className="text-sm text-[#a07735] font-['Marcellus'] font-medium">T&C Apply</span>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Confirm Button */}
              <div className="mt-10">
                <button 
                  onClick={() => {
                    const authToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
                    if (!authToken) {
                      // Store the current URL to redirect back after login
                      const currentUrl = window.location.href;
                      localStorage.setItem('redirectAfterLogin', currentUrl);
                      router.push('/signin');
                      return;
                    }
                    handleConfirmBooking();
                  }}
                  className="w-full bg-[#a07735] text-white py-4 rounded-lg font-['Marcellus'] text-lg font-medium hover:bg-[#8a6830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}