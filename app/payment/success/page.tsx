"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyPayUResponse } from "@/lib/payment-utils"
import { useToast } from "@/components/ui/use-toast"

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
          salt: '0Rd0lVQEvO'
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

        // Set invoice status
        setInvoiceStatus({
          status: 'success',
          amount: responseData.amount,
          invoiceId: responseData.txnid,
          paymentId: searchParams.get('mihpayid') || `payu_${Date.now()}`
        })

        // Show success message
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });

        // Wait for 5 seconds before redirecting
        setTimeout(() => {
          handleDashboardClick()
        }, 5000);

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
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for your payment. Your invoice has been processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-center">
            {invoiceStatus && (
              <>
                <p className="text-sm text-muted-foreground">
                  Invoice ID: {invoiceStatus.invoiceId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment ID: {invoiceStatus.paymentId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: ₹{invoiceStatus.amount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {invoiceStatus.status.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Redirecting to dashboard in 5 seconds...
                </p>
              </>
            )}
          </div>
        </CardContent>
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