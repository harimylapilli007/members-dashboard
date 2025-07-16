import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: giftCardId } = await params
    
    if (!giftCardId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Gift card ID is required' } 
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.ZENOTI_API_KEY
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

    // Construct the gift card get URL
    const apiUrl = 'https://api.zenoti.com'
    const giftCardGetUrl = `${apiUrl}/v1/giftcards/${giftCardId}`

    const giftCardHeader = {
      'Authorization': `${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    console.log('Fetching gift card details for ID:', giftCardId)
    console.log('Request URL:', giftCardGetUrl)

    const giftCardGetResponse = await fetch(giftCardGetUrl, {
      method: 'GET',
      headers: giftCardHeader
    })

    if (!giftCardGetResponse.ok) {
      const errorData = await giftCardGetResponse.json().catch(() => ({}))
      console.error('Failed to fetch gift card details:', {
        status: giftCardGetResponse.status,
        statusText: giftCardGetResponse.statusText,
        error: errorData
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: errorData.error?.message || errorData.message || `Failed to fetch gift card details. Status: ${giftCardGetResponse.status}` 
          } 
        },
        { status: giftCardGetResponse.status }
      )
    }

    const giftCardData = await giftCardGetResponse.json()
    console.log('Gift card data received:', giftCardData)

    // Extract gift card details
    const giftCard = giftCardData.gift_card
    if (!giftCard) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Invalid gift card data received from server' } 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      gift_card: {
        id: giftCard.id,
        amount: giftCard.amount,
        recipient_name: giftCard.recipient_name,
        recipient_email: giftCard.recipient_email,
        occasion: giftCard.occasion,
        message: giftCard.message,
        purchased_by: giftCard.purchased_by,
        purchased_email: giftCard.purchased_email,
        status: giftCard.status,
        created_date: giftCard.created_date,
        expiry_date: giftCard.expiry_date,
        balance: giftCard.balance,
        is_active: giftCard.is_active
      },
      message: 'Gift card details retrieved successfully'
    })

  } catch (error) {
    console.error('Error retrieving gift card details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 