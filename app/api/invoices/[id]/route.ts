import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: invoiceId } = params

    if (!invoiceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Invoice ID is required' } 
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.zenoti.com/v1/invoices/${invoiceId}?expand=InvoiceItems&expand=Transactions`,
      {
        headers: {
          'Authorization': `${process.env.ZENOTI_API_KEY}`,
          'accept': 'application/json'
        }
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
    console.error('Error fetching invoice details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 