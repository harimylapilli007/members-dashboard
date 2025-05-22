"use server"

import { z } from "zod"

// Validation schema for PayU response
const payUResponseSchema = z.object({
  txnid: z.string(),
  amount: z.string(),
  productinfo: z.string(),
  firstname: z.string(),
  email: z.string(),
  status: z.string(),
  hash: z.string(),
  error_Message: z.string().optional(),
  error_code: z.string().optional(),
})

interface PayUResponse {
  success: boolean
  data?: {
    txnid: string
    amount: string
    productinfo: string
    firstname: string
    email: string
    status: string
    hash: string
    error_Message?: string
    error_code?: string
  }
  error?: {
    message: string
  }
}

/**
 * Updates the membership status based on PayU payment response
 * @param responseData - The PayU response data
 * @returns Promise containing the update status or error
 */
export async function updateMembershipStatus(responseData: z.infer<typeof payUResponseSchema>): Promise<PayUResponse> {
  try {
    // Validate input
    const validatedData = payUResponseSchema.parse(responseData)

    // Temporarily hold Zenoti API integration
    console.log('Payment action held - Zenoti API integration paused')
    return {
      success: true,
      data: validatedData
    }

    /* Original Zenoti API integration - temporarily disabled
    // Call Zenoti API to update membership status
    const response = await fetch(
      `https://api.zenoti.com/v1/invoices/${validatedData.txnid}/transactions`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(validatedData.amount),
          payment_method: 'PayU',
          status: validatedData.status === 'success' ? 'Completed' : 'Failed',
          notes: validatedData.error_Message || 'Payment processed via PayU'
        })
      }
    )

    // Handle rate limiting and other API errors
    if (response.status === 429) {
      console.warn('Zenoti API rate limit exceeded, payment will be processed but status update may be delayed')
      return {
        success: true,
        data: validatedData
      }
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text()
      console.error('Invalid response from Zenoti API:', responseText)
      // If we can't update the status, we should still consider the payment processed
      return {
        success: true,
        data: validatedData
      }
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('Zenoti API error:', data)
      // If we can't update the status, we should still consider the payment processed
      return {
        success: true,
        data: validatedData
      }
    }
    */
  } catch (error) {
    console.error('Error updating membership status:', error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An error occurred while updating membership status'
      }
    }
  }
} 