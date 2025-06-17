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
      allParams: Object.fromEntries(formData.entries())
    })

    // // Update membership status in the backend
    // try {
    //   const updateResult = await updateMembershipStatus(responseData)
    //   console.log('Membership status update result:', updateResult)
    // } catch (updateError) {
    //   console.error('Error updating membership status:', updateError)
    // }

    // Construct the redirect URL with error details
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    
    // Add all relevant parameters
    if (responseData.txnid) params.append('txnid', responseData.txnid)
    if (responseData.amount) params.append('amount', responseData.amount)
    if (responseData.status) params.append('status', responseData.status)
    if (responseData.error_Message) params.append('error_Message', responseData.error_Message)
    if (responseData.error_code) params.append('error_code', responseData.error_code)

    const redirectUrl = `/payment/failure?${params.toString()}`
    console.log('Redirecting to:', redirectUrl)

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
    console.error('Error processing payment failure:', error)
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    params.append('error_Message', error instanceof Error ? error.message : 'An error occurred while processing payment failure')
    
    const redirectUrl = `/payment/failure?${params.toString()}`
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