"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Trophy } from "lucide-react"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { verifyPayUResponse } from "@/lib/payment-utils"
import { useToast } from "@/hooks/use-toast"

interface InvoiceStatus {
  status: string;
  amount: string;
  invoiceId: string;
  paymentId: string;
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const responseData = {
          txnid: searchParams.get('txnid') || '',
          amount: searchParams.get('amount') || '',
          productinfo: searchParams.get('productinfo') || '',
          firstname: searchParams.get('firstname') || '',
          email: searchParams.get('email') || '',
          status: searchParams.get('status') || '',
          hash: searchParams.get('hash') || '',
          salt: '0Rd0lVQEvO',
          payment_method: searchParams.get('payment_method') || 'UPI',
          mihpayid: searchParams.get('mihpayid') || '',
          bank_ref_num: searchParams.get('bank_ref_num') || '',
          bankcode: searchParams.get('bankcode') || '',
          mode: searchParams.get('mode') || ''
        }

        // Set payment details
        setPaymentDetails(responseData)

        // Set invoice status
        setInvoiceStatus({
          status: 'success',
          amount: responseData.amount,
          invoiceId: responseData.txnid,
          paymentId: responseData.mihpayid || `payu_${Date.now()}`
        })

        // Show success message
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });

      } catch (error) {
        console.error('Error processing payment details:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while processing your payment details. Please contact support.",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, router, toast])

  // Get actual data from payment response
  const planName = paymentDetails?.productinfo || "Wellness Plus Membership"
  const duration = "1 Year" // This should come from your backend/API
  
  const paymentMethod = paymentDetails?.payment_method || paymentDetails?.bankcode || "UPI"
  const userName = paymentDetails?.firstname || 'Member'
  const email = paymentDetails?.email || ''
  const bankRefNum = paymentDetails?.bank_ref_num || ''
  const bankCode = paymentDetails?.bankcode || ''

  const handleDashboardClick = () => {
    try {
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          router.push('/dashboard/memberships')
        } else {
          router.push('/signin')
        }
      } else {
        router.push('/signin')
      }
    } catch (error) {
      console.error('Error navigating to dashboard:', error)
      router.push('/signin')
    }
  }

  if (isVerifying) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-center">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6">
        <div className="rounded-2xl shadow-xl bg-[#FAF5EB] w-full max-w-[550px] relative z-10">
          {/* Header */}
          <div className="rounded-t-2xl px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-[#A07735]  rounded-full p-4 shadow mb-2 border border-white">
              <svg width="50" height="50" viewBox="0 0 35 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.0938 0H10.9688C9.41602 0 8.15039 1.27734 8.20898 2.82422C8.2207 3.13477 8.23242 3.44531 8.25 3.75H2.0625C1.2832 3.75 0.65625 4.37695 0.65625 5.15625C0.65625 10.582 2.61914 14.3555 5.25586 16.916C7.85156 19.4414 11.0156 20.7129 13.3477 21.3574C14.7188 21.7383 15.6562 22.8809 15.6562 24.0293C15.6562 25.2539 14.6602 26.25 13.4355 26.25H11.9062C10.8691 26.25 10.0312 27.0879 10.0312 28.125C10.0312 29.1621 10.8691 30 11.9062 30H23.1562C24.1934 30 25.0312 29.1621 25.0312 28.125C25.0312 27.0879 24.1934 26.25 23.1562 26.25H21.627C20.4023 26.25 19.4062 25.2539 19.4062 24.0293C19.4062 22.8809 20.3379 21.7324 21.7148 21.3574C24.0527 20.7129 27.2168 19.4414 29.8125 16.916C32.4434 14.3555 34.4062 10.582 34.4062 5.15625C34.4062 4.37695 33.7793 3.75 33 3.75H26.8125C26.8301 3.44531 26.8418 3.14062 26.8535 2.82422C26.9121 1.27734 25.6465 0 24.0938 0ZM3.52148 6.5625H8.4668C9 11.8418 10.1777 15.3691 11.5078 17.7305C10.0488 17.0859 8.53125 16.1777 7.21875 14.9004C5.34375 13.0781 3.82031 10.4473 3.52734 6.5625H3.52148ZM27.8496 14.9004C26.5371 16.1777 25.0195 17.0859 23.5605 17.7305C24.8906 15.3691 26.0684 11.8418 26.6016 6.5625H31.5469C31.248 10.4473 29.7246 13.0781 27.8555 14.9004H27.8496Z" fill="white"/>
              </svg>

              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold mb-1 font-['Marcellus']"> <span className="text-5xl"> 🎉</span>Congratulations, {userName.toLowerCase()}!</h1>
              <p className=" text-opacity-90 font-['Marcellus'] text-sm sm:text-base">Your {planName} is now active.</p>
            </div>
          </div>
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6">
            <div className="bg-[#FAF9F6] rounded-xl p-4 mb-4">
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-xs text-muted-foreground font-['Marcellus']">Plan</span>
                <span className="font-medium text-base font-['Marcellus']">{planName}</span>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-xs text-muted-foreground font-['Marcellus']">Duration</span>
                <span className="font-medium text-base font-['Marcellus']">{duration}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              <div className="bg-[#FAF9F6] rounded-xl p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className=" text-muted-foreground font-['Marcellus']">Amount Paid</span>
                    <span className="font-semibold text-green-700 text-xl">₹{paymentDetails?.amount || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className=" text-muted-foreground font-['Marcellus']">Payment Method</span>
                    <span className="text-base font-['Marcellus']">{paymentMethod}</span>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <span className=" text-muted-foreground font-['Marcellus']">Transaction ID</span>
                    <span className="font-mono text-base">{paymentDetails?.txnid || '—'}</span>
                  </div> */}
                  {bankRefNum && (
                    <div className="flex justify-between items-center">
                      <span className=" text-muted-foreground font-['Marcellus']">Bank Reference</span>
                      <span className="font-mono text-base">{bankRefNum}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex justify-between items-center">
                      <span className=" text-muted-foreground font-['Marcellus']">Email</span>
                      <span className="text-base">{email}</span>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
           
            <Button
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base sm:text-[20px] leading-[17px] text-center disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
              onClick={handleDashboardClick}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-center">Loading payment details...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
} 