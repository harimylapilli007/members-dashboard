import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Fetching gift card occasions from Zenoti API')
    console.log(process.env)

    console.log('ZENOTI_API_KEY:', process.env.ZENOTI_API_KEY ? 'Set' : 'Not set')
    
    if (!process.env.ZENOTI_API_KEY) {
      console.error('ZENOTI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          error: 'API configuration error',
          details: 'ZENOTI_API_KEY environment variable is not configured'
        },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.zenoti.com/v1/giftcards/occasions', {
      headers: {
        'Authorization': `${process.env.ZENOTI_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zenoti API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return NextResponse.json({ 
        error: 'Zenoti API error', 
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('Successfully fetched occasions:', data)
    
    // Return the data in a consistent format
    return NextResponse.json({
      success: true,
      occasions: data.occasions || data || []
    })
  } catch (error) {
    console.error('Error fetching occasions from Zenoti:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch occasions from Zenoti',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 