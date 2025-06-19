import { NextRequest, NextResponse } from 'next/server'
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')

    if (!guestId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Guest ID is required' 
        },
        { status: 400 }
      )
    }

    // Validate guest ID format (basic validation)
    if (guestId.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid guest ID format' 
        },
        { status: 400 }
      )
    }

    console.log('Fetching bookings for guest ID:', guestId)

    const data = await fetchWithRetry(
      `https://api.zenoti.com/v1/guests/${guestId}/appointments`,
      {
        headers: {
          'Authorization': process.env.ZENOTI_API_KEY ?? '',
          'accept': 'application/json'
        }
      },
      generateCacheKey('guest-appointments', { guestId })
    )

    console.log('API Response:', data)

    if (!data) {
      console.error('API returned null or undefined')
      return NextResponse.json(
        { 
          success: false, 
          message: 'No data received from server' 
        },
        { status: 500 }
      )
    }

    if (!data.appointments) {
      console.error('Invalid response structure:', data)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Appointments data is missing from server response' 
        },
        { status: 500 }
      )
    }

    if (!Array.isArray(data.appointments)) {
      console.error('Appointments is not an array:', data.appointments)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Appointments data is not in the expected format' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      appointments: data.appointments,
      count: data.appointments.length
    })

  } catch (error) {
    console.error('Fetch bookings API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Authentication failed. Please try again.' 
          },
          { status: 401 }
        )
      }
      
      if (error.message.includes('404')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Guest not found' 
          },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch bookings. Please try again later.' 
      },
      { status: 500 }
    )
  }
} 