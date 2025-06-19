import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: bookingId } = params
    const body = await request.json()
    const { slotTime } = body

    if (!bookingId || !slotTime) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Booking ID and slot time are required' } 
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.zenoti.com/v1/bookings/${bookingId}/slots/reserve`,
      {
        method: 'POST',
        headers: {
          'Authorization': `${process.env.ZENOTI_API_KEY}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          slot_time: slotTime,
          create_invoice: false
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          success: false, 
          error: { message: errorData.error?.message || `HTTP error! status: ${response.status}` } 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error reserving slot:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 