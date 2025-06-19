import { NextRequest, NextResponse } from 'next/server'
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, reason = 'Cancelled by customer' } = body

    if (!appointmentId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Appointment ID is required' 
        },
        { status: 400 }
      )
    }

    // Validate appointment ID format (basic validation)
    if (appointmentId.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid appointment ID format' 
        },
        { status: 400 }
      )
    }

    // Validate reason length
    if (reason.length > 500) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Reason is too long (max 500 characters)' 
        },
        { status: 400 }
      )
    }

    console.log('Cancelling appointment:', appointmentId)

    const result = await fetchWithRetry(
      `https://api.zenoti.com/v1/appointments/${appointmentId}/cancel`,
      {
        method: 'PUT',
        headers: {
          'Authorization': process.env.ZENOTI_API_KEY ?? '',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason
        })
      },
      generateCacheKey('cancel-appointment', { appointmentId })
    )

    console.log('Appointment cancelled successfully:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment cancelled successfully',
      result 
    })

  } catch (error) {
    console.error('Cancel booking API error:', error)
    
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
            message: 'Appointment not found' 
          },
          { status: 404 }
        )
      }
      
      if (error.message.includes('409')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Appointment cannot be cancelled at this time' 
          },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to cancel appointment. Please try again later.' 
      },
      { status: 500 }
    )
  }
} 