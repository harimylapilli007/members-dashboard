"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, GiftIcon, UserIcon, MailIcon, MessageSquareIcon, ClockIcon, DollarSignIcon } from "lucide-react"
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
    router.push('/dashboard')
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Used</Badge>
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>
    }
  }

  if (isLoading) {
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
              {giftCards.map((giftCard) => (
                <Card key={giftCard.id} className="bg-[#FAF9F6] border-[#A07735] hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-['Marcellus']">Gift Card #{giftCard.actual_code}</CardTitle>
                      {getStatusBadge(giftCard.invoice?.status || 'active')}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Amount and Balance */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-['Marcellus']">Original Amount</span>
                        <span className="font-semibold text-green-700 font-['Marcellus']">
                          {formatCurrency(giftCard.price || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-['Marcellus']">Current Balance</span>
                        <span className="font-semibold text-[#A07735] font-['Marcellus']">
                          {formatCurrency(giftCard.balance || giftCard.value || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Recipient Info */}
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

                    {/* Message */}
                    {giftCard.message && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquareIcon className="h-4 w-4" />
                          <span className="font-['Marcellus']">Message</span>
                        </div>
                        <p className="text-sm italic bg-white p-2 rounded border">
                          "{giftCard.message}"
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="font-['Marcellus']">Created</span>
                        </div>
                        <span className="font-['Marcellus']">{formatDate(giftCard.sale_date)}</span>
                      </div>
                      {giftCard.expiry_date && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-['Marcellus']">Expires</span>
                          </div>
                          <span className="font-['Marcellus']">{formatDate(giftCard.expiry_date)}</span>
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
              Buy New Gift Card
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-lg border-[#A07735] text-[#A07735] font-['Marcellus'] font-bold text-base hover:bg-[#A07735] hover:text-white transition-all duration-200"
              onClick={handleGoToDashboard}
            >
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
            background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
          }}
        />
        {/* Header */}
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 pt-24">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-center font-['Marcellus']">Loading gift cards...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <MyGiftCardsContent />
    </Suspense>
  )
} 