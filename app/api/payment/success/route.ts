import { NextResponse } from 'next/server'
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
  payment_method?: string
  bankcode?: string
}

// Function to create custom payment
async function makeCustomPayment(invoiceId: string, amount: string, customPaymentId: string, collectedById: string) {
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

  console.log('Making custom payment with options:', {
    url: `https://api.zenoti.com/v1/invoices/${invoiceId}/payment/custom`,
    requestBody: options.body
  });

  const response = await fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/payment/custom`, options);
  const data = await response.json();
  
  console.log('Custom payment response:', {
    status: response.status,
    statusText: response.statusText,
    data: data
  });

  return data;
}

// Function to close the invoice
async function closeInvoice(invoiceId: string, closedById: string) {
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

  console.log('Closing invoice with options:', {
    url: `https://api.zenoti.com/v1/invoices/${invoiceId}/close`,
    requestBody: options.body
  });

  const response = await fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/close`, options);
  const data = await response.json();
  
  console.log('Close invoice response:', {
    status: response.status,
    statusText: response.statusText,
    data: data
  });

  return data;
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
    // const isValid = verifyPayUResponse({
    //   txnid: responseData.txnid,
    //   amount: responseData.amount,
    //   productinfo: responseData.productinfo,
    //   firstname: responseData.firstname,
    //   status: responseData.status,
    //   hash: responseData.hash,
    //   salt: '0Rd0lVQEvO'
    // })

    // console.log('isValid', isValid)

    // if (!isValid) {
    //   console.log('Payment verification failed - invalid hash');
    //   // Redirect to failure page with error information
    //   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    //   const params = new URLSearchParams()
    //   if (responseData.txnid) {
    //     params.append('txnid', responseData.txnid)
    //   }
    //   params.append('error_Message', 'Invalid payment response')

    //   const redirectUrl = `${baseUrl}/payment/failure?${params.toString()}`
    //   return new Response(null, {
    //     status: 302,
    //     headers: {
    //       'Location': redirectUrl,
    //       'Cache-Control': 'no-store, no-cache, must-revalidate',
    //       'Pragma': 'no-cache'
    //     }
    //   })
    // }

    // Process payment with Zenoti API
    try {
      const collectedById = 'b41ef1f0-ba77-4df3-ad4a-c74edb3c0252'; // Employee ID ---  .API
      const customPaymentId = 'cd817708-9de6-4152-9845-23c25b9f8e1b' // Custom Payment ID

      console.log('Starting Zenoti payment processing:', {
        invoiceId: responseData.txnid,
        amount: responseData.amount,
        customPaymentId,
        collectedById
      });

      // Create custom payment
      const paymentResult = await makeCustomPayment(
        responseData.txnid,
        responseData.amount,
        customPaymentId,
        collectedById
      );

      if (paymentResult.error) {
        console.error('Custom payment failed:', paymentResult.error);
        throw new Error(paymentResult.error);
      }

      console.log('Custom payment successful, proceeding to close invoice');

      // Close the invoice
      const closeResult = await closeInvoice(responseData.txnid, collectedById);

      if (closeResult.error) {
        console.error('Close invoice failed:', closeResult.error);
        throw new Error(closeResult.error);
      }

      console.log('Invoice closed successfully');

      // Update membership status in our system
    //   await updateMembershipStatus(responseData);

    } catch (zenotiError) {
      console.error('Error processing Zenoti payment:', zenotiError);
      // Continue with success flow even if Zenoti API fails
      // The payment is still successful from PayU's perspective
    }

    // Construct the redirect URL with success parameters
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    
    // Add all relevant payment information
    if (responseData.txnid) {
      params.append('txnid', responseData.txnid)
    }
    params.append('amount', responseData.amount)
    params.append('status', responseData.status)
    params.append('productinfo', responseData.productinfo)
    params.append('firstname', responseData.firstname)
    params.append('email', responseData.email)
    params.append('payment_method', responseData.payment_method || responseData.bankcode || 'UPI')
    if (responseData.mihpayid) {
      params.append('mihpayid', responseData.mihpayid)
    }
    params.append('error_Message', 'Payment processed successfully')

    const redirectUrl = `/payment/success?${params.toString()}`

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
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    
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
    
    const redirectUrl = `/payment/failure?${params.toString()}`

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