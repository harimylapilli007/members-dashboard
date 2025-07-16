import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params
    
    if (!guestId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Guest ID is required' } 
        },
        { status: 400 }
      )
    }

    // const apiKey = process.env.ZENOTI_API_KEY
    const apiKey = "apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283"   //local
    if (!apiKey) {
      console.error('ZENOTI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Server configuration error. Please contact support.' } 
        },
        { status: 500 }
      )
    }

    // Construct the gift cards URL for the guest
    const apiUrl = 'https://api.zenoti.com'
    const giftCardsUrl = `${apiUrl}/v1/guests/${guestId}/gift_cards`

    const headers = {
      'Authorization': `${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    console.log('Fetching gift cards for guest ID:', guestId)
    console.log('Request URL:', giftCardsUrl)

    const response = await fetch(giftCardsUrl, {
      method: 'GET',
      headers: headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Failed to fetch gift cards:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: errorData.error?.message || errorData.message || `Failed to fetch gift cards. Status: ${response.status}` 
          } 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Successfully fetched gift cards:', data)
    
    return NextResponse.json({
      success: true,
      giftCards: data.gift_cards || data || [],
      totalCount: data.total_count || (data.gift_cards ? data.gift_cards.length : 0)
    })

  } catch (error) {
    console.error('Error fetching gift cards:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error' 
        } 
      },
      { status: 500 }
    )
  }
} 