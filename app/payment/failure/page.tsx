"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateMembershipStatus } from "@/actions/payment-actions"
import { useToast } from "@/components/ui/use-toast"
import { initiatePayment } from "@/lib/payment-utils"
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
      if (storedPaymentDetails) {
        const paymentDetails = JSON.parse(storedPaymentDetails)
        // Re-initiate payment with stored details
        initiatePayment(paymentDetails)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to retry payment. Please try again from the membership page.",
        })
        router.push('/dashboard/memberships')
      }
    } catch (error) {
      console.error('Error retrying payment:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to retry payment. Please try again from the membership page.",
      })
      router.push('/dashboard/memberships')
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
    <>
      <div className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-center">Payment Failed</CardTitle>
            <CardDescription className="text-center">
              We couldn't process your payment. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-center">
              {errorDetails.transactionId && (
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {errorDetails.transactionId}
                </p>
              )}
              {errorDetails.code && (
                <p className="text-sm text-muted-foreground">
                  Error Code: {errorDetails.code}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {errorDetails.message}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full bg-[#a07735]/90 hover:bg-[#a07735]" 
              onClick={handleDashboardClick}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowRetryDialog(true)}
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retry Payment</DialogTitle>
            <DialogDescription>
              Would you like to retry the payment? This will initiate a new payment attempt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isRetrying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? 'Processing...' : 'Retry Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-center">Loading...</CardTitle>
            <CardDescription className="text-center">
              Please wait while we process your payment status.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  )
} 