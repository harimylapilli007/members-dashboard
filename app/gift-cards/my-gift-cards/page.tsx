"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, GiftIcon, UserIcon, MailIcon, MessageSquareIcon, ClockIcon, DollarSignIcon, SparklesIcon, StarIcon, HeartIcon, Share2Icon, CopyIcon, CheckIcon } from "lucide-react"
import Header from "@/app/components/Header"

interface GiftCard {
  id: string
  amount: number
  balance: number
  recipient_name?: string
  recipient_email?: string
  occasion?: string
  message?: string
  purchased_by?: string
  purchased_email?: string
  status: string
  sale_date: string
  expiry_date?: string
  is_active: boolean
  center_id?: string
  guest_id?: string
  actual_code?: string
  price?: number
  value?: number
  invoice?: {
    status: string
  }
}

function MyGiftCardsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null)
  const [showShareOptions, setShowShareOptions] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserDataAndGiftCards = async () => {
      try {
        // Get user data from localStorage
        const storedUserData = localStorage.getItem('userData')
        if (!storedUserData) {
          setError('Please log in to view your gift cards')
          setIsLoading(false)
          return
        }

        const parsedUserData = JSON.parse(storedUserData)
        setUserData(parsedUserData)

        if (!parsedUserData.id) {
          setError('Invalid user data. Please log in again.')
          setIsLoading(false)
          return
        }

        // Fetch gift cards for the user
        const response = await fetch(`/api/giftcards/guest/${parsedUserData.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch gift cards')
        }

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch gift cards')
        }

        setGiftCards(data.giftCards || [])
      } catch (err) {
        console.error('Error fetching gift cards:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch gift cards')
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your gift cards. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDataAndGiftCards()
  }, [toast])

  const handleBuyNewGiftCard = () => {
    router.push('/gift-cards')
  }

  const handleGoToDashboard = () => {
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'closed':
      case 'valid':
        return (
          <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Active
          </Badge>
        )
      case 'expired':
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-red-600 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            Expired
          </Badge>
        )
      case 'used':
        return (
          <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            Used
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            {status || 'Unknown'}
          </Badge>
        )
    }
  }

  const getOccasionIcon = (occasion: string) => {
    const occasionLower = occasion.toLowerCase()
    if (occasionLower.includes('birthday')) return <StarIcon className="h-4 w-4" />
    if (occasionLower.includes('anniversary')) return <HeartIcon className="h-4 w-4" />
    if (occasionLower.includes('wedding')) return <SparklesIcon className="h-4 w-4" />
    return <GiftIcon className="h-4 w-4" />
  }

  const generateShareText = (giftCard: GiftCard) => {
    const cardInfo = [
      `🎁 Gift Card: ${giftCard.actual_code}`,
      `💰 Value: ${formatCurrency(giftCard.balance || giftCard.value || 0)}`,
      giftCard.recipient_name ? `👤 Recipient: ${giftCard.recipient_name}` : '',
      giftCard.occasion ? `🎉 Occasion: ${giftCard.occasion}` : '',
      giftCard.message ? `💌 Message: "${giftCard.message}"` : '',
      `📅 Created: ${formatDate(giftCard.sale_date)}`,
      giftCard.expiry_date ? `⏰ Expires: ${formatDate(giftCard.expiry_date)}` : '',
      `\n💝 Share this beautiful gift card with your loved ones!`
    ].filter(Boolean).join('\n')
    
    return cardInfo
  }

  const shareToWhatsApp = (giftCard: GiftCard) => {
    const text = generateShareText(giftCard)
    const encodedText = encodeURIComponent(text)
    const whatsappUrl = `https://wa.me/?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  const shareToEmail = (giftCard: GiftCard) => {
    const subject = encodeURIComponent(`🎁 Gift Card ${giftCard.actual_code} - ${giftCard.recipient_name || 'Special Gift'}`)
    const body = encodeURIComponent(generateShareText(giftCard))
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(mailtoUrl)
  }

  const shareToTelegram = (giftCard: GiftCard) => {
    const text = generateShareText(giftCard)
    const encodedText = encodeURIComponent(text)
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`
    window.open(telegramUrl, '_blank')
  }

  const copyToClipboard = async (giftCard: GiftCard) => {
    try {
      const text = generateShareText(giftCard)
      await navigator.clipboard.writeText(text)
      setCopiedCardId(giftCard.id)
      toast({
        title: "Copied!",
        description: "Gift card details copied to clipboard",
      })
      setTimeout(() => setCopiedCardId(null), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      })
    }
  }

  const shareToFacebook = (giftCard: GiftCard) => {
    const text = generateShareText(giftCard)
    const encodedText = encodeURIComponent(text)
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`
    window.open(facebookUrl, '_blank')
  }

  const shareToTwitter = (giftCard: GiftCard) => {
    const text = generateShareText(giftCard)
    const encodedText = encodeURIComponent(text)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(window.location.href)}`
    window.open(twitterUrl, '_blank')
  }

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareOptions && !(event.target as Element).closest('.share-dropdown')) {
        setShowShareOptions(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareOptions])

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced background gradient */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
          }}
        />
        {/* Subtle blurred circles */}
        <div className="fixed top-20 -left-60 w-[600px] h-[600px] bg-[#e2c799] opacity-60 rounded-full -z-10 blur-3xl" />
        <div className="fixed bottom-20 right-0 w-[800px] h-[800px] bg-[#b2d5e4] opacity-50 rounded-full -z-10 blur-3xl" />
        
        {/* Header */}
        <Header />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 pt-24">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-center font-['Marcellus']">Loading your gift cards...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced background gradient */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
          }}
        />
        {/* Subtle blurred circles */}
        <div className="fixed top-20 -left-60 w-[600px] h-[600px] bg-[#e2c799] opacity-60 rounded-full -z-10 blur-3xl" />
        <div className="fixed bottom-20 right-0 w-[800px] h-[800px] bg-[#b2d5e4] opacity-50 rounded-full -z-10 blur-3xl" />
        
        {/* Header */}
        <Header />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 pt-24">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <GiftIcon className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 font-['Marcellus']">Unable to Load Gift Cards</h2>
              <p className="text-muted-foreground mb-6 font-['Marcellus']">{error}</p>
              <div className="flex flex-col gap-3 w-full">
                <Button
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base hover:!bg-[#b9935a] transition-all duration-200"
                  onClick={() => router.push('/signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-lg border-[#A07735] text-[#A07735] font-['Marcellus'] font-bold text-base hover:bg-[#A07735] hover:text-white transition-all duration-200"
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
      <div className="relative  min-h-screen px-4 sm:px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#A07735] rounded-full p-3 shadow border border-white">
                <GiftIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-['Marcellus']">
              My Gift Cards
            </h1>
            <p className="text-muted-foreground font-['Marcellus']">
              {userData?.first_name || userData?.last_name ? `Welcome back, ${userData.first_name || userData.firstName}!` : 'Manage your gift cards'}
            </p>
          </div>

          {/* Stats Summary */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#FAF9F6] border-[#A07735]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-['Marcellus']">Total Gift Cards</p>
                    <p className="text-2xl font-bold font-['Marcellus']">{giftCards.length}</p>
                  </div>
                  <GiftIcon className="h-8 w-8 text-[#A07735]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#FAF9F6] border-[#A07735]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-['Marcellus']">Total Value</p>
                    <p className="text-2xl font-bold font-['Marcellus']">
                      {formatCurrency(giftCards.reduce((sum, card) => sum + (card.amount || 0), 0))}
                    </p>
                  </div>
                  <DollarSignIcon className="h-8 w-8 text-[#A07735]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#FAF9F6] border-[#A07735]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-['Marcellus']">Active Cards</p>
                    <p className="text-2xl font-bold font-['Marcellus']">
                      {giftCards.filter(card => card.is_active).length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Gift Cards List */}
          {giftCards.length === 0 ? (
            <Card className="bg-[#FAF9F6] border-[#A07735]">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-[#A07735] rounded-full p-4 mb-4">
                  <GiftIcon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-['Marcellus']">No Gift Cards Found</h3>
                <p className="text-muted-foreground mb-6 font-['Marcellus']">
                  You haven't purchased any gift cards yet. Start by creating your first gift card!
                </p>
                <Button
                  className="h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base hover:!bg-[#b9935a] transition-all duration-200"
                  onClick={handleBuyNewGiftCard}
                >
                  Buy Your First Gift Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftCards.map((giftCard, index) => (
                <Card 
                  key={giftCard.id} 
                  className="bg-gradient-to-br from-[#FFF8F0] to-[#F5F1E8] border-2 border-[#A07735] hover:border-[#8B5A2B] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden relative"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    background: `linear-gradient(135deg, #FFF8F0 0%, #F5F1E8 50%, #E8E0D0 100%)`
                  }}
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-[#A07735] opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[30px] border-r-transparent border-b-[30px] border-b-[#A07735] opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <CardHeader className="pb-3 relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-['Marcellus'] text-[#8B5A2B] group-hover:text-[#6B4423] transition-colors duration-300">
                        Gift Card #{giftCard.actual_code}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(giftCard.invoice?.status || 'active')}
                        <div className="relative share-dropdown">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#A07735]/10 text-[#A07735] hover:text-[#8B5A2B]"
                            onClick={() => setShowShareOptions(showShareOptions === giftCard.id ? null : giftCard.id)}
                          >
                            <Share2Icon className="h-4 w-4" />
                          </Button>
                          
                          {/* Share Options Dropdown */}
                          {showShareOptions === giftCard.id && (
                            <div className="absolute right-0 top-10 z-50 bg-white border border-[#A07735] rounded-lg shadow-lg p-2 min-w-[200px] share-dropdown">
                              <div className="text-xs font-semibold text-[#8B5A2B] mb-2 px-2">Share Gift Card</div>
                              <div className="space-y-1">
                                <button
                                  onClick={() => {
                                    shareToWhatsApp(giftCard)
                                    setShowShareOptions(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 rounded text-left transition-colors"
                                >
                                  <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">W</span>
                                  </div>
                                  WhatsApp
                                </button>
                                
                                <button
                                  onClick={() => {
                                    shareToEmail(giftCard)
                                    setShowShareOptions(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 rounded text-left transition-colors"
                                >
                                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                                    <MailIcon className="h-3 w-3 text-white" />
                                  </div>
                                  Email
                                </button>
                                
                                <button
                                  onClick={() => {
                                    shareToTelegram(giftCard)
                                    setShowShareOptions(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-cyan-50 rounded text-left transition-colors"
                                >
                                  <div className="w-5 h-5 bg-cyan-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">T</span>
                                  </div>
                                  Telegram
                                </button>
                                
                                <button
                                  onClick={() => {
                                    shareToFacebook(giftCard)
                                    setShowShareOptions(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 rounded text-left transition-colors"
                                >
                                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">f</span>
                                  </div>
                                  Facebook
                                </button>
                                
                                <button
                                  onClick={() => {
                                    shareToTwitter(giftCard)
                                    setShowShareOptions(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sky-50 rounded text-left transition-colors"
                                >
                                  <div className="w-5 h-5 bg-sky-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">𝕏</span>
                                  </div>
                                  Twitter
                                </button>
                                
                                <div className="border-t border-gray-200 my-1"></div>
                                
                                <button
                                  onClick={() => {
                                    copyToClipboard(giftCard)
                                    setShowShareOptions(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded text-left transition-colors"
                                >
                                  {copiedCardId === giftCard.id ? (
                                    <CheckIcon className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4 text-gray-600" />
                                  )}
                                  {copiedCardId === giftCard.id ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Amount and Balance with enhanced styling */}
                    <div className="space-y-3 p-4 bg-gradient-to-r from-[#F8F4E6] to-[#F0E6D2] rounded-lg border border-[#D4AF37] shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#8B5A2B] font-['Marcellus'] flex items-center">
                          <DollarSignIcon className="h-4 w-4 mr-2 text-[#A07735]" />
                          Original Amount
                        </span>
                        <span className="font-bold text-lg text-[#2E8B57] font-['Marcellus']">
                          {formatCurrency(giftCard.price || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#8B5A2B] font-['Marcellus'] flex items-center">
                          <GiftIcon className="h-4 w-4 mr-2 text-[#A07735]" />
                          Current Balance
                        </span>
                        <span className="font-bold text-xl text-[#A07735] font-['Marcellus'] group-hover:text-[#8B5A2B] transition-colors duration-300">
                          {formatCurrency(giftCard.balance || giftCard.value || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Recipient Info with enhanced styling */}
                    {giftCard.recipient_name && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserIcon className="h-4 w-4" />
                          <span className="font-['Marcellus']">Recipient</span>
                        </div>
                        <p className="font-medium font-['Marcellus']">{giftCard.recipient_name}</p>
                        {giftCard.recipient_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <MailIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{giftCard.recipient_email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Occasion */}
                    {giftCard.occasion && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GiftIcon className="h-4 w-4" />
                          <span className="font-['Marcellus']">Occasion</span>
                        </div>
                        <p className="font-medium font-['Marcellus']">{giftCard.occasion}</p>
                      </div>
                    )}

                    {/* Message with enhanced styling */}
                    {giftCard.message && (
                      <div className="space-y-2 p-3 bg-gradient-to-r from-[#F0FFF0] to-[#E0F0E0] rounded-lg border border-[#90EE90] shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-[#2E8B57]">
                          <div className="bg-[#32CD32] rounded-full p-1.5">
                            <MessageSquareIcon className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-['Marcellus'] font-semibold">Message</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-[#90EE90]">
                          <p className="text-sm italic text-[#2E8B57] font-['Marcellus'] leading-relaxed">
                            "{giftCard.message}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dates with enhanced styling */}
                    <div className="space-y-2 pt-3 border-t border-[#D4AF37]">
                      <div className="flex items-center justify-between text-sm p-2 bg-[#F8F4E6] rounded border border-[#D4AF37]">
                        <div className="flex items-center gap-2 text-[#8B5A2B]">
                          <CalendarIcon className="h-3 w-3 text-[#A07735]" />
                          <span className="font-['Marcellus'] font-semibold text-xs">Created</span>
                        </div>
                        <span className="font-bold font-['Marcellus'] text-[#8B5A2B] text-xs">{formatDate(giftCard.sale_date)}</span>
                      </div>
                      {giftCard.expiry_date && (
                        <div className="flex items-center justify-between text-sm p-2 bg-[#F8F4E6] rounded border border-[#D4AF37]">
                          <div className="flex items-center gap-2 text-[#8B5A2B]">
                            <ClockIcon className="h-3 w-3 text-[#A07735]" />
                            <span className="font-['Marcellus'] font-semibold text-xs">Expires</span>
                          </div>
                          <span className="font-bold font-['Marcellus'] text-[#8B5A2B] text-xs">{formatDate(giftCard.expiry_date)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button
              className="h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow font-['Marcellus'] text-[#98564D] font-bold text-base hover:!bg-[#b9935a] transition-all duration-200"
              onClick={handleBuyNewGiftCard}
            >
              <GiftIcon className="h-5 w-5 mr-2" />
              Buy New Gift Card
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-lg border-[#A07735] text-[#A07735] font-['Marcellus'] font-bold text-base hover:bg-[#A07735] hover:text-white transition-all duration-200"
              onClick={handleGoToDashboard}
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyGiftCards() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)"
          }}
        />
        {/* Header */}
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 pt-24">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="mt-6 text-center font-['Marcellus'] text-lg text-gray-700">Loading gift cards...</p>
              <div className="mt-4 flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <MyGiftCardsContent />
    </Suspense>
  )
} 