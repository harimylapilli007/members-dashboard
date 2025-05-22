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
      params.append('error_Message', responseData.error_Message || 'Invalid payment response')
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${baseUrl}/payment/failure?${params.toString()}`)
    }

    // Skip membership status update for now
    // const result = await updateMembershipStatus(responseData)
    // if (!result.success) {
    //   // Redirect to failure page with error information
    //   const params = new URLSearchParams()
    //   params.append('txnid', responseData.txnid)
    //   params.append('error_Message', result.error?.message || 'Failed to update membership status')
    //   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    //   return NextResponse.redirect(`${baseUrl}/payment/failure?${params.toString()}`)
    // }

    // Redirect to success page with payment information
    const params = new URLSearchParams()
    params.append('txnid', responseData.txnid)
    params.append('error_Message', 'Payment processed successfully')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/success?${params.toString()}`)
  } catch (error) {
    console.error('Error processing payment success:', error)
    // Redirect to failure page with error information
    const params = new URLSearchParams()
    // Get txnid from the request if available
    const formData = await request.formData()
    const responseData = Object.fromEntries(formData.entries()) as unknown as PayUResponse
    if (responseData.txnid) {
      params.append('txnid', responseData.txnid)
    }
    params.append('error_Message', error instanceof Error ? error.message : 'An error occurred while processing payment')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/failure?${params.toString()}`)
  }
} 