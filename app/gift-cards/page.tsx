"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChevronRight, MessageCircle, Info, ChevronLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Header from "@/app/components/Header"



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
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [occasions, setOccasions] = useState<Occasion[]>(defaultOccasions)
  const [isLoadingOccasions, setIsLoadingOccasions] = useState(true)
  const [occasionsError, setOccasionsError] = useState<string | null>(null)
  const [selectedOccasionImages, setSelectedOccasionImages] = useState<Array<{id: string, url: string}>>([])



  const handleAmountChange = (value: string) => {
    setSelectedAmount(value)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount("")
  }

  const handlePreviewAndPay = () => {
    // Handle preview and payment logic
    console.log("Preview and Pay clicked")
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
      
      <div className="flex flex-col lg:flex-row items-start max-w-[1400px] mx-auto px-4 md:px-6">
        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="mb-6 md:mb-8 max-w-[1100px] mx-auto">
            <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Gift Cards</h1>
            <h2 className="text-[#454545] font-inter">Choose the perfect gift for your loved ones</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
            {/* Left Section - Gift Card Configuration */}
            <div className="space-y-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-white/20">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-semibold text-[#232323] mb-2 font-marcellus">
                  I Would Like to Gift
                </h1>
                <p className="text-[#454545] font-inter">
                  Choose the perfect gift amount for a relaxing spa experience
                </p>
              </div>

              {/* Amount Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#454545] mb-2 block font-inter">
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
                  <Label className="text-sm font-medium text-[#454545] mb-2 block font-inter">
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
                <Label className="text-sm font-medium text-[#454545] mb-4 block font-inter">
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
                          <div key={occasion.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={occasion.value} id={occasion.value} className="text-[#a07735]" />
                            <Label htmlFor={occasion.value} className="text-sm font-inter text-[#454545]">
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
                          <Label htmlFor={occasion.value} className="text-sm font-inter text-[#454545]">
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
                <h3 className="text-lg font-medium text-[#232323] font-marcellus">Recipient Details</h3>
                
                <div>
                  <Label className="text-sm font-medium text-[#454545] mb-2 block font-inter">
                    Recipient Name
                  </Label>
                  <Input
                    value={recipientName}
                    placeholder="Enter Recipient Name"
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#454545] mb-2 block font-inter">
                    Recipient Email
                  </Label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    placeholder="Enter Recipient Email"
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="bg-white/70 border-[#a07735]/30 focus:border-[#a07735] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#454545] mb-2 block font-inter">
                    Recipient Phone Number
                  </Label>
                  <Input
                    value={recipientPhone}
                    placeholder="Enter Recipient Phone Number"
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
                  <Label className="text-sm font-medium text-[#454545] font-inter">
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
              <Label className="text-sm font-medium text-[#454545] mb-4 block font-inter">
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
                <div className="overflow-hidden rounded-xl p-4">
                  {selectedOccasionImages.length > 0 ? (
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                    >
                      {selectedOccasionImages.map((image, index) => (
                        <div key={image.id} className="w-full flex-shrink-0 px-8">
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
                              <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-[#a07735] to-[#98564D] rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-4 h-4 bg-white rounded-full"></div>
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
                <Label className="text-sm font-medium text-[#454545] mb-4 block font-inter">
                  Delivery Date (Required)
                </Label>
                <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="now" id="now" className="text-[#a07735]" />
                      <Label htmlFor="now" className="text-sm font-inter text-[#454545]">
                        Send now
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="later" id="later" className="text-[#a07735]" />
                      <Label htmlFor="later" className="text-sm font-inter text-[#454545]">
                        Send later
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Preview and Pay Section */}
              <div className="mt-8 text-center">
                <Button
                  onClick={handlePreviewAndPay}
                  className="relative w-full sm:w-[300px] h-[32px] sm:h-[36px] p-4 sm:p-6 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] rounded-xl font-['Marcellus'] font-bold text-base sm:text-[20px] leading-[17px] text-center text-[#98564D] hover:scale-105 transition-transform duration-300"
                >
                  Preview and Pay
                </Button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#454545]">
                  <Info className="h-4 w-4 text-[#98564D]" />
                  <span className="font-inter text-sm">This gift card can be redeemed for any spa service or product</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 