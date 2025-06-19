import { NextRequest, NextResponse } from 'next/server'
import { generateHash } from '@/lib/payment-utils'

interface PaymentInitiateRequest {
  invoice_id: string
  amount: number
  product_info: string
  customer_name: string
  customer_email: string
  customer_phone: string
}

// In-memory rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60000 // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 1

export async function POST(request: NextRequest) {
  try {
    const body: PaymentInitiateRequest = await request.json()
    
    // Validate required fields
    if (!body.invoice_id || !body.amount || !body.customer_name || !body.customer_phone) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required fields' } },
        { status: 400 }
      )
    }

    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const now = Date.now()
    const lastRequestTime = rateLimitStore.get(clientIP) || 0
    
    if (now - lastRequestTime < RATE_LIMIT_WINDOW) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastRequestTime)) / 1000)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: `Too many requests. Please wait ${remainingTime} seconds before trying again.` 
          } 
        },
        { status: 429 }
      )
    }

    // Update rate limit store
    rateLimitStore.set(clientIP, now)

    // Clean up old entries (older than 5 minutes)
    for (const [ip, timestamp] of rateLimitStore.entries()) {
      if (now - timestamp > 300000) { // 5 minutes
        rateLimitStore.delete(ip)
      }
    }

    // Validate PayU credentials
    const payuKey = process.env.PAYU_KEY
    const payuSalt = process.env.PAYU_SALT
    
    if (!payuKey || !payuSalt) {
      return NextResponse.json(
        { success: false, error: { message: 'Payment gateway configuration is missing' } },
        { status: 500 }
      )
    }

    // Generate unique transaction ID
    const txnid = `${body.invoice_id}_${Date.now()}`

    // Prepare payment data
    const paymentData = {
      key: payuKey,
      txnid: txnid,
      amount: body.amount.toString(),
      productinfo: body.product_info,
      firstname: body.customer_name,
      email: body.customer_email,
      phone: body.customer_phone,
      salt: payuSalt,
      surl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/success`,
      furl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/failure`,
    }

    // Generate hash
    const hash = generateHash(paymentData, payuSalt)

    // Return payment form data
    return NextResponse.json({
      success: true,
      payment_data: {
        ...paymentData,
        hash: hash
      },
      payment_url: 'https://secure.payu.in/_payment'
    })

  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
} 