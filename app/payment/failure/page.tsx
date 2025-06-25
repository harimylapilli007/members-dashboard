"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateMembershipStatus } from "@/actions/payment-actions"
import { useToast } from "@/hooks/use-toast"
import { initiatePayment } from "@/app/utils/payment"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


function PaymentFailureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [errorDetails, setErrorDetails] = useState<{
    message: string
    code?: string
    transactionId?: string
  }>({
    message: 'Payment failed',
  })
  const [showRetryDialog, setShowRetryDialog] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const handlePaymentFailure = async () => {
      try {
        const txnid = searchParams.get('txnid')
        const status = searchParams.get('status')
        const errorMessage = searchParams.get('error_Message')
        const errorCode = searchParams.get('error_code')
        
        if (status === 'success') {
          try {
            const sanitizedParams = sanitizeParams(searchParams)
            const queryString = sanitizedParams.toString()
            const targetUrl = queryString ? `/payment/success?${queryString}` : '/payment/success'
            router.push(targetUrl)
          } catch (navigationError) {
            console.error('Error navigating to success page:', navigationError)
          }
          return
        }

        // Set error details
        setErrorDetails({
          message: errorMessage || 'Payment was not successful',
          code: errorCode || undefined,
          transactionId: txnid || undefined,
        })

        // Show retry dialog for cancelled payments
        if (errorMessage?.toLowerCase().includes('cancelled')) {
          setShowRetryDialog(true)
          return
        }

        // Update membership status in the backend
        if (txnid) {
          try {
            const responseData = {
              txnid,
              amount: searchParams.get('amount') || '0',
              productinfo: searchParams.get('productinfo') || '',
              firstname: searchParams.get('firstname') || '',
              email: searchParams.get('email') || '',
              status: 'failure',
              hash: searchParams.get('hash') || '',
              error_Message: errorMessage || undefined,
              error_code: errorCode || undefined
            }

            const updateResult = await updateMembershipStatus(responseData)
            
            if (!updateResult.success) {
              console.error('Failed to update membership status:', updateResult.error?.message)
            }
          } catch (updateError) {
            console.error('Error updating membership status:', updateError)
          }
        }

        // Show error toast
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: errorMessage || 'Your payment could not be processed. Please try again.',
        })
      } catch (error) {
        console.error('Error handling payment failure:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again or contact support.",
        })
      }
    }

    handlePaymentFailure()
  }, [searchParams, router, toast])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      // Get the stored payment details from localStorage
      const storedPaymentDetails = localStorage.getItem('paymentDetails')
      if (!storedPaymentDetails) {
        toast({
          variant: "destructive",
          title: "Payment Details Not Found",
          description: "Unable to find previous payment details. Please try again from the membership page.",
        })
        router.push('/dashboard/memberships')
        return
      }

      const paymentDetails = JSON.parse(storedPaymentDetails)
      
      // Validate payment details
      if (!paymentDetails.amount || !paymentDetails.productinfo || !paymentDetails.txnid) {
        toast({
          variant: "destructive",
          title: "Invalid Payment Details",
          description: "The stored payment details are incomplete. Please try again from the membership page.",
        })
        router.push('/dashboard/memberships')
        return
      }

      // Initiate payment with stored details
      await initiatePayment({
        name: paymentDetails.productinfo,
        price: parseFloat(paymentDetails.amount),
        firstName: paymentDetails.firstname,
        email: paymentDetails.email,
        phone: paymentDetails.phone,
        invoiceId: paymentDetails.txnid // Reuse the same transaction ID
      })

    } catch (error) {
      console.error('Error preparing payment retry:', error)
      
      // Show appropriate error message based on the error type
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to prepare payment retry. Please try again from the membership page."

      toast({
        variant: "destructive",
        title: "Payment Retry Failed",
        description: errorMessage,
      })

      // Navigate back to memberships page after a short delay
      setTimeout(() => {
        router.push('/dashboard/memberships')
      }, 2000)
    } finally {
      setIsRetrying(false)
      setShowRetryDialog(false)
    }
  }

  const handleCancel = () => {
    setShowRetryDialog(false)
    // Update membership status and show failure message
    if (errorDetails.transactionId) {
      updateMembershipStatus({
        txnid: errorDetails.transactionId,
        amount: searchParams.get('amount') || '0',
        productinfo: searchParams.get('productinfo') || '',
        firstname: searchParams.get('firstname') || '',
        email: searchParams.get('email') || '',
        status: 'failure',
        hash: searchParams.get('hash') || '',
        error_Message: 'Payment cancelled by user',
      })
    }
    toast({
      variant: "destructive",
      title: "Payment Cancelled",
      description: "Your payment has been cancelled.",
    })
  }

  const sanitizeParams = (params: URLSearchParams) => {
    const sanitized = new URLSearchParams()
    for (const [key, value] of params.entries()) {
      // Skip invalid or empty values
      if (!value || value === 'null' || value === 'undefined' || value === '') {
        continue
      }
      // Encode the value to ensure it's URL-safe
      try {
        sanitized.append(key, encodeURIComponent(value))
      } catch (e) {
        console.warn(`Skipping invalid parameter: ${key}=${value}`)
      }
    }
    return sanitized
  }

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
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 font-['Marcellus']">Payment Failed</h1>
              <p className="text-opacity-90 font-['Marcellus'] text-sm sm:text-base">We couldn't process your payment. Please try again.</p>
            </div>
          </div>

          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6">
            <div className="bg-[#FAF9F6] rounded-xl p-6 mb-8">
              <div className="flex flex-col gap-6">
                {errorDetails.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-['Marcellus'] min-w-[120px]">Transaction ID</span>
                    <span className="font-mono text-sm">{errorDetails.transactionId}</span>
                  </div>
                )}
                {errorDetails.code && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-['Marcellus']">Error Code</span>
                    <span className="text-sm font-['Marcellus']">{errorDetails.code}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-['Marcellus'] min-w-[120px]">Error Message</span>
                  <span className="text-sm font-['Marcellus'] text-red-600">{errorDetails.message}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base sm:text-[20px] leading-[17px] text-center disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
                onClick={handleDashboardClick}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                className="w-full h-11 rounded-lg border-[#E6B980] text-[#98564D] font-['Marcellus'] font-bold text-base sm:text-[20px] leading-[17px] hover:bg-[#FAF5EB]"
                onClick={() => setShowRetryDialog(true)}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <DialogContent className="bg-[#FAF5EB] border-[#E6B980]">
          <DialogHeader>
            <DialogTitle className="font-['Marcellus'] text-[#98564D]">Retry Payment</DialogTitle>
            <DialogDescription className="font-['Marcellus']">
              Would you like to retry the payment? This will initiate a new payment attempt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isRetrying}
              className="border-[#E6B980] text-[#98564D] font-['Marcellus'] hover:bg-[#FAF5EB]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] text-[#98564D] font-['Marcellus'] font-bold hover:!bg-[#b9935a]"
            >
              {isRetrying ? 'Processing...' : 'Retry Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6">
          <div className="rounded-2xl shadow-xl bg-[#FAF5EB] w-full max-w-[550px] relative z-10 p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E6B980]"></div>
              <p className="mt-4 text-center font-['Marcellus'] text-[#98564D]">Loading payment status...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  )
} 