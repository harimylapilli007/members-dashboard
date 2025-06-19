import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { membershipId, userId } = body

    if (!membershipId || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Membership ID and User ID are required' } 
        },
        { status: 400 }
      )
    }

    const admincenterId = '92d41019-c790-4668-9158-a693e531c1a4'

    if (!admincenterId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Center ID is required' } 
        },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.zenoti.com/v1/invoices/memberships', {
      method: 'POST',
      headers: {
        'Authorization': `${process.env.ZENOTI_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        center_id: admincenterId,
        user_id: userId,
        membership_ids: membershipId
      })
    })

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
    
    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: data.error?.message || 'Failed to create invoice' } 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      invoice_id: data.invoice_id,
      data: data
    })

  } catch (error) {
    console.error('Error creating membership invoice:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 