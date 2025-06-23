import { NextResponse } from 'next/server'
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received create booking request body:', body)
    
    const { 
      centerId, 
      serviceId, 
      date, 
      guestId 
    } = body

    // Validate required fields
    if (!centerId || !serviceId || !date) {
      console.log('Missing required fields:', { centerId, serviceId, date })
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: centerId, serviceId, date' 
        },
        { status: 400 }
      )
    }

    console.log('All required fields present, creating booking...')

    // Create initial booking without time slot
    const payload = {
      is_only_catalog_employees: true,
      center_id: centerId,
      date: date,
      guests: [{
        id: guestId,
        items: [{
          item: {
            id: serviceId
          }
        }]
      }]
    }

    console.log('Creating booking with payload:', payload)

    // Create booking
    const result = await fetchWithRetry(
      'https://api.zenoti.com/v1/bookings?is_double_booking_enabled=true',
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.ZENOTI_API_KEY ?? '',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      },
      generateCacheKey('create-booking', { 
        serviceId, 
        date, 
        centerId 
      })
    )

    console.log('Booking created successfully:', result)

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Booking created successfully' 
    })

  } catch (error) {
    console.error('Create booking API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create booking' 
      },
      { status: 500 }
    )
  }
} 