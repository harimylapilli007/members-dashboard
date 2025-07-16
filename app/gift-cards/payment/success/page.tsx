"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface GiftCardStatus {
  status: string;
  amount: string;
  giftCardId: string;
  paymentId: string;
  recipientName?: string;
  recipientEmail?: string;
  occasion?: string;
  message?: string;
}

function GiftCardPaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)
  const [giftCardStatus, setGiftCardStatus] = useState<GiftCardStatus | null>(null)
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
          salt: process.env.PAYU_SALT || '',
          payment_method: searchParams.get('payment_method') || 'UPI',
          mihpayid: searchParams.get('mihpayid') || '',
          bank_ref_num: searchParams.get('bank_ref_num') || '',
          bankcode: searchParams.get('bankcode') || '',
          mode: searchParams.get('mode') || '',
          // Gift card specific parameters
          recipient_name: searchParams.get('recipient_name') || '',
          recipient_email: searchParams.get('recipient_email') || '',
          occasion: searchParams.get('occasion') || '',
          message: searchParams.get('message') || '',
          gift_card_id: searchParams.get('gift_card_id') || ''
        }

        // Set payment details
        setPaymentDetails(responseData)

        // Set basic gift card status
        setGiftCardStatus({
          status: 'success',
          amount: responseData.amount,
          giftCardId: responseData.gift_card_id || responseData.txnid,
          paymentId: responseData.mihpayid || `payu_${Date.now()}`,
          recipientName: responseData.recipient_name,
          recipientEmail: responseData.recipient_email,
          occasion: responseData.occasion,
          message: responseData.message
        })

        // Show success message
        toast({
          title: "Gift Card Payment Successful",
          description: "Your gift card has been created successfully.",
        });

      } catch (error) {
        console.error('Error processing gift card payment details:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while processing your gift card payment details. Please contact support.",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, router, toast])

  // Get actual data from payment response
  const giftCardType = paymentDetails?.productinfo || "Gift Card"
  const paymentMethod = paymentDetails?.payment_method || paymentDetails?.bankcode || "UPI"
  const customerName = paymentDetails?.firstname || 'Customer'
  const customerEmail = paymentDetails?.email || ''
  const bankRefNum = paymentDetails?.bank_ref_num || ''
  const bankCode = paymentDetails?.bankcode || ''

  const handleDashboardClick = () => {
    try {
      if (typeof window !== 'undefined') {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          router.push('/gift-cards/my-gift-cards')
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

  const handleBuyAnotherClick = () => {
    router.push('/gift-cards')
  }

  if (isVerifying) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-center">Verifying your gift card payment...</p>
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
              <div className="bg-[#A07735] rounded-full p-4 shadow mb-2 border border-white">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="white"/>
                </svg>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold mb-1 font-['Marcellus']">
                <span className="text-5xl">🎁</span> Gift Card Created Successfully!
              </h1>
              <p className="text-opacity-90 font-['Marcellus'] text-sm sm:text-base">
                Your gift card is ready to be sent to {giftCardStatus?.recipientName || 'the recipient'}.
              </p>
            </div>
          </div>
          
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6">
            {/* Gift Card Details */}
            <div className="bg-[#FAF9F6] rounded-xl p-4 mb-4">
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-xs text-muted-foreground font-['Marcellus']">Gift Card Type</span>
                <span className="font-medium text-base font-['Marcellus']">{giftCardType}</span>
              </div>
              {giftCardStatus?.occasion && (
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-xs text-muted-foreground font-['Marcellus']">Occasion</span>
                  <span className="font-medium text-base font-['Marcellus']">{giftCardStatus.occasion}</span>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="bg-[#FAF9F6] rounded-xl p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Amount Paid</span>
                    <span className="font-semibold text-green-700 text-xl">₹{paymentDetails?.amount || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Payment Method</span>
                    <span className="text-base font-['Marcellus']">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Transaction ID</span>
                    <span className="font-mono text-sm text-right">{paymentDetails?.txnid || '—'}</span>
                  </div>
                  {giftCardStatus?.giftCardId && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-['Marcellus']">Gift Card ID</span>
                      <span className="font-mono text-sm">{giftCardStatus.giftCardId}</span>
                    </div>
                  )}
                  {bankRefNum && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-['Marcellus']">Bank Reference</span>
                      <span className="font-mono text-base">{bankRefNum}</span>
                    </div>
                  )}
                  {customerEmail && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-['Marcellus']">Customer Email</span>
                      <span className="text-base">{customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            {giftCardStatus?.recipientName && (
              <div className="bg-[#FAF9F6] rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-base mb-4 font-['Marcellus']">Recipient Information</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-['Marcellus']">Recipient Name</span>
                    <span className="text-base font-['Marcellus']">{giftCardStatus.recipientName}</span>
                  </div>
                  {giftCardStatus.recipientEmail && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-['Marcellus']">Recipient Email</span>
                      <span className="text-base">{giftCardStatus.recipientEmail}</span>
                    </div>
                  )}
                  {giftCardStatus.message && (
                    <div className="flex flex-col gap-2">
                      <span className="text-muted-foreground font-['Marcellus']">Personal Message</span>
                      <span className="text-base italic bg-white p-3 rounded-lg border">
                        "{giftCardStatus.message}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
           
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base sm:text-[20px] leading-[17px] text-center disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
                onClick={handleDashboardClick}
              >
                View My Gift Cards
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-11 rounded-lg border-[#A07735] text-[#A07735] font-['Marcellus'] font-bold text-base hover:bg-[#A07735] hover:text-white transition-all duration-200"
                onClick={handleBuyAnotherClick}
              >
                Buy Another Gift Card
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GiftCardPaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-center">Loading gift card details...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <GiftCardPaymentSuccessContent />
    </Suspense>
  )
} 