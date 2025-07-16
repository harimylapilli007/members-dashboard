"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function GiftCardPaymentFailureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [errorDetails, setErrorDetails] = useState<{
    message: string
    code?: string
    transactionId?: string
    giftCardId?: string
  }>({
    message: 'Gift card payment failed',
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
        const giftCardId = searchParams.get('gift_card_id')
        
        if (status === 'success') {
          try {
            const sanitizedParams = sanitizeParams(searchParams)
            const queryString = sanitizedParams.toString()
            const targetUrl = queryString ? `/gift-cards/payment/success?${queryString}` : '/gift-cards/payment/success'
            router.push(targetUrl)
          } catch (navigationError) {
            console.error('Error navigating to success page:', navigationError)
          }
          return
        }

        // Set error details
        setErrorDetails({
          message: errorMessage || 'Gift card payment was not successful',
          code: errorCode || undefined,
          transactionId: txnid || undefined,
          giftCardId: giftCardId || undefined,
        })

        // Show retry dialog for cancelled payments
        if (errorMessage?.toLowerCase().includes('cancelled')) {
          setShowRetryDialog(true)
          return
        }

        // Show error toast
        toast({
          variant: "destructive",
          title: "Gift Card Payment Failed",
          description: errorMessage || 'Your gift card payment could not be processed. Please try again.',
        })
      } catch (error) {
        console.error('Error handling gift card payment failure:', error)
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
      // Get the stored gift card details from localStorage
      const storedGiftCardDetails = localStorage.getItem('giftCardDetails')
      if (!storedGiftCardDetails) {
        toast({
          variant: "destructive",
          title: "Gift Card Details Not Found",
          description: "Unable to find previous gift card details. Please try again from the gift cards page.",
        })
        router.push('/gift-cards')
        return
      }

      const giftCardDetails = JSON.parse(storedGiftCardDetails)
      
      // Validate gift card details
      if (!giftCardDetails.amount || !giftCardDetails.product_info || !giftCardDetails.gift_card_id) {
        toast({
          variant: "destructive",
          title: "Invalid Gift Card Details",
          description: "The stored gift card details are incomplete. Please try again from the gift cards page.",
        })
        router.push('/gift-cards')
        return
      }

      // Navigate back to gift cards page to retry
      router.push('/gift-cards')

    } catch (error) {
      console.error('Error preparing gift card payment retry:', error)
      
      // Show appropriate error message based on the error type
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to prepare gift card payment retry. Please try again from the gift cards page."

      toast({
        variant: "destructive",
        title: "Gift Card Payment Retry Failed",
        description: errorMessage,
      })

      // Navigate back to gift cards page after a short delay
      setTimeout(() => {
        router.push('/gift-cards')
      }, 2000)
    } finally {
      setIsRetrying(false)
      setShowRetryDialog(false)
    }
  }

  const handleCancel = () => {
    setShowRetryDialog(false)
    toast({
      variant: "destructive",
      title: "Gift Card Payment Cancelled",
      description: "Your gift card payment has been cancelled.",
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

  const handleGiftCardsClick = () => {
    try {
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          router.push('/gift-cards')
        } else {
          router.push('/signin')
        }
      } else {
        router.push('/signin')
      }
    } catch (error) {
      console.error('Error navigating to gift cards:', error)
      router.push('/signin')
    }
  }

  const handleHomeClick = () => {
    router.push('/')
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
              <div className="bg-red-500 rounded-full p-4 shadow mb-2 border border-white">
                <XCircle className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold mb-1 font-['Marcellus'] text-red-600">
                Gift Card Payment Failed
              </h1>
              <p className="text-opacity-90 font-['Marcellus'] text-sm sm:text-base">
                We couldn't process your gift card payment. Please try again.
              </p>
            </div>
          </div>
          
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6">
            {/* Error Details */}
            <div className="bg-[#FAF9F6] rounded-xl p-6 mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-['Marcellus']">Error Message</span>
                  <span className="text-red-600 text-sm text-right max-w-[200px]">
                    {errorDetails.message}
                  </span>
                </div>
                {errorDetails.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Transaction ID</span>
                    <span className="font-mono text-sm">{errorDetails.transactionId}</span>
                  </div>
                )}
                {errorDetails.giftCardId && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Gift Card ID</span>
                    <span className="font-mono text-sm">{errorDetails.giftCardId}</span>
                  </div>
                )}
                {errorDetails.code && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Error Code</span>
                    <span className="font-mono text-sm">{errorDetails.code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base sm:text-[20px] leading-[17px] text-center disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
                onClick={handleGiftCardsClick}
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-11 rounded-lg border-[#A07735] text-[#A07735] font-['Marcellus'] font-bold text-base hover:bg-[#A07735] hover:text-white transition-all duration-200"
                onClick={handleHomeClick}
              >
                Go to Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground font-['Marcellus']">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Retry Dialog */}
      <Dialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Marcellus']">Retry Gift Card Payment?</DialogTitle>
            <DialogDescription className="font-['Marcellus']">
              Your previous gift card payment was cancelled. Would you like to try again?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="font-['Marcellus']"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="font-['Marcellus']"
            >
              {isRetrying ? 'Preparing...' : 'Try Again'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function GiftCardPaymentFailure() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen py-12">
        <div className="rounded-2xl shadow-xl bg-[#FAF5EB] w-full max-w-md p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-center font-['Marcellus']">Loading payment details...</p>
          </div>
        </div>
      </div>
    }>
      <GiftCardPaymentFailureContent />
    </Suspense>
  )
} 