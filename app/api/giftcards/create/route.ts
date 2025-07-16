import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { 
      amount, 
      recipientName, 
      recipientEmail, 
      recipientPhone, 
      message, 
      occasionId,
      deliveryOption,
      deliveryDate,
      centerId = "92d41019-c790-4668-9158-a693e531c1a4", // Updated default center ID
      guestId // This should come from local storage
    } = body

    // Validate required fields
    if (!amount || !recipientName || !recipientEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Amount, recipient name, and recipient email are required' } 
        },
        { status: 400 }
      )
    }

    // Validate guest ID
    if (!guestId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Guest ID is required. Please ensure you are logged in.' } 
        },
        { status: 400 }
      )
    }

    // Validate amount
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Invalid amount. Please enter a valid positive number.' } 
        },
        { status: 400 }
      )
    }

    // Validate amount limits (optional - adjust as needed)
    if (numericAmount < 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Minimum gift card amount is ₹100.' } 
        },
        { status: 400 }
      )
    }

    if (numericAmount > 100000) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Maximum gift card amount is ₹100,000.' } 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Please enter a valid email address.' } 
        },
        { status: 400 }
      )
    }

    console.log('Creating gift card with payload:', {
      amount: numericAmount,
      recipientName,
      recipientEmail,
      recipientPhone,
      message,
      occasionId,
      deliveryOption,
      centerId,
      guestId
    })

    // Prepare the payload for Zenoti API according to the provided structure
    const zenotiPayload = {
      center_id: centerId,
      guest_id: guestId,
      gift_cards: [
        {
          type: 0, // Default gift card type
          schedule_time: deliveryDate,
          custom_amount: {
            price: numericAmount.toString(),
            value: numericAmount.toString()
          },
          occasion:{
            id: occasionId
          },
          recepient:{
            name: recipientName,
            email: recipientEmail,
            phone: recipientPhone
          },
          notes: message || "",
          is_onetime_use: false,
          expiry: {
            days: "365" // Set expiry to 1 year
          }
        }
      ]
    }

    console.log('Zenoti API payload:', zenotiPayload)

    const response = await fetch('https://api.zenoti.com/v1/invoices/gift_cards', {
      method: 'POST',
      headers: {
        'Authorization': `${apiKey}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(zenotiPayload)
    })

    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      let errorData: any = {}
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json().catch(() => ({}))
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        errorData = { message: errorText }
      }
      
      console.error('Zenoti gift card creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: errorData.error?.message || errorData.message || `Failed to create gift card. Status: ${response.status}` 
          } 
        },
        { status: response.status }
      )
    }

    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const textData = await response.text()
      throw new Error(textData || 'Invalid response format from server')
    }
    console.log('Gift card created successfully:', data)
    
    return NextResponse.json({
      success: true,
      giftCardId: data.id || data.gift_card_id,
      invoiceId: data.invoice_id || data.id,
      data: data,
      message: 'Gift card created successfully'
    })

  } catch (error) {
    console.error('Error creating gift card:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 