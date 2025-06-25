"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getInvoiceDetails } from "@/actions/invoice-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Header from "@/app/components/Header"
import Image from "next/image"
import { formatPrice } from "@/app/utils/formatPrice"
import { initiatePayment } from "@/app/utils/payment"


interface InvoiceData {
  id: string;
  receipt_no: string;
  status: number;
  items?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  transactions?: {
    id: string;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
  }[];
  membershipName?: string;
  amount?: number;
  total_amount?: number;
  duration?: string;
  gst?: number;
  total?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface InvoiceResponse {
  success: boolean;
  data?: InvoiceData;
  error?: {
    message: string;
  };
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastPaymentAttempt, setLastPaymentAttempt] = useState<number>(0)
  const [countdown, setCountdown] = useState<number>(0)
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    email: '',
    phone: ''
  })
  const membershipName = searchParams.get('membership_name')
  const membershipPrice = searchParams.get('price')

  // Rate limiting: minimum 60 seconds between payment attempts
  const RATE_LIMIT_DELAY = 60000 // 60 seconds in milliseconds

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [countdown])

  // Check rate limiting on component mount and update countdown
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastAttempt = now - lastPaymentAttempt
    
    if (timeSinceLastAttempt < RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil((RATE_LIMIT_DELAY - timeSinceLastAttempt) / 1000)
      setCountdown(remainingTime)
    }
  }, [lastPaymentAttempt])

  useEffect(() => {
    // Load user info from localStorage when component mounts
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      const userData = JSON.parse(storedUserData)
      setUserInfo({
        firstName: userData.first_name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      })
    }
  }, [])

  useEffect(() => {
    const fetchInvoice = async () => {
      const invoiceId = searchParams.get('invoice_id')
      const membershipId = searchParams.get('membership_id')
      
      if (!invoiceId && !membershipId) {
        setError("No membership or invoice ID provided")
        setLoading(false)
        return
      }

      try {
        // If we have an invoice ID, fetch the invoice details
        if (invoiceId) {
          const response = await getInvoiceDetails(invoiceId) as InvoiceResponse
          
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "Failed to fetch invoice details")
          }

          // Calculate GST (18%) and total amount
          const baseAmount = membershipPrice ? parseInt(membershipPrice) : response.data.amount || 0
          const gstAmount = Math.round(baseAmount * 0.18) // 18% GST
          const totalAmount = baseAmount + gstAmount

          // Merge invoice data with membership details
          const invoiceData: InvoiceData = {
            ...response.data,
            membershipName: membershipName || undefined,
            amount: baseAmount,
            gst: gstAmount,
            total: totalAmount,
            total_amount: totalAmount
          }
          setInvoice(invoiceData)
        } else {
          // If we only have a membership ID, create a temporary invoice object
          const baseAmount = membershipPrice ? parseInt(membershipPrice) : 0
          const gstAmount = Math.round(baseAmount * 0.18) // 18% GST
          const totalAmount = baseAmount + gstAmount

          const tempInvoice: InvoiceData = {
            id: 'pending',
            receipt_no: 'pending',
            status: 0,
            membershipName: membershipName || undefined,
            amount: baseAmount,
            gst: gstAmount,
            total: totalAmount,
            total_amount: totalAmount
          }
          setInvoice(tempInvoice)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load invoice details. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [searchParams, toast, membershipName, membershipPrice])

  const createMembershipInvoice = async (membershipId: string) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')

      if (!userData?.id) {
        throw new Error('User ID is required')
      }

      const response = await fetch('/api/memberships/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membershipId: membershipId,
          userId: userData.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create invoice')
      }

      return data
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  const handlePayment = async () => {
    try {
      // Check rate limiting
      const now = Date.now()
      const timeSinceLastAttempt = now - lastPaymentAttempt
      
      if (timeSinceLastAttempt < RATE_LIMIT_DELAY) {
        const remainingTime = Math.ceil((RATE_LIMIT_DELAY - timeSinceLastAttempt) / 1000)
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: `Please wait ${remainingTime} seconds before trying again to avoid payment gateway issues.`,
        })
        return
      }

      // Check if there's already a payment in progress
      if (isProcessing) {
        toast({
          variant: "destructive",
          title: "Payment in Progress",
          description: "A payment is already being processed. Please wait.",
        })
        return
      }

      setIsProcessing(true)
      setLastPaymentAttempt(now)
      
      // Get membership_id from URL params
      const params = new URLSearchParams(window.location.search)
      const membershipId = params.get('membership_id')

      if (!membershipId) {
        throw new Error('Membership ID is required')
      }

      if (!userInfo.firstName || !userInfo.phone) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Missing user information. Please ensure you are logged in with complete details.",
        })
        return
      }

      // Create membership invoice
      const invoiceData = await createMembershipInvoice(membershipId)

      // Store payment attempt timestamp in localStorage for persistence
      localStorage.setItem('lastPaymentAttempt', now.toString())

      // Use the payment.ts function directly
      await initiatePayment({
        name: membershipName || "Ode Spa Membership",
        amount: Number(invoice?.total_amount) || 0,
        firstName: userInfo.firstName,
        email: userInfo.email,
        phone: userInfo.phone,
        invoiceId: invoiceData.invoice_id,
      })

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Check for existing payment attempts on component mount
  useEffect(() => {
    const storedLastAttempt = localStorage.getItem('lastPaymentAttempt')
    if (storedLastAttempt) {
      setLastPaymentAttempt(parseInt(storedLastAttempt))
    }
  }, [])

  // Cleanup payment forms on component unmount
  useEffect(() => {
    return () => {
      const existingForm = document.getElementById('payu-payment-form')
      if (existingForm && existingForm.parentNode) {
        existingForm.parentNode.removeChild(existingForm)
      }
    }
  }, [])

  if (loading) {
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
        {/* Subtle blurred circles */}
        <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full blur-sm -z-30" />
        <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />
        <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 blur-3xl rounded-full -z-30" />
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
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
        {/* Subtle blurred circles */}
        <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full -z-30" />
        <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />
        <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 rounded-full -z-30" />
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (!invoice) {
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
        {/* Subtle blurred circles */}
        <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full -z-30" />
        <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />
        <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 rounded-full -z-30" />
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Not Found</CardTitle>
              <CardDescription>Invoice not found</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

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
      {/* Subtle blurred circles */}
      <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full blur-sm -z-30" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />
      <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 rounded-full blur-3xl -z-30" />
      <Header />
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-marcellus text-[#232323] mb-6 text-center">Confirm Your Membership</h1>
          <h2 className="text-sm sm:text-base text-[#454545] font-inter mb-6 text-center">Enjoy exclusive benefits and wellness rewards by subscribing.</h2>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Membership Summary Card */}
            <div className="w-full bg-[#faf5eb] rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden" style={{boxShadow: '0 8px 32px 0 rgba(160,119,53,0.12)'}}>
              {/* Decorative Elements */}
              {/* <div className="absolute top-0 right-0 w-32 h-32 bg-[#a07735] opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#a07735] opacity-5 rounded-full -ml-20 -mb-20 group-hover:scale-110 transition-transform duration-500"></div> */}
              {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#a07735] opacity-3 rounded-full blur-3xl group-hover:opacity-5 transition-opacity duration-500"></div> */}
              
              {/* Header Section */}
              <div className="flex items-start gap-4 mb-2">
                <div className="bg-[#a07735] bg-opacity-10 p-3 rounded-xl group-hover:bg-opacity-20 transition-all duration-300">
                  <svg width="32" height="32" viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-300">
                    <path d="M8.58281 10.0297C10.1625 11 11.5312 12.2844 12.6047 13.8031C12.9328 14.2672 13.2328 14.7547 13.5 15.2562C13.7672 14.75 14.0672 14.2672 14.3953 13.8031C15.4688 12.2844 16.8375 11 18.4172 10.0297C20.5125 8.74063 22.9734 8 25.5938 8H26.0578C26.5781 8 27 8.42188 27 8.94219C27 15.8797 21.3797 21.5 14.4422 21.5H13.5H12.5578C5.62031 21.5 0 15.8797 0 8.94219C0 8.42188 0.421875 8 0.942188 8H1.40625C4.02656 8 6.4875 8.74063 8.58281 10.0297ZM14.1328 0.7625C14.8687 1.55469 16.9969 4.12812 18.0891 8.47812C16.3078 9.49062 14.7422 10.8594 13.5 12.4906C12.2578 10.8594 10.6922 9.49531 8.91094 8.47812C9.99844 4.12812 12.1266 1.55469 12.8672 0.7625C13.0312 0.589062 13.2609 0.5 13.5 0.5C13.7391 0.5 13.9688 0.589062 14.1328 0.7625Z" fill="#A07735"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="font-marcellus text-xl sm:text-2xl text-[#232323] font-semibold group-hover:text-[#a07735] transition-colors duration-300">{invoice.membershipName || 'Membership'}</h2>
                  <div className="flex items-center gap-2 mt-1 mb-6">
                    <span className="text-[#a07735] font-bold text-lg group-hover:scale-105 transition-transform duration-300">{invoice.amount ? formatPrice(invoice.amount) : ''}</span>
                  </div>
                  <div>
                  <span className="bg-[#a07735] text-white px-4 py-1 rounded-full text-sm font-medium group-hover:bg-opacity-90 transition-all duration-300">{invoice.duration || '12 months'}</span>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="relative">
                <h3 className="text-[#232323] font-semibold mb-4 text-lg">Exclusive Benefits</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-50 rounded-xl p-4 flex items-start gap-3 hover:bg-opacity-70 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="bg-[#a07735] bg-opacity-10 p-2 rounded-lg">
                      <svg width="24" height="24" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4.59258C0 2.40234 1.77734 0.625 3.96758 0.625C5.02031 0.625 6.0293 1.04336 6.77305 1.78711L8.75 3.76133L10.7242 1.78711C11.4707 1.04336 12.4797 0.625 13.5324 0.625C15.7227 0.625 17.5 2.40234 17.5 4.59258V5.40469C17.5 7.59766 15.7227 9.375 13.5324 9.375C12.4797 9.375 11.4707 8.95664 10.727 8.21289L8.75 6.23867L6.77578 8.21289C6.0293 8.95664 5.02031 9.375 3.96758 9.375C1.77734 9.375 0 7.59766 0 5.40742V4.59258ZM7.51133 5L5.53711 3.02578C5.12148 2.61016 4.55547 2.375 3.96758 2.375C2.74258 2.375 1.75 3.36758 1.75 4.59258V5.40469C1.75 6.62969 2.74258 7.62227 3.96758 7.62227C4.55547 7.62227 5.12148 7.38984 5.53711 6.97148L7.51133 5ZM9.98594 5L11.9602 6.97422C12.3758 7.38984 12.9418 7.625 13.5297 7.625C14.7547 7.625 15.7473 6.63242 15.7473 5.40742V4.59258C15.7473 3.36758 14.7547 2.375 13.5297 2.375C12.9418 2.375 12.3758 2.60742 11.9602 3.02578L9.98867 5H9.98594Z" fill="#A07735"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-medium text-[16px] text-[#232323] mb-1">Unlimited Spa Bookings</h1>
                      <p className="text-sm text-[#666666]">Book your favorite treatments anytime</p>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-50 rounded-xl p-4 flex items-start gap-3 hover:bg-opacity-70 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="bg-[#a07735] bg-opacity-10 p-2 rounded-lg">
                      <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.43359 1.06914L12.9281 4.60469C14.3609 6.05391 14.3609 8.38359 12.9281 9.83281L9.86562 12.9309C9.61133 13.1879 9.1957 13.1906 8.93867 12.9363C8.68164 12.682 8.67891 12.2664 8.9332 12.0094L11.993 8.91133C12.9199 7.97344 12.9199 6.4668 11.993 5.52891L8.50117 1.99336C8.24687 1.73633 8.24961 1.3207 8.50664 1.06641C8.76367 0.812109 9.1793 0.814844 9.43359 1.07188V1.06914ZM0 6.27539V2.1875C0 1.46289 0.587891 0.875 1.3125 0.875H5.40039C5.86523 0.875 6.31094 1.0582 6.63906 1.38633L11.2328 5.98008C11.9164 6.66367 11.9164 7.77109 11.2328 8.45469L7.58242 12.1051C6.89883 12.7887 5.79141 12.7887 5.10781 12.1051L0.514062 7.51133C0.183203 7.1832 0 6.74023 0 6.27539ZM3.9375 3.9375C3.9375 3.70544 3.84531 3.48288 3.68122 3.31878C3.51712 3.15469 3.29456 3.0625 3.0625 3.0625C2.83044 3.0625 2.60788 3.15469 2.44378 3.31878C2.27969 3.48288 2.1875 3.70544 2.1875 3.9375C2.1875 4.16956 2.27969 4.39212 2.44378 4.55622C2.60788 4.72031 2.83044 4.8125 3.0625 4.8125C3.29456 4.8125 3.51712 4.72031 3.68122 4.55622C3.84531 4.39212 3.9375 4.16956 3.9375 3.9375Z" fill="#A07735"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-medium text-[16px] text-[#232323] mb-1">Exclusive Discounts</h1>
                      <p className="text-sm text-[#666666]">Special rates on all services</p>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-50 rounded-xl p-4 flex items-start gap-3 hover:bg-opacity-70 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="bg-[#a07735] bg-opacity-10 p-2 rounded-lg">
                      <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 1.3125C3.8582 1.3125 1.3125 3.8582 1.3125 7V8.09375C1.3125 8.45742 1.01992 8.75 0.65625 8.75C0.292578 8.75 0 8.45742 0 8.09375V7C0 3.13359 3.13359 0 7 0C10.8664 0 14 3.13359 14 7V10.9402C14 12.2691 12.9227 13.3465 11.591 13.3465L8.575 13.3438C8.34805 13.7348 7.92422 14 7.4375 14H6.5625C5.83789 14 5.25 13.4121 5.25 12.6875C5.25 11.9629 5.83789 11.375 6.5625 11.375H7.4375C7.92422 11.375 8.34805 11.6402 8.575 12.0312L11.5938 12.034C12.198 12.034 12.6875 11.5445 12.6875 10.9402V7C12.6875 3.8582 10.1418 1.3125 7 1.3125ZM3.9375 5.6875H4.375C4.85898 5.6875 5.25 6.07852 5.25 6.5625V9.625C5.25 10.109 4.85898 10.5 4.375 10.5H3.9375C2.97227 10.5 2.1875 9.71523 2.1875 8.75V7.4375C2.1875 6.47227 2.97227 5.6875 3.9375 5.6875ZM10.0625 5.6875C11.0277 5.6875 11.8125 6.47227 11.8125 7.4375V8.75C11.8125 9.71523 11.0277 10.5 10.0625 10.5H9.625C9.14102 10.5 8.75 10.109 8.75 9.625V6.5625C8.75 6.07852 9.14102 5.6875 9.625 5.6875H10.0625Z" fill="#A07735"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-medium text-[16px] text-[#232323] mb-1">Priority Support</h1>
                      <p className="text-sm text-[#666666]">Dedicated booking assistance</p>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-50 rounded-xl p-4 flex items-start gap-3 hover:bg-opacity-70 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="bg-[#a07735] bg-opacity-10 p-2 rounded-lg">
                      <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.4375 2.62511C5.28828 2.62511 3.46992 4.03331 2.85195 5.97471C3.7707 5.50987 4.80703 5.2501 5.90625 5.2501H8.3125C8.55313 5.2501 8.75 5.44698 8.75 5.6876C8.75 5.92823 8.55313 6.1251 8.3125 6.1251H7.875H5.90625C5.45234 6.1251 5.01211 6.17706 4.58828 6.27276C3.88008 6.43409 3.22109 6.7212 2.63594 7.11221C1.04727 8.17042 0 9.97784 0 12.0314V12.4689C0 12.8325 0.292578 13.1251 0.65625 13.1251C1.01992 13.1251 1.3125 12.8325 1.3125 12.4689V12.0314C1.3125 10.6997 1.87852 9.50206 2.78359 8.66261C3.325 10.7271 5.20352 12.2501 7.4375 12.2501H7.46484C11.077 12.231 14 8.67081 14 4.28214C14 3.11729 13.7949 2.00987 13.423 1.01182C13.352 0.823152 13.0758 0.831355 12.9801 1.00909C12.466 1.97159 11.4488 2.62511 10.2812 2.62511H7.4375Z" fill="#A07735"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-medium text-[16px] text-[#232323] mb-1">Wellness Challenges</h1>
                      <p className="text-sm text-[#666666]">Join exclusive wellness programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Summary Card */}
            <div className="w-full bg-[#faf5eb] rounded-2xl shadow-md p-4 sm:p-6 flex flex-col justify-between" style={{boxShadow: '0 4px 16px 0 rgba(160,119,53,0.07)'}}>
              <div>
                <h1 className="font-semibold text-lg sm:text-xl mb-4 text-[#232323]">Billing Summary</h1>
                <div className="flex justify-between mb-3 text-[#232323]">
                  <span className="text-sm sm:text-base">{invoice.membershipName || 'Membership'}</span>
                  <span className="text-sm sm:text-base">{invoice.amount ? formatPrice(invoice.amount) : ''}</span>
                </div>
                <div className="flex justify-between mb-6text-[#232323]">
                  <span className="text-sm sm:text-base">GST (18%)</span>
                  <span className="text-sm sm:text-base">{invoice.gst ? formatPrice(invoice.gst) : ''}</span>
                </div>
                <div className="flex justify-between mt-4 pt-8 border-t-2 font-bold text-[#a07735] text-base sm:text-lg">
                  <span>Total Amount</span>
                  <span>{invoice.total ? formatPrice(invoice.total) : ''}</span>
                </div>
                <div className="text-xs text-[#b0a18f] mt-2">Inclusive of all taxes</div>
              </div>

              <div className="mt-6">
                {(() => {
                  const buttonClass = countdown > 0 
                    ? 'w-full h-11 sm:h-12 font-bold rounded-xl text-base sm:text-lg mb-3 shadow-md bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'w-full h-11 sm:h-12 font-bold rounded-xl text-base sm:text-lg mb-3 shadow-md bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] text-[#98564D] hover:from-[#D4A870] hover:to-[#E6D190]'
                  
                  return (
                    <Button
                      className={buttonClass}
                      onClick={handlePayment}
                      disabled={isProcessing || countdown > 0}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#98564D]"></div>
                          <span>Processing...</span>
                        </div>
                      ) : countdown > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse">⏱️</div>
                          <span>Wait {countdown}s to retry</span>
                        </div>
                      ) : (
                        'Complete Purchase'
                      )}
                    </Button>
                  )
                })()}
                
                {countdown > 0 && (
                  <div className="w-full text-center text-sm text-red-600 mb-3">
                    Rate limited by payment gateway. Please wait before trying again.
                  </div>
                )}
                
                <div className="w-full text-center text-sm text-[#a07735] mt-6 mb-3">Secure Payment Gateway</div>

                {/* Secure Payment Note */}
                <div className="w-full flex items-center gap-2 bg-[#f5e1c3] text-[#a07735] mt-6 rounded-xl px-4 py-3 text-xs">
                  <span>🔒</span>
                  Secure & Encrypted Payment. Your payment is processed securely and your details are never stored.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}