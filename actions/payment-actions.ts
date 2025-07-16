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

/**
 * Creates a custom payment in Zenoti
 * @param invoiceId - The invoice ID
 * @param amount - The payment amount
 * @param customPaymentId - The custom payment ID
 * @param collectedById - The ID of the employee collecting the payment
 */
export async function makeCustomPayment(invoiceId: string, amount: string, customPaymentId: string, collectedById: string) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `${process.env.ZENOTI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: parseFloat(amount),
      tip_amount: 0.00,
      cash_register_id: null,
      custom_payment_id: customPaymentId,
      additional_data: 'PayU Money',
      collected_by_id: collectedById,
    }),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/payment/custom`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }
      return data
    } else {
      // Handle plain text response
      const textData = await response.text()
      throw new Error(textData || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
}

/**
 * Closes an invoice in Zenoti
 * @param invoiceId - The invoice ID
 * @param closedById - The ID of the employee closing the invoice
 */
export async function closeInvoice(invoiceId: string, closedById: string) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `${process.env.ZENOTI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      is_invoice_closed: true,
      status: 1,
      closed_by_id: closedById
    })
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/close`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }
      return data
    } else {
      // Handle plain text response
      const textData = await response.text()
      throw new Error(textData || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
} 