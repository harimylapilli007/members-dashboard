"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Header from "../../../components/Header"
import Image from "next/image"

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

// Gift card design configurations
const giftCardDesigns = {
  birthday: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)",
    accentColor: "#ff4757",
    textColor: "#2d3436",
    icon: "🎂",
    title: "Happy Birthday!",
    subtitle: "Wishing you a day filled with joy and relaxation"
  },
  anniversary: {
    background: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
    accentColor: "#5f3dc4",
    textColor: "#ffffff",
    icon: "💕",
    title: "Happy Anniversary!",
    subtitle: "Celebrating your special day with love"
  },
  diwali: {
    background: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
    accentColor: "#d63031",
    textColor: "#2d3436",
    icon: "🪔",
    title: "Happy Diwali!",
    subtitle: "May your life be as bright as the festival of lights"
  },
  christmas: {
    background: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
    accentColor: "#00a085",
    textColor: "#ffffff",
    icon: "🎄",
    title: "Merry Christmas!",
    subtitle: "Wishing you peace, joy, and relaxation"
  },
  newyear: {
    background: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
    accentColor: "#0652dd",
    textColor: "#ffffff",
    icon: "🎆",
    title: "Happy New Year!",
    subtitle: "New beginnings, new wellness journey"
  },
  mothersday: {
    background: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
    accentColor: "#c44569",
    textColor: "#ffffff",
    icon: "🌹",
    title: "Happy Mother's Day!",
    subtitle: "Thank you for all the love and care"
  },
  default: {
    background: "linear-gradient(135deg, #a07735 0%, #8B4513 100%)",
    accentColor: "#8B4513",
    textColor: "#ffffff",
    icon: "🎁",
    title: "Gift Card",
    subtitle: "A special gift for someone special"
  }
}

function GiftCardPaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)
  const [giftCardStatus, setGiftCardStatus] = useState<GiftCardStatus | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [userFirstName, setUserFirstName] = useState<string>('')

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          const userData = JSON.parse(storedUserData)
          setUserFirstName(userData.first_name || userData.firstName || '')
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
      }
    }
  }, [])

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

  // Get gift card design based on occasion
  const getGiftCardDesign = (occasion?: string) => {
    if (!occasion) return giftCardDesigns.default
    
    const occasionKey = occasion.toLowerCase().replace(/\s+/g, '')
    
    // Try exact match first
    if (giftCardDesigns[occasionKey as keyof typeof giftCardDesigns]) {
      return giftCardDesigns[occasionKey as keyof typeof giftCardDesigns]
    }
    
    // Try partial matches
    if (occasionKey.includes('birthday')) return giftCardDesigns.birthday
    if (occasionKey.includes('anniversary')) return giftCardDesigns.anniversary
    if (occasionKey.includes('diwali')) return giftCardDesigns.diwali
    if (occasionKey.includes('christmas')) return giftCardDesigns.christmas
    if (occasionKey.includes('newyear') || occasionKey.includes('new_year')) return giftCardDesigns.newyear
    if (occasionKey.includes('mothersday') || occasionKey.includes('mothers_day')) return giftCardDesigns.mothersday
    
    return giftCardDesigns.default
  }

  const design = getGiftCardDesign(giftCardStatus?.occasion)

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

  const handleDownloadGiftCard = async () => {
    setIsDownloading(true)
    try {
      // Try canvas method first
      await downloadAsCanvas()
    } catch (error) {
      console.error('Canvas download failed, trying HTML method:', error)
      try {
        // Fallback to HTML method
        await downloadAsHTML()
      } catch (htmlError) {
        console.error('HTML download also failed:', htmlError)
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "Failed to download gift card. Please try again or contact support.",
        })
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadAsCanvas = async () => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element to render the gift card
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        // Set canvas size
        canvas.width = 800
        canvas.height = 500

        // Create gradient background - improved color parsing
        const gradient = ctx.createLinearGradient(0, 0, 800, 500)
        
        // Extract colors from the design background
        let color1 = '#a07735'
        let color2 = '#8B4513'
        
        if (design.background.includes('linear-gradient')) {
          const colorMatch = design.background.match(/#[a-fA-F0-9]{6}/g)
          if (colorMatch && colorMatch.length >= 2) {
            color1 = colorMatch[0]
            color2 = colorMatch[1]
          }
        }
        
        gradient.addColorStop(0, color1)
        gradient.addColorStop(1, color2)
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 800, 500)

        // Add decorative elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.beginPath()
        ctx.arc(100, 100, 50, 0, 2 * Math.PI)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(700, 150, 30, 0, 2 * Math.PI)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(150, 400, 25, 0, 2 * Math.PI)
        ctx.fill()

        // Add main content
        ctx.fillStyle = design.textColor
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(design.icon, 400, 120)

        ctx.font = 'bold 36px Arial'
        ctx.fillText(design.title, 400, 180)

        ctx.font = '18px Arial'
        ctx.fillText(design.subtitle, 400, 220)

        // Add amount
        ctx.font = 'bold 48px Arial'
        ctx.fillText(`₹${paymentDetails?.amount || '1,000'}`, 400, 280)

        // Add recipient name
        ctx.font = '24px Arial'
        ctx.fillText(`To: ${giftCardStatus?.recipientName || 'Recipient'}`, 400, 320)

        // Add message
        if (giftCardStatus?.message) {
          ctx.font = '16px Arial'
          const words = giftCardStatus.message.split(' ')
          let line = ''
          let y = 360
          for (let word of words) {
            const testLine = line + word + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > 600) {
              ctx.fillText(line, 400, y)
              line = word + ' '
              y += 25
            } else {
              line = testLine
            }
          }
          ctx.fillText(line, 400, y)
        }

        // Add footer
        ctx.font = '14px Arial'
        ctx.fillText('Ode Spa - Your Wellness Journey', 400, 460)
        ctx.fillText('Valid for 1 year from purchase date', 400, 480)

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            try {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `gift-card-${giftCardStatus?.giftCardId || Date.now()}.png`
              a.style.display = 'none'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              
              toast({
                title: "Gift Card Downloaded",
                description: "Your gift card has been downloaded successfully.",
              })
              resolve(true)
            } catch (downloadError) {
              console.error('Error in download process:', downloadError)
              reject(downloadError)
            }
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        }, 'image/png', 0.9)

      } catch (error) {
        reject(error)
      }
    })
  }

  const downloadAsHTML = async () => {
    // Create HTML content for the gift card
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ode Spa Gift Card</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .gift-card {
            width: 800px;
            height: 500px;
            margin: 0 auto;
            border-radius: 15px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          .gift-card-content {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 40px;
            color: ${design.textColor};
          }
          .amount {
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
            background: rgba(255,255,255,0.2);
            padding: 20px 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          .title {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 18px;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .recipient {
            font-size: 24px;
            margin: 15px 0;
          }
          .message {
            font-size: 16px;
            font-style: italic;
            max-width: 600px;
            margin: 15px 0;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 14px;
            opacity: 0.8;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="gift-card" style="background: ${design.background}">
          <div class="gift-card-content">
            <div class="icon">${design.icon}</div>
            <div class="title">${design.title}</div>
            <div class="subtitle">${design.subtitle}</div>
            <div class="amount">₹${paymentDetails?.amount || '1,000'}</div>
            <div class="recipient">To: ${giftCardStatus?.recipientName || 'Recipient'}</div>
            ${giftCardStatus?.message ? `<div class="message">"${giftCardStatus.message}"</div>` : ''}
          </div>
          <div class="footer">
            <div>Ode Spa - Your Wellness Journey</div>
            <div>Valid for 1 year from purchase date</div>
          </div>
        </div>
      </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gift-card-${giftCardStatus?.giftCardId || Date.now()}.html`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Gift Card Downloaded",
      description: "Your gift card has been downloaded as HTML file. Open it in a browser to view.",
    })
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

      {/* Header */}
     <Header />

      {/* Main content wrapper */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-6xl">
          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Congratulations {userFirstName ? `${userFirstName}!` : '!'} 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Gift Card Successfully Purchased.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Gift Card Details */}
            <div className="bg-white/50 rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#A07735] rounded-full flex items-center justify-center mr-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="white"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Gift Card Details</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Gift Amount:</span>
                  <span className="text-2xl font-bold text-[#A07735]">₹{paymentDetails?.amount || '1,000.00'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Recipient Name:</span>
                  <span className="font-medium">{giftCardStatus?.recipientName || 'Recipient'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Recipient Email:</span>
                  <span className="font-medium">{giftCardStatus?.recipientEmail || 'recipient@example.com'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Occasion:</span>
                  <span className="font-medium">{giftCardStatus?.occasion || 'Special Occasion'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Delivery Date:</span>
                  <span className="text-green-600 font-medium">Send Now</span>
                </div>
                
                <div className="pt-3">
                  <span className="text-gray-600 block mb-2">Message:</span>
                  <span className="italic text-gray-800 bg-gray-50 p-3 rounded-lg block">
                    "{giftCardStatus?.message || 'Relax, refresh, and rejuvenate with love.'}"
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Gift Card Preview */}
                         <div className="bg-white/50 rounded-2xl shadow-xl p-8">
               <div className="relative">
                 <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Gift Card Preview</h3>
                 {/* Gift Card Preview */}
                 <div 
                   className="rounded-xl p-6 relative overflow-hidden h-80 w-full max-w-md flex flex-col justify-center items-center mx-auto shadow-lg"
                   style={{ background: design.background }}
                 >
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
                  <div className="absolute top-6 right-6 w-6 h-6 bg-white/20 rounded-full"></div>
                  <div className="absolute bottom-6 left-6 w-4 h-4 bg-white/20 rounded-full"></div>
                  
                  {/* Main card content */}
                                     <div className="z-10 text-center p-8 flex flex-col items-center justify-center">
                     <div className="text-4xl mb-4">{design.icon}</div>
                     <h3 className="text-2xl font-bold mb-2" style={{ color: design.textColor }}>
                       {design.title}
                     </h3>
                     <p className="text-sm mb-6 opacity-90" style={{ color: design.textColor }}>
                       {design.subtitle}
                     </p>
                     
                     <div className="bg-white/20 rounded-lg p-4 mb-4 backdrop-blur-sm">
                       <div className="text-3xl font-bold" style={{ color: design.textColor }}>
                         ₹{paymentDetails?.amount || '1,000'}
                       </div>
                     </div>
                     
                     {/* <div className="text-sm opacity-80 mb-2" style={{ color: design.textColor }}>
                       To: {giftCardStatus?.recipientName || 'Recipient'}
                     </div>
                     
                     {giftCardStatus?.message && (
                       <div className="text-sm italic opacity-90 max-w-xs" style={{ color: design.textColor }}>
                         "{giftCardStatus.message}"
                       </div>
                     )} */}
                   </div>
                  
                  {/* Footer */}
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <div className="text-xs opacity-70" style={{ color: design.textColor }}>
                      Ode Spa - Your Wellness Journey
                    </div>
                    <div className="text-xs opacity-60" style={{ color: design.textColor }}>
                      Valid for 1 year from purchase date
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button
              className="flex-1 sm:flex-none h-12 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400 text-white font-semibold hover:from-orange-400 hover:to-orange-500 transition-all duration-200"
              onClick={handleBuyAnotherClick}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" />
              </svg>
              Send Another Gift
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 sm:flex-none h-12 rounded-lg border-[#8B4513] text-[#8B4513] font-semibold hover:bg-[#8B4513] hover:text-white transition-all duration-200"
              onClick={handleDownloadGiftCard}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Gift Card
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 sm:flex-none h-12 rounded-lg border-[#8B4513] text-[#8B4513] font-semibold hover:bg-[#8B4513] hover:text-white transition-all duration-200"
              onClick={() => router.push('/')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 text-center py-8">
        <p className="text-gray-600 mb-4">
          Thank you for choosing Ode Spa. Your wellness journey awaits.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-[#A07735] hover:text-[#8B4513] transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" className="text-[#A07735] hover:text-[#8B4513] transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
          </a>
          <a href="#" className="text-[#A07735] hover:text-[#8B4513] transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        </div>
      </footer>
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