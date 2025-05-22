import { NextResponse } from 'next/server'
import { updateMembershipStatus } from '@/actions/payment-actions'
import { verifyPayUResponse } from '@/lib/payment-utils'

interface PayUResponse {
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
}

export async function POST(request: Request) {
  try {
    // Parse form data instead of JSON
    const formData = await request.formData()
    const responseData = Object.fromEntries(formData.entries()) as unknown as PayUResponse

    // Log all PayU response parameters
    console.log('PayU Success Response Parameters:', {
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
      allParams: Object.fromEntries(formData.entries())
    })

    // Verify the PayU response hash
    const isValid = verifyPayUResponse({
      txnid: responseData.txnid,
      amount: responseData.amount,
      productinfo: responseData.productinfo,
      firstname: responseData.firstname,
      email: responseData.email,
      status: responseData.status,
      hash: responseData.hash,
      salt: '0Rd0lVQEvO'
    })

    if (!isValid) {
      // Redirect to failure page with error information
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const params = new URLSearchParams()
      if (responseData.txnid) {
        params.append('txnid', responseData.txnid)
      }
      params.append('error_Message', 'Invalid payment response')

      const redirectUrl = `${baseUrl}/payment/failure?${params.toString()}`
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    }

    // Construct the redirect URL with only txnid and success message
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    
    // Only add txnid and success message
    if (responseData.txnid) {
      params.append('txnid', responseData.txnid)
    }
    params.append('error_Message', 'Payment processed successfully')

    const redirectUrl = `${baseUrl}/payment/success?${params.toString()}`

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
    console.error('Error processing payment success:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    
    // Get txnid from the request if available
    try {
      const formData = await request.formData()
      const responseData = Object.fromEntries(formData.entries()) as unknown as PayUResponse
      if (responseData.txnid) {
        params.append('txnid', responseData.txnid)
      }
    } catch (e) {
      console.error('Error getting txnid from request:', e)
    }
    
    params.append('error_Message', error instanceof Error ? error.message : 'An error occurred while processing payment')
    
    const redirectUrl = `${baseUrl}/payment/failure?${params.toString()}`

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