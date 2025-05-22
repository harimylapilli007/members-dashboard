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
    console.log('PayU Failure Response Parameters:', {
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
      // Log all other parameters that might be present
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
      salt: '0Rd0lVQEvO' // This should match the salt used in payment-utils.ts
    })

    if (!isValid) {
      // Redirect to failure page with error information
      const params = new URLSearchParams()
      params.append('txnid', responseData.txnid)
      params.append('error_Message', responseData.error_Message || 'Payment failed')
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      if (!baseUrl) {
        console.error('NEXT_PUBLIC_APP_URL is not set')
        return NextResponse.redirect(new URL('/payment/failure', 'http://localhost:3000'))
      }
      try {
        const redirectUrl = new URL('/payment/failure', baseUrl)
        redirectUrl.search = params.toString()
        return NextResponse.redirect(redirectUrl)
      } catch (error) {
        console.error('Error constructing redirect URL:', error)
        return NextResponse.redirect(new URL('/payment/failure', 'http://localhost:3000'))
      }
    }

    // Payment actions are currently on hold
    console.log('Payment actions held - skipping membership status update')
    
    // Redirect to failure page with error information
    const params = new URLSearchParams()
    params.append('txnid', responseData.txnid)
    params.append('error_Message', responseData.error_Message || 'Payment failed')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not set')
      return NextResponse.redirect(new URL('/payment/failure', 'http://localhost:3000'))
    }
    try {
      const redirectUrl = new URL('/payment/failure', baseUrl)
      redirectUrl.search = params.toString()
      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.error('Error constructing redirect URL:', error)
      return NextResponse.redirect(new URL('/payment/failure', 'http://localhost:3000'))
    }
  } catch (error) {
    console.error('Error processing payment failure:', error)
    // Redirect to failure page with error information
    const params = new URLSearchParams()
    params.append('error_Message', error instanceof Error ? error.message : 'An error occurred while processing payment failure')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not set')
      return NextResponse.redirect(new URL('/payment/failure', 'http://localhost:3000'))
    }
    try {
      const redirectUrl = new URL('/payment/failure', baseUrl)
      redirectUrl.search = params.toString()
      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.error('Error constructing redirect URL:', error)
      return NextResponse.redirect(new URL('/payment/failure', 'http://localhost:3000'))
    }
  }
} 