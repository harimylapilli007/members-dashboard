import { NextResponse } from 'next/server'

interface PayUGiftCardResponse {
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  status: string
  hash: string
  mihpayid?: string
  error_Message?: string
  error_code?: string
  udf1?: string // recipient_name
  udf2?: string // recipient_email
  udf3?: string // occasion
  udf4?: string // message
  udf5?: string // gift_card_id
}

export async function POST(request: Request) {
  try {
    // Parse form data instead of JSON
    const formData = await request.formData()
    const responseData = Object.fromEntries(formData.entries()) as unknown as PayUGiftCardResponse

    // Log all PayU response parameters
    console.log('PayU Gift Card Failure Response Parameters:', {
      txnid: responseData.txnid,
      amount: responseData.amount,
      productinfo: responseData.productinfo,
      firstname: responseData.firstname,
      email: responseData.email,
      status: responseData.status,
      hash: responseData.hash,
      mihpayid: responseData.mihpayid,
      error_Message: responseData.error_Message,
      error_code: responseData.error_code,
      udf1: responseData.udf1, // recipient_name
      udf2: responseData.udf2, // recipient_email
      udf3: responseData.udf3, // occasion
      udf4: responseData.udf4, // message
      udf5: responseData.udf5, // gift_card_id
      allParams: Object.fromEntries(formData.entries())
    })

    // Log the failure for monitoring purposes
    console.log('Gift card payment failed:', {
      transactionId: responseData.txnid,
      amount: responseData.amount,
      error: responseData.error_Message,
      errorCode: responseData.error_code,
      giftCardId: responseData.udf5
    })

    // Construct the redirect URL with error details
    const params = new URLSearchParams()
    
    // Add all relevant parameters
    if (responseData.txnid) params.append('txnid', responseData.txnid)
    if (responseData.amount) params.append('amount', responseData.amount)
    if (responseData.status) params.append('status', responseData.status)
    if (responseData.error_Message) params.append('error_Message', responseData.error_Message)
    if (responseData.error_code) params.append('error_code', responseData.error_code)
    
    // Add gift card specific parameters
    if (responseData.udf1) params.append('recipient_name', responseData.udf1)
    if (responseData.udf2) params.append('recipient_email', responseData.udf2)
    if (responseData.udf3) params.append('occasion', responseData.udf3)
    if (responseData.udf4) params.append('message', responseData.udf4)
    if (responseData.udf5) params.append('gift_card_id', responseData.udf5)

    const redirectUrl = `/gift-cards/payment/failure?${params.toString()}`
    console.log('Redirecting to gift card failure page:', redirectUrl)

    // Return a redirect response with proper headers
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error processing gift card payment failure:', error)
    const params = new URLSearchParams()
    params.append('error_Message', error instanceof Error ? error.message : 'An error occurred while processing gift card payment failure')
    
    const redirectUrl = `/gift-cards/payment/failure?${params.toString()}`
    console.log('Error redirect URL:', redirectUrl)

    // Return a redirect response with proper headers
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  }
} 