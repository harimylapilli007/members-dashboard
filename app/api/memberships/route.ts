import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const centerId = searchParams.get('centerId')
    const adminCenterId = searchParams.get('adminCenterId')

    if (!userId || !centerId || !adminCenterId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch guest memberships
    const membershipResponse = await fetch(
      `https://api.zenoti.com/v1/guests/${userId}/memberships?center_id=${centerId}`,
      {
        headers: {
          'Authorization': `${process.env.ZENOTI_API_KEY}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    )

    if (!membershipResponse.ok) {
      throw new Error('Failed to fetch membership data')
    }

    const membershipData = await membershipResponse.json()

    // Fetch all memberships for the center
    const detailsResponse = await fetch(
      `https://api.zenoti.com/v1/centers/${adminCenterId}/memberships?show_in_catalog=true`,
      {
        headers: {
          'Authorization': `${process.env.ZENOTI_API_KEY}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    )

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch membership details')
    }

    const detailsData = await detailsResponse.json()
    const sortedMemberships = (detailsData.memberships || []).sort((a: any, b: any) => {
      const priceA = a.price?.sales || 0
      const priceB = b.price?.sales || 0
      return priceA - priceB
    })

    return NextResponse.json({
      guestMemberships: membershipData.guest_memberships || [],
      availableMemberships: sortedMemberships
    })
  } catch (error) {
    console.error('Error in memberships API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch membership data' },
      { status: 500 }
    )
  }
} 