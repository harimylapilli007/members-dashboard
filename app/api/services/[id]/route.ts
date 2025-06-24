import { NextResponse } from 'next/server'
import { fetchWithRetry, generateCacheKey } from '@/app/utils/api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('centerId')
    const { id: serviceId } = await params // Await params and destructure

    if (!centerId) {
      return NextResponse.json(
        { error: 'Center ID is required' },
        { status: 400 }
      )
    }

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching service details:', { serviceId, centerId })

    const serviceResponse = await fetchWithRetry(
      `https://api.zenoti.com/v1/centers/${centerId}/services/${serviceId}`,
      {
        headers: {
          'Authorization': `${process.env.ZENOTI_API_KEY}`,
          'accept': 'application/json'
        }
      },
      generateCacheKey('service-details', { serviceId, centerId })
    )

    if (!serviceResponse) {
      console.error('currently service is not available', serviceId)
      return NextResponse.json(
        { error: 'currently service is not available' },
        { status: 500 }
      )
    }

    console.log('Service details response:', serviceResponse)

    return NextResponse.json(serviceResponse)
  } catch (error) {
    console.error('Error fetching service details:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service details'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 