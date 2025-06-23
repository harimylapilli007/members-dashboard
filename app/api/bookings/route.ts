import { NextResponse } from 'next/server'
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received booking request body:', body)
    
    const { 
      centerId, 
      serviceId, 
      date, 
      time, 
      guestId 
    } = body

    // Validate required fields
    if (!centerId || !serviceId || !date || !time || !guestId) {
      console.log('Missing required fields:', { centerId, serviceId, date, time, guestId })
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: centerId, serviceId, date, time, or guestId' 
        },
        { status: 400 }
      )
    }

    console.log('All required fields present, proceeding with booking...')

    // Step 1: Create Initial Booking
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

    console.log('Booking created, result:', result)

    // Step 2: Format Time for Slot Reservation
    const formattedTime = time.replace(' AM', '').replace(' PM', '')
    const [hours, minutes] = formattedTime.split(':')
    const isPM = time.includes('PM')
    const hour24 = isPM ? (parseInt(hours) === 12 ? 12 : parseInt(hours) + 12) : (parseInt(hours) === 12 ? 0 : parseInt(hours))
    const time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`
    const slotTime = `${date}T${time24}`

    console.log('Formatted slot time:', slotTime)

    // Step 3: Reserve the Time Slot
    await fetchWithRetry(
      `https://api.zenoti.com/v1/bookings/${result.id}/slots/reserve`,
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.ZENOTI_API_KEY ?? '',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          slot_time: slotTime,
          create_invoice: false
        })
      },
      generateCacheKey('reserve-slot', { bookingId: result.id, slotTime })
    )

    console.log('Slot reserved successfully')

    // Step 4: Confirm the Booking
    await fetchWithRetry(
      `https://api.zenoti.com/v1/bookings/${result.id}/slots/confirm`,
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.ZENOTI_API_KEY ?? '',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Website'
        })
      },
      generateCacheKey('confirm-booking', { bookingId: result.id })
    )

    console.log('Booking confirmed successfully')

    return NextResponse.json({ 
      success: true, 
      bookingId: result.id,
      message: 'Booking confirmed successfully' 
    })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create booking' 
      },
      { status: 500 }
    )
  }
} 