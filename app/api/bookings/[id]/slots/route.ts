import { NextResponse } from 'next/server'
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    console.log('Fetching slots for booking:', bookingId)

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const slotsResponse = await fetchWithRetry(
      `https://api.zenoti.com/v1/bookings/${bookingId}/slots`,
      {
        headers: {
          'Authorization': process.env.ZENOTI_API_KEY ?? '',
          'accept': 'application/json'
        }
      },
      generateCacheKey('booking-slots', { bookingId })
    )

    if (!slotsResponse) {
      console.error('No response from Zenoti API')
      return NextResponse.json(
        { error: 'No response from Zenoti API' },
        { status: 500 }
      )
    }

    console.log('Slots response:', slotsResponse)

    return NextResponse.json(slotsResponse)
  } catch (error) {
    console.error('Error fetching booking slots:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking slots'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 