"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

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

  useEffect(() => {
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

      // Show error toast
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: errorMessage || 'Your payment could not be processed. Please try again.',
      })
    } catch (error) {
      console.error('Error handling payment status:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again or contact support.",
      })
    }
  }, [searchParams, router, toast])

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
        const storedParams = localStorage.getItem('dashboardParams')
        let params: URLSearchParams
        
        if (storedParams) {
          try {
            params = new URLSearchParams(storedParams)
          } catch (e) {
            console.warn('Invalid stored parameters, using current params')
            params = new URLSearchParams()
          }
        } else {
          params = new URLSearchParams()
        }

        // Filter out payment-related parameters and sanitize
        const sanitizedParams = new URLSearchParams()
        for (const [key, value] of params.entries()) {
          if (key === 'txnid' || key === 'status' || key === 'error_Message') {
            continue
          }
          try {
            if (value && value !== 'null' && value !== 'undefined') {
              sanitizedParams.append(key, encodeURIComponent(value))
            }
          } catch (e) {
            console.warn(`Skipping invalid parameter: ${key}=${value}`)
          }
        }

        const queryString = sanitizedParams.toString()
        const targetUrl = queryString ? `/dashboard/classic?${queryString}` : '/dashboard/classic'
        router.push(targetUrl)
      } else {
        router.push('/dashboard/classic')
      }
    } catch (error) {
      console.error('Error navigating to dashboard:', error)
      router.push('/dashboard/classic')
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
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
            className="w-full" 
            onClick={handleDashboardClick}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.back()}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen py-12">
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