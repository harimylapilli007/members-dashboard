"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChevronRight, MessageCircle, Info, ChevronLeft, Loader2, Calendar, CheckCircle, CheckCheckIcon, CheckCheck, CheckCircle2, Gift, Mail, User, Clock } from "lucide-react"
import Image from "next/image"
import Header from "@/app/components/Header"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"



const presetAmounts = [
  { value: "1000", label: "₹1,000" },
  { value: "2000", label: "₹2,000" },
  { value: "5000", label: "₹5,000" },
  { value: "10000", label: "₹10,000" },
  { value: "15000", label: "₹15,000" },
  { value: "25000", label: "₹25,000" }
]

// Type definition for occasions
interface Occasion {
  value: string
  label: string
  images?: Array<{id: string, url: string}>
}

// Default occasions as fallback
const defaultOccasions: Occasion[] = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "diwali", label: "Diwali Gift" },
  { value: "christmas", label: "Christmas" },
  { value: "newyear", label: "New Year" },
  { value: "mothersday", label: "Mother's Day" }
]

export default function GiftCardPage() {
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedOccasion, setSelectedOccasion] = useState("birthday")
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [message, setMessage] = useState("")
  const [selectedDesign, setSelectedDesign] = useState(0)
  const [deliveryOption, setDeliveryOption] = useState("now")
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [deliveryTime, setDeliveryTime] = useState("09:00")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [occasions, setOccasions] = useState<Occasion[]>(defaultOccasions)
  const [isLoadingOccasions, setIsLoadingOccasions] = useState(true)
  const [occasionsError, setOccasionsError] = useState<string | null>(null)
  const [selectedOccasionImages, setSelectedOccasionImages] = useState<Array<{id: string, url: string}>>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)



  const handleAmountChange = (value: string) => {
    setSelectedAmount(value)
    setCustomAmount("")
    setSubmitError(null)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount("")
    setSubmitError(null)
  }

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % selectedOccasionImages.length)
  }

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + selectedOccasionImages.length) % selectedOccasionImages.length)
  }

  const selectCard = (id: number) => {
    setSelectedDesign(id)
  }

  const handleOccasionChange = (value: string) => {
    setSelectedOccasion(value)
    // Find the selected occasion and update images
    const selectedOccasionData = occasions.find(occasion => occasion.value === value)
    if (selectedOccasionData && selectedOccasionData.images) {
      setSelectedOccasionImages(selectedOccasionData.images)
      setCurrentCardIndex(0) // Reset to first card
      setSelectedDesign(1) // Reset selection to first design
    } else {
      setSelectedOccasionImages([])
      setCurrentCardIndex(0)
      setSelectedDesign(1)
    }
  }

  const handlePreviewAndPay = async () => {
    // Validate user authentication
    const userDataStr = localStorage.getItem('userData')
    if (!userDataStr) {
      setSubmitError('Please log in to create a gift card')
      setTimeout(() => {
        window.location.href = '/signin?redirectAfterLogin=' + encodeURIComponent(window.location.href)
      }, 2000)
      return
    }

    let userData
    try {
      userData = JSON.parse(userDataStr)
    } catch (error) {
      console.error('Error parsing user data:', error)
      setSubmitError('Invalid user data. Please log in again.')
      setTimeout(() => {
        window.location.href = '/signin?redirectAfterLogin=' + encodeURIComponent(window.location.href)
      }, 2000)
      return
    }

    const guestId = userData.id
    if (!guestId) {
      setSubmitError('Please log in to create a gift card')
      setTimeout(() => {
        window.location.href = '/signin?redirectAfterLogin=' + encodeURIComponent(window.location.href)
      }, 2000)
      return
    }

    // Validate form data
    const finalAmount = selectedAmount || customAmount
    if (!finalAmount) {
      setSubmitError('Please select or enter an amount')
      return
    }

    const numericAmount = parseFloat(finalAmount)
    if (numericAmount < 100) {
      setSubmitError('Minimum gift card amount is ₹100')
      return
    }

    if (numericAmount > 100000) {
      setSubmitError('Maximum gift card amount is ₹100,000')
      return
    }

    if (!recipientName.trim()) {
      setSubmitError('Please enter recipient name')
      return
    }

    if (!recipientEmail.trim()) {
      setSubmitError('Please enter recipient email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      setSubmitError('Please enter a valid email address')
      return
    }

    // Validate delivery date if "send later" is selected
    if (deliveryOption === "later" && !deliveryDate) {
      setSubmitError('Please select a delivery date')
      return
    }

    // Check if selected date is in the future
    if (deliveryOption === "later" && deliveryDate) {
      const selectedDateTime = new Date(deliveryDate)
      const [hours, minutes] = deliveryTime.split(':').map(Number)
      selectedDateTime.setHours(hours, minutes, 0, 0)
      
      if (selectedDateTime <= new Date()) {
        setSubmitError('Please select a future date and time for delivery')
        return
      }
    }

    // Show preview modal instead of directly proceeding to payment
    setShowPreviewModal(true)
    setSubmitError(null)
  }

  const handleConfirmPayment = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    setShowPreviewModal(false)

    try {
      const userDataStr = localStorage.getItem('userData')
      const userData = JSON.parse(userDataStr!)
      const guestId = userData.id
      const finalAmount = selectedAmount || customAmount

      // Step 1: Create gift card
      const giftCardPayload = {
        amount: finalAmount,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        recipientPhone: recipientPhone.trim() || null,
        message: message.trim() || null,
        occasionId: selectedOccasion,
        deliveryOption,
        deliveryDate: deliveryOption === "later" && deliveryDate ? (() => {
          const selectedDateTime = new Date(deliveryDate)
          const [hours, minutes] = deliveryTime.split(':').map(Number)
          selectedDateTime.setHours(hours, minutes, 0, 0)
          return selectedDateTime.toISOString()
        })() : null,
        guestId
      }

      console.log('Creating gift card:', giftCardPayload)

      const giftCardResponse = await fetch('/api/giftcards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(giftCardPayload)
      })

      const giftCardData = await giftCardResponse.json()

      if (!giftCardResponse.ok) {
        throw new Error(giftCardData.error?.message || 'Failed to create gift card')
      }

      if (!giftCardData.success) {
        throw new Error(giftCardData.error?.message || 'Failed to create gift card')
      }

      console.log('Gift card created successfully:', giftCardData)

      // Step 2: Get exact amount from invoice
      let exactAmount = parseFloat(finalAmount)
      try {
        const invoiceResponse = await fetch(`/api/giftcards/invoice/${giftCardData.invoiceId}`)
        const invoiceData = await invoiceResponse.json()
        
        if (invoiceResponse.ok && invoiceData.success && invoiceData.invoice?.amount_due) {
          exactAmount = invoiceData.invoice.amount_due
          console.log('Exact amount due:', exactAmount)
        } else {
          console.warn('Using original amount, invoice fetch failed:', invoiceData.error?.message)
        }
      } catch (invoiceError) {
        console.error('Error fetching invoice details:', invoiceError)
        // Continue with original amount
      }

      // Step 3: Initiate payment using gift card payment endpoint
      const paymentPayload = {
        invoice_id: giftCardData.invoiceId,
        amount: exactAmount,
        product_info: 'Gift Card',
        customer_name: userData.name || userData.first_name || 'Guest',
        customer_email: userData.email || '',
        customer_phone: userData.phone || '',
        recipient_name: recipientName.trim(),
        recipient_email: recipientEmail.trim(),
        occasion: occasions.find(o => o.value === selectedOccasion)?.label || selectedOccasion,
        message: message.trim() || ''
      }

      console.log('Initiating payment:', paymentPayload)

      const paymentResponse = await fetch('/api/giftcards/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error?.message || 'Failed to initiate payment')
      }

      if (!paymentData.success) {
        throw new Error(paymentData.error?.message || 'Failed to initiate payment')
      }

      console.log('Payment initiated successfully:', paymentData)

      setSubmitSuccess(true)

      // Step 4: Redirect to payment gateway
      setTimeout(() => {
        // Create a form and submit it to the payment gateway
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = paymentData.payment_url

        // Add all payment data as hidden fields
        Object.entries(paymentData.payment_data).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value as string
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      }, 1500)

    } catch (error) {
      console.error('Error in gift card creation/payment flow:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check login status
  useEffect(() => {
    const userDataStr = localStorage.getItem('userData')
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr)
        setIsLoggedIn(!!userData.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsLoggedIn(false)
      }
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  // Fetch occasions from Zenoti API
  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        setIsLoadingOccasions(true)
        const response = await fetch('/api/giftcards/occasions')
        
        if (!response.ok) {
          console.error('Failed to fetch occasions:', response.statusText)
          setOccasionsError('Failed to load occasions from server')
          // Keep using default occasions
          return
        }
        
        const data = await response.json()
        console.log(data)
        
        // Transform Zenoti occasions to our format
        if (data.success && data.occasions && Array.isArray(data.occasions)) {
          const transformedOccasions = data.occasions.map((occasion: any) => ({
            value: occasion.id || occasion.name?.toLowerCase().replace(/\s+/g, '_') || 'custom',
            label: occasion.name || 'Custom Occasion',
            images: occasion.images || []
          }))
          
          if (transformedOccasions.length > 0) {
            setOccasions(transformedOccasions)
            // Set first occasion as default if current selection is not in new list
            if (!transformedOccasions.find((o: any) => o.value === selectedOccasion)) {
              setSelectedOccasion(transformedOccasions[0].value)
            }
            // Set images for the first occasion
            setSelectedOccasionImages(transformedOccasions[0].images || [])
          }
        } else if (data.occasions && Array.isArray(data.occasions)) {
          // Handle direct response format
          const transformedOccasions = data.occasions.map((occasion: any) => ({
            value: occasion.id || occasion.name?.toLowerCase().replace(/\s+/g, '_') || 'custom',
            label: occasion.name || 'Custom Occasion',
            images: occasion.images || []
          }))
          
          if (transformedOccasions.length > 0) {
            setOccasions(transformedOccasions)
            if (!transformedOccasions.find((o: any) => o.value === selectedOccasion)) {
              setSelectedOccasion(transformedOccasions[0].value)
            }
            // Set images for the first occasion
            setSelectedOccasionImages(transformedOccasions[0].images || [])
          }
        }
              } catch (error) {
          console.error('Error fetching occasions:', error)
          setOccasionsError('Failed to load occasions')
          // Keep using default occasions
        } finally {
          setIsLoadingOccasions(false)
        }
    }

    fetchOccasions()
  }, [selectedOccasion])

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
      
      <div className="flex flex-col lg:flex-row items-start max-w-[1400px] mx-auto  md:px-6">
        <main className="flex-1 md:p-8 w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
            {/* Left Section - Gift Card Configuration */}
            <div className="space-y-6 bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-white/20">
              {/* Title */}
              <div>
              <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Gift Cards</h1>
              <h2 className="text-[#454545] font-inter">Choose the perfect gift for your loved ones</h2>
              </div>

              {/* Amount Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm md:text-lg   text-[#454545] mb-2 block font-marcellus">
                    Choose from preset amounts below
                  </Label>
                  <Select value={selectedAmount} onValueChange={handleAmountChange}>
                    <SelectTrigger className="w-full bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {presetAmounts.map((amount) => (
                        <SelectItem key={amount.value} value={amount.value}>
                          {amount.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                    <Label className="text-sm md:text-lg  text-[#454545] mb-2 block font-marcellus">
                    Or enter custom amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#98564D] font-bold">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-8 bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Occasion Selection */}
              <div>
                <Label className="text-sm md:text-lg  text-[#454545] mb-4 block font-marcellus">
                  Occasion
                </Label>
                {isLoadingOccasions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[#a07735] mr-2" />
                    <span className="text-sm text-[#454545]">Loading occasions...</span>
                  </div>
                ) : occasionsError ? (
                  <div className="space-y-3">
                    <div className="text-sm text-red-600 font-inter">{occasionsError}</div>
                    <RadioGroup value={selectedOccasion} onValueChange={handleOccasionChange}>
                      <div className="grid grid-cols-2 gap-3">
                        {occasions.map((occasion) => (
                          <div key={occasion.value} className="flex items-center space-x-2 font-marcellus">
                            <RadioGroupItem value={occasion.value} id={occasion.value} className="text-[#a07735]" />
                            <Label htmlFor={occasion.value} className="text-sm md:text-md  text-[#454545]">
                              {occasion.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ) : (
                  <RadioGroup value={selectedOccasion} onValueChange={handleOccasionChange}>
                    <div className="grid grid-cols-2 gap-3">
                      {occasions.map((occasion) => (
                        <div key={occasion.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={occasion.value} id={occasion.value} className="text-[#a07735]" />
                          <Label htmlFor={occasion.value} className="text-sm md:text-md font-marcellus text-[#454545]">
                            {occasion.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Recipient Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-[#232323] font-marcellus">Recipient Details</h2>
                
                <div>
                  <Label className="text-sm md:text-lg  text-[#454545] mb-2 block font-marcellus">
                    Recipient Name
                  </Label>
                  <Input
                    value={recipientName}
                    placeholder="Enter Recipient Name"
                    onChange={(e) => {
                      setRecipientName(e.target.value)
                      setSubmitError(null)
                    }}
                    className="bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                </div>

                <div>
                  <Label className="text-sm md:text-lg  text-[#454545] mb-2 block font-marcellus">
                    Recipient Email
                  </Label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    placeholder="Enter Recipient Email"
                    onChange={(e) => {
                      setRecipientEmail(e.target.value)
                      setSubmitError(null)
                    }}
                    className="bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                </div>

                <div>
                  <Label className="text-sm md:text-lg  text-[#454545] mb-2 block font-marcellus">
                    Recipient Phone (Optional)
                  </Label>
                  <Input
                    type="tel"
                    value={recipientPhone}
                    placeholder="Enter Recipient Phone"
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Message, Design, Delivery */}
            <div className="space-y-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-white/20">
              {/* Message */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-[#98564D]" />
                  <Label className="text-sm md:text-lg  text-[#454545] font-marcellus">
                    Message (Optional)
                  </Label>
                </div>
                <Textarea
                  placeholder="Write a personal message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
              </div>

                          {/* Gift Card Design Selection */}
            <div>
              <Label className="text-sm md:text-lg  text-[#454545] mb-4 block font-marcellus">
                Select your gift Card
              </Label>
              
              {/* Carousel Container */}
              <div className="relative">
                {/* Navigation Buttons */}
                {selectedOccasionImages.length > 1 && (
                  <>
                    <button
                      onClick={prevCard}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#a07735]" />
                    </button>
                    
                    <button
                      onClick={nextCard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-[#a07735]" />
                    </button>
                  </>
                )}

                {/* Cards Container */}
                <div className="overflow-hidden rounded-xl">
                  {selectedOccasionImages.length > 0 ? (
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                    >
                      {selectedOccasionImages.map((image, index) => (
                        <div key={image.id} className="w-full flex-shrink-0">
                          <Card
                            className={`relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-105 transform rounded-lg bg-transparent ${
                              selectedDesign === index + 1
                                ? "border-[#a07735] shadow-2xl scale-105"
                                : "border-gray-200/50 hover:border-[#a07735]/50 shadow-lg"
                            }`}
                            onClick={() => selectCard(index + 1)}
                          >
                            {/* Card Background with Image */}
                            <div className="relative overflow-hidden h-64 flex items-center justify-center">
                              <Image
                                src={image.url}
                                alt={`Gift card design ${index + 1}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              
                              {/* Overlay for better text readability */}
                              <div className="absolute inset-0 bg-black/20"></div>
                              
                              {/* Card Content */}
                              {/* <CardContent className="p-6 text-center relative z-10 h-full flex flex-col justify-center">
                                <CardDescription className="text-xs font-medium mb-2 opacity-90 text-white">
                                  GIFT CARD
                                </CardDescription>
                                <CardTitle className="text-xl font-bold mb-2 leading-tight text-white">
                                  {occasions.find(o => o.value === selectedOccasion)?.label || 'Special Occasion'}
                                </CardTitle>
                                <CardDescription className="text-xs opacity-80 text-white">
                                  Perfect for any spa service
                                </CardDescription>
                              </CardContent> */}
                            </div>

                            {/* Selection Indicator */}
                            {selectedDesign === index + 1 && (
                              <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-6 h-6 text-white" fill="#a07735" />
                              </div>
                            )}
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#a07735] mx-auto mb-2" />
                        <p className="text-sm text-[#454545]">Loading gift card designs...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dots Indicator */}
                {selectedOccasionImages.length > 0 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {selectedOccasionImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCardIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentCardIndex === index
                            ? "bg-[#a07735] w-6"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

              {/* Delivery Date */}
              <div>
                <Label className="text-sm md:text-lg  text-[#454545] mb-4 block font-marcellus">
                  Delivery Date
                </Label>
                <RadioGroup value={deliveryOption} onValueChange={(value) => {
                  setDeliveryOption(value)
                  if (value === "now") {
                    setDeliveryDate(undefined)
                    setDeliveryTime("09:00")
                  }
                  setSubmitError(null)
                }}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="now" id="now" className="text-[#a07735]" />
                      <Label htmlFor="now" className="text-sm md:text-md font-marcellus text-[#454545]">
                        Send now
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="later" id="later" className="text-[#a07735]" />
                      <Label htmlFor="later" className="text-sm md:text-md font-marcellus text-[#454545]">
                        Send later
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Date Picker for Send Later */}
                {deliveryOption === "later" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="text-sm md:text-lg  text-[#454545] mb-2 block font-marcellus">
                        Select Delivery Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0",
                              !deliveryDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={deliveryDate}
                            onSelect={(date) => {
                              setDeliveryDate(date || undefined)
                              setSubmitError(null)
                            }}
                            disabled={(date) => date <= new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label className="text-sm md:text-lg  text-[#454545] mb-2 block font-marcellus">
                        Select Delivery Time
                      </Label>
                      <Input
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => {
                          setDeliveryTime(e.target.value)
                          setSubmitError(null)
                        }}
                        className="bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                    </div>

                    {deliveryDate && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800 font-marcellus">
                          <strong>Selected Delivery:</strong><br />
                          {format(deliveryDate, "PPP")} at {deliveryTime}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preview and Pay Section */}
              <div className="mt-8 text-center">
                {/* Error Message */}
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-inter">{submitError}</p>
                  </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm font-inter">Gift card created successfully! Redirecting to payment gateway...</p>
                  </div>
                )}

                <Button
                  onClick={handlePreviewAndPay}
                  disabled={isSubmitting}
                  className="relative w-full sm:w-[300px] h-[32px] sm:h-[36px] p-4 sm:p-6 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Marcellus'] font-bold text-base sm:text-[20px] leading-[17px] text-center text-[#98564D] hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Gift Card...
                    </>
                  ) : (
                    'Preview and Pay'
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#454545]">
                  <Info className="h-4 w-4 text-[#98564D]" />
                  <span className="font-inter text-sm">This gift card can be redeemed for any spa service or product</span>
                </div>
                
                {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Fill in the gift card details above</li>
                    <li>• Click "Preview and Pay" to create your gift card</li>
                    <li>• Complete payment through our secure gateway</li>
                    <li>• Gift card will be delivered to the recipient's email</li>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl bg-white w-[92%] sm:w-full mx-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto scrollbar-hide">
          <DialogHeader className="p-6 bg-white text-center border-b border-gray-200">
            <DialogTitle className="text-[#232323] text-2xl sm:text-3xl text-center font-marcellus font-bold mb-2">
              Checkout Summary
            </DialogTitle>
            <DialogDescription className="text-[#454545] font-marcellus text-base text-center">
              Complete your spa gift card purchase
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-2">
            {/* Delivery Date Section */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[#232323] font-marcellus">
                DELIVERY DATE *
              </h2>
              <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#a07735]" />
                  <span className="text-[#454545] font-inter">
                    {deliveryOption === "now" 
                      ? "Send immediately" 
                      : deliveryDate 
                        ? `${format(deliveryDate, "dd MMM yyyy")} at ${deliveryTime}`
                        : "Select delivery date"
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="">
              <h2 className="text-lg font-semibold text-[#232323] font-marcellus">
                SUMMARY
              </h2>
              
              {/* Gift Card Item */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-[#a07735]" />
                  <div>
                    <p className="font-marcellus font-semibold text-[#232323]">
                      Gift Card x1
                    </p>
                    <p className="text-sm text-[#454545] font-inter">
                      {occasions.find(o => o.value === selectedOccasion)?.label || selectedOccasion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-marcellus font-semibold text-[#232323]">
                    ₹{(selectedAmount || customAmount)?.toLocaleString()}.00
                  </span>
                  <button className="text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#454545] font-inter">Sub Total</span>
                  <span className="font-marcellus font-semibold text-[#232323]">
                    ₹{(selectedAmount || customAmount)?.toLocaleString()}.00
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#454545] font-inter">Tax</span>
                  <span className="font-marcellus font-semibold text-[#232323]">
                    ₹{Math.round(parseFloat(selectedAmount || customAmount || '0') * 0.18).toLocaleString()}.00
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-marcellus font-bold text-[#232323]">Total</span>
                  <span className="text-lg font-marcellus font-bold text-[#232323]">
                    ₹{(parseFloat(selectedAmount || customAmount || '0') * 1.18).toLocaleString()}.00
                  </span>
                </div>
                <p className="text-xs text-[#454545] font-inter text-center">
                  Inclusive of all taxes
                </p>
              </div>
            </div>

            {/* Recipient Details (Collapsed) */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-[#a07735]" />
                <div>
                  <p className="font-marcellus font-semibold text-[#232323] text-sm">
                    Recipient: {recipientName}
                  </p>
                  <p className="text-xs text-[#454545] font-inter">
                    {recipientEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white border-t border-gray-200">
            <div className="w-full space-y-4">
              {/* Preview and Buy Button */}
              <Button 
                onClick={handleConfirmPayment} 
                disabled={isSubmitting}
                className="w-full h-[32px]  p-4 sm:p-6 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Marcellus'] font-bold text-base sm:text-[20px] leading-[17px] text-center text-[#98564D] hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 mr-2" />
                    Preview and Buy
                  </>
                )}
              </Button>
              
              {/* Security Message */}
              <div className="flex items-center justify-center gap-2 text-sm text-[#454545] font-inter">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Payment Protected</span>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
