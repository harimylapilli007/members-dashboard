"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyPayUResponse } from "@/lib/payment-utils"
import { updateMembershipStatus } from "@/actions/payment-actions"
import { useToast } from "@/components/ui/use-toast"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)

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
          salt: '0Rd0lVQEvO' // Your PayU salt
        }

        // Verify the payment response
        const isValid = verifyPayUResponse(responseData)
        
        if (!isValid) {
          toast({
            variant: "destructive",
            title: "Payment Verification Failed",
            description: "The payment response could not be verified. Please contact support.",
          })
          router.push('/payment/failure')
          return
        }

        // If status is not success or there's an error message, redirect to failure page
        if (responseData.status !== 'success') {
          const params = new URLSearchParams()
          searchParams.forEach((value, key) => {
            if (value) params.append(key, value)
          })
          router.push(`/payment/failure?${params.toString()}`)
          return
        }

        // Update membership status in the backend
        const updateResult = await updateMembershipStatus(responseData)
        
        if (!updateResult.success) {
          toast({
            variant: "destructive",
            title: "Error Updating Membership",
            description: updateResult.error?.message || "Failed to update membership status. Please contact support.",
          })
          return
        }

        // Payment is successful and verified
        toast({
          title: "Payment Successful",
          description: "Your payment has been verified and processed successfully.",
        })
      } catch (error) {
        console.error('Error verifying payment:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while verifying your payment. Please contact support.",
        })
        router.push('/payment/failure')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, router, toast])

  const handleDashboardClick = () => {
    try {
      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        if (value) params.append(key, value)
      })
      router.push(`/dashboard/classic?${params.toString()}`)
    } catch (error) {
      console.error('Error navigating to dashboard:', error)
      router.push('/dashboard/classic')
    }
  }

  if (isVerifying) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
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
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for your payment. Your membership has been activated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Transaction ID: {searchParams.get('txnid')}
            </p>
            <p className="text-sm text-muted-foreground">
              Amount: ₹{searchParams.get('amount')}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleDashboardClick}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
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