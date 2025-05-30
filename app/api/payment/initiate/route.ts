import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || 'gtKFFx'
const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || '0Rd0lVQEvO'
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { invoice_id, amount, product_info } = body

    if (!invoice_id || !amount || !product_info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate a unique transaction ID
    const txnid = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create hash for PayU
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${product_info}|John Doe|john@example.com|||||||||||${PAYU_MERCHANT_SALT}`
    const hash = crypto.createHash('sha512').update(hashString).digest('hex')

    // Prepare payment data
    const paymentData = {
      key: PAYU_MERCHANT_KEY,
      txnid,
      amount,
      productinfo: product_info,
      firstname: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      surl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      furl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
      hash,
    }

    // Create form data
    const formData = new URLSearchParams()
    Object.entries(paymentData).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    // Return the payment URL and form data
    return NextResponse.json({
      payment_url: PAYU_BASE_URL,
      form_data: Object.fromEntries(formData)
    })
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
} 