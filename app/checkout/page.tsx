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

interface ServiceData {
  name: string
  duration: number
  price: number
  location: string
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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Get service data from URL params
    const serviceName = searchParams.get('serviceName')
    const duration = searchParams.get('duration')
    const price = searchParams.get('price')
    const location = searchParams.get('location')
    const date = searchParams.get('date')
    const time = searchParams.get('time')

    if (serviceName && duration && price && location && date && time) {
      setServiceData({
        name: serviceName,
        duration: parseInt(duration),
        price: parseInt(price),
        location: location
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
  const convenienceFee = 60
  const gstAmount = Math.round(convenienceFee * 0.18)
  const totalAmount = serviceData.price + convenienceFee + gstAmount

  // Add handleConfirmBooking function
  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsBookingConfirmed(true);
    } catch (error) {
      console.error('Booking confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Booking Details */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 flex items-center justify-center mr-4">
                <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.7153 16.3828C15.0556 18 17.0833 20.1406 18.6736 22.6719C19.1597 23.4453 19.6042 24.2578 20 25.0938C20.3958 24.25 20.8403 23.4453 21.3264 22.6719C22.9167 20.1406 24.9444 18 27.2847 16.3828C30.3889 14.2344 34.0347 13 37.9167 13H38.6042C39.375 13 40 13.7031 40 14.5703C40 26.1328 31.6736 35.5 21.3958 35.5H20H18.6042C8.32639 35.5 0 26.1328 0 14.5703C0 13.7031 0.625 13 1.39583 13H2.08333C5.96528 13 9.61111 14.2344 12.7153 16.3828ZM20.9375 0.9375C22.0278 2.25781 25.1806 6.54687 26.7986 13.7969C24.1597 15.4844 21.8403 17.7656 20 20.4844C18.1597 17.7656 15.8403 15.4922 13.2014 13.7969C14.8125 6.54687 17.9653 2.25781 19.0625 0.9375C19.3056 0.648437 19.6458 0.5 20 0.5C20.3542 0.5 20.6944 0.648437 20.9375 0.9375Z" fill="#A07735"/>
                </svg>
              </div>
              <h2 className="text-2xl font-serif text-[#1f2937]">Booking Details</h2>
            </div>

            <div className="space-y-8">
              <div className="flex">
                <div className="w-36 text-[#6b7280] font-medium">Service :</div>
                <div className="flex-1 text-[#1f2937]">{serviceData.name} for {serviceData.duration} Minutes</div>
              </div>

              <div className="flex">
                <div className="w-36 text-[#6b7280] font-medium">Location:</div>
                <div className="flex-1 text-[#1f2937]">{serviceData.location}</div>
              </div>

              <div className="flex">
                <div className="w-36 text-[#6b7280] font-medium">Date & Time:</div>
                <div className="flex-1 text-[#1f2937]">{slotData.time}, {slotData.formattedDate}</div>
              </div>

              <div className="flex">
                <div className="w-36 text-[#6b7280] font-medium">Price:</div>
                <div className="flex-1 text-[#a07735] font-semibold">₹ {serviceData.price.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-10 flex space-x-10">
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
            </div>

            {/* Apply Coupon */}
            <div className="mt-12 bg-[#faf5eb] rounded-xl p-8">
              <div className="flex items-center mb-4">
                <Ticket className="w-7 h-7 text-[#a07735] mr-4" />
                <h3 className="text-xl font-serif text-[#1f2937]">Apply Coupon</h3>
              </div>
              <p className="text-[#6b7280] mb-6">Choose and add an additional discount on your booking.</p>
              <button className="flex items-center bg-[#a07735] text-white px-8 py-3.5 rounded-lg hover:bg-[#8a6830] transition-colors">
                <Tag className="w-5 h-5 mr-2" />
                Apply Coupon
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 flex items-center justify-center mr-4">
                <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 0C9.77865 0 7.46094 1.56445 6.60807 3.75H4.16667C1.86849 3.75 0 5.43164 0 7.5V26.25C0 28.3184 1.86849 30 4.16667 30H20.8333C23.1315 30 25 28.3184 25 26.25V7.5C25 5.43164 23.1315 3.75 20.8333 3.75H18.3919C17.5391 1.56445 15.2214 0 12.5 0ZM12.5 3.75C13.0525 3.75 13.5824 3.94754 13.9731 4.29917C14.3638 4.65081 14.5833 5.12772 14.5833 5.625C14.5833 6.12228 14.3638 6.59919 13.9731 6.95083C13.5824 7.30246 13.0525 7.5 12.5 7.5C11.9475 7.5 11.4176 7.30246 11.0269 6.95083C10.6362 6.59919 10.4167 6.12228 10.4167 5.625C10.4167 5.12772 10.6362 4.65081 11.0269 4.29917C11.4176 3.94754 11.9475 3.75 12.5 3.75ZM4.6875 15.9375C4.6875 15.5645 4.85212 15.2069 5.14515 14.9431C5.43817 14.6794 5.8356 14.5313 6.25 14.5312C6.6644 14.5313 7.06183 14.6794 7.35485 14.9431C7.64788 15.2069 7.8125 15.5645 7.8125 15.9375C7.8125 16.3105 7.64788 16.6681 7.35485 16.9319C7.06183 17.1956 6.6644 17.3438 6.25 17.3438C5.8356 17.3438 5.43817 17.1956 5.14515 16.9319C4.85212 16.6681 4.6875 16.3105 4.6875 15.9375ZM11.4583 15H19.7917C20.3646 15 20.8333 15.4219 20.8333 15.9375C20.8333 16.4531 20.3646 16.875 19.7917 16.875H11.4583C10.8854 16.875 10.4167 16.4531 10.4167 15.9375C10.4167 15.4219 10.8854 15 11.4583 15ZM4.6875 21.5625C4.6875 21.1895 4.85212 20.8319 5.14515 20.5681C5.43817 20.3044 5.8356 20.1562 6.25 20.1562C6.6644 20.1562 7.06183 20.3044 7.35485 20.5681C7.64788 20.8319 7.8125 21.1895 7.8125 21.5625C7.8125 21.9355 7.64788 22.2931 7.35485 22.5569C7.06183 22.8206 6.6644 22.9688 6.25 22.9688C5.8356 22.9688 5.43817 22.8206 5.14515 22.5569C4.85212 22.2931 4.6875 21.9355 4.6875 21.5625ZM10.4167 21.5625C10.4167 21.0469 10.8854 20.625 11.4583 20.625H19.7917C20.3646 20.625 20.8333 21.0469 20.8333 21.5625C20.8333 22.0781 20.3646 22.5 19.7917 22.5H11.4583C10.8854 22.5 10.4167 22.0781 10.4167 21.5625Z" fill="#A07735"/>
                </svg>
              </div>
              <h2 className="text-2xl font-serif text-[#1f2937]">Summary</h2>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-[#1f2937] font-medium">Service Price:</div>
                <div className="text-[#a07735] font-semibold">₹ {serviceData.price.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[#1f2937] font-medium">Convenience Fee:</div>
                <div className="text-[#a07735] font-semibold">₹ {convenienceFee.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[#1f2937] font-medium">GST on Fee(18%):</div>
                <div className="text-[#a07735] font-semibold">₹ {gstAmount.toLocaleString()}</div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-[#1f2937] font-semibold">Total Amount:</div>
                  <div className="text-[#a07735] font-bold text-lg">₹ {totalAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Promo Box */}
            <div className="mt-8 bg-[#faf5eb] rounded-xl p-6">
              <div className="flex items-center">
                <Zap className="w-7 h-7 text-[#a07735] mr-4 shrink-0" />
                <p className="text-[#a07735] font-medium">Instant 5% Off On the Cart by becoming Fest Member.</p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-10 flex items-start space-x-3">
              <Checkbox id="terms" className="mt-1 border-gray-300" />
              <label htmlFor="terms" className="text-sm text-[#4b5563]">
                I agree to Odespa <span className="text-[#a07735] font-medium">Terms & Conditions</span>
              </label>
            </div>

            {/* Refund Policy */}
            <div className="mt-8 bg-[#faf5eb] rounded-xl p-6">
              <div className="flex">
                <div className="w-7 h-7 rounded-full bg-[#a07735] text-white flex items-center justify-center mr-4 shrink-0 font-medium">
                  i
                </div>
                <div>
                  <p className="text-sm text-[#374151] leading-relaxed">
                    Full refund of the booking amount on cancellation up to 2 hours of appointment time.
                  </p>
                  <div className="text-right mt-2">
                    <span className="text-xs text-[#a07735] font-medium">T&C Apply</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="mt-10">
              <button 
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-[#a07735] text-white py-4 rounded-lg font-medium hover:bg-[#8a6830] transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            {!isBookingConfirmed ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Confirmation</h2>
                <div className="space-y-3">
                  <p className="font-inter"><span className="font-medium">Service:</span> {serviceData?.name}</p>
                  <p className="font-inter"><span className="font-medium">Location:</span> {serviceData?.location}</p>
                  <p className="font-inter"><span className="font-medium">Date & Time:</span> {slotData?.formattedDate} ⏰ {slotData?.time}</p>
                  <p className="font-inter"><span className="font-medium">Duration:</span> {serviceData?.duration} mins</p>
                  <p className="font-inter"><span className="font-medium">Price:</span> ₹{serviceData?.price.toLocaleString()}</p>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowConfirmation(false)}
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
    </div>
  )
}
