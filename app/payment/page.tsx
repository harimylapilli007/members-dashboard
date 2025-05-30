"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getInvoiceDetails } from "@/actions/invoice-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      const invoiceId = searchParams.get('invoice_id')
      
      if (!invoiceId) {
        setError("No invoice ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await getInvoiceDetails(invoiceId)
        
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to fetch invoice details")
        }

        setInvoice(response.data)
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
  }, [searchParams, toast])

  const handlePayment = async () => {
    if (!invoice) return

    try {
      // Initialize PayU payment
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: invoice.total_amount,
          product_info: `Invoice ${invoice.receipt_no}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const data = await response.json()
      
      // Redirect to PayU payment page
      window.location.href = data.payment_url
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>Invoice not found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Invoice #{invoice.receipt_no}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>₹{invoice.total_amount}</span>
            </div>
            <Button 
              className="w-full" 
              onClick={handlePayment}
            >
              Proceed to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 