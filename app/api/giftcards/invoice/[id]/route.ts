import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: invoiceId } = await params
    
    if (!invoiceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Invoice ID is required' } 
        },
        { status: 400 }
      )
    }

    // const apiKey = process.env.ZENOTI_API_KEY
    const apiKey = "apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283"   //local
    if (!apiKey) {
      console.error('ZENOTI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Server configuration error. Please contact support.' } 
        },
        { status: 500 }
      )
    }

    // Construct the invoice get URL with expand parameters
    const apiUrl = 'https://api.zenoti.com'
    const invoiceGetUrl = `${apiUrl}/v1/invoices/${invoiceId}?expand=InvoiceItems&expand=Transactions`

    const invoiceHeader = {
      'Authorization': `${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      
    }

    console.log('Fetching invoice details for ID:', invoiceId)
    console.log('Request URL:', invoiceGetUrl)

    const invoiceGetResponse = await fetch(invoiceGetUrl, {
      method: 'GET',
      headers: invoiceHeader
    })

    if (!invoiceGetResponse.ok) {
      const errorData = await invoiceGetResponse.json().catch(() => ({}))
      console.error('Failed to fetch invoice details:', {
        status: invoiceGetResponse.status,
        statusText: invoiceGetResponse.statusText,
        error: errorData
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: errorData.error?.message || errorData.message || `Failed to fetch invoice details. Status: ${invoiceGetResponse.status}` 
          } 
        },
        { status: invoiceGetResponse.status }
      )
    }

    const invoiceData = await invoiceGetResponse.json()
    console.log('Invoice data received:', invoiceData)

    // Extract invoice details
    const invoice = invoiceData.invoice
    if (!invoice) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Invalid invoice data received from server' } 
        },
        { status: 500 }
      )
    }

    // Calculate amount due
    let amountDue = invoice.total_price?.sum_total || 0
    
    // Subtract any existing transactions
    if (invoice.transactions && Array.isArray(invoice.transactions)) {
      for (const transaction of invoice.transactions) {
        amountDue -= transaction.total_amount_paid || 0
      }
    }

    // Ensure amount due is not negative
    amountDue = Math.max(0, amountDue)

    console.log('Amount Due:', amountDue)

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        total_price: invoice.total_price,
        amount_due: amountDue,
        status: invoice.status,
        created_date: invoice.created_date,
        due_date: invoice.due_date,
        invoice_items: invoice.invoice_items || [],
        transactions: invoice.transactions || []
      },
      message: 'Invoice details retrieved successfully'
    })

  } catch (error) {
    console.error('Error retrieving invoice details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 