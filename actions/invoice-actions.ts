"use server"

import { z } from "zod"

// Validation schema for invoice retrieval
const invoiceSchema = z.object({
  invoice_id: z.string().min(1, "Invoice ID is required"),
})

// Interface for invoice response
interface InvoiceResponse {
  success: boolean
  data?: {
    id: string
    receipt_no: string
    status: number
    items?: Array<{
      id: string
      name: string
      quantity: number
      price: number
      total: number
    }>
    transactions?: Array<{
      id: string
      amount: number
      payment_method: string
      status: string
      created_at: string
    }>
  }
  error?: {
    message: string
  }
}

/**
 * Retrieves invoice details from Zenoti API
 * @param invoice_id - The ID of the invoice to retrieve
 * @returns Promise containing the invoice details or error
 */
export async function getInvoiceDetails(invoice_id: string): Promise<InvoiceResponse> {
  try {
    // Validate input
    const validatedData = invoiceSchema.parse({ invoice_id })

    const response = await fetch(
      `https://api.zenoti.com/v1/invoices/${validatedData.invoice_id}?expand=InvoiceItems&expand=Transactions`,
      {
        headers: {
          'Authorization': `${process.env.ZENOTI_API_KEY}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch invoice details')
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching invoice details:', error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An error occurred while fetching invoice details'
      }
    }
  }
} 