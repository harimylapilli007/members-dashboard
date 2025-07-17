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
  udf1?: string // recipient_name
  udf2?: string // recipient_email
  udf3?: string // occasion
  udf4?: string // message
  udf5?: string // gift_card_id
}

// Function to create custom payment
async function makeCustomPayment(invoiceId: string, amount: string, customPaymentId: string, collectedById: string) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: parseFloat(amount),
      tip_amount: 0.00,
      cash_register_id: null,
      custom_payment_id: customPaymentId,
      additional_data: 'PayU Money - Gift Card',
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
      Authorization: `apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283`,
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

// Function to send gift card email
async function sendGiftCardEmail(invoiceId: string) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283`
    }
  };

  console.log('Sending gift card email with options:', {
    url: `https://api.zenoti.com/v1/invoices/${invoiceId}/send_giftcard_email`
  });

  const response = await fetch(`https://api.zenoti.com/v1/invoices/${invoiceId}/send_giftcard_email`, options);
  const data = await response.json();
  
  console.log('Send gift card email response:', {
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
    console.log('PayU Gift Card Success Response Parameters:', {
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

      // Send gift card email to the guest
      try {
        const emailResult = await sendGiftCardEmail(responseData.txnid);
        
        if (emailResult.error) {
          console.error('Send gift card email failed:', emailResult.error);
          // Don't throw error here as the payment is still successful
        } else {
          console.log('Gift card email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending gift card email:', emailError);
        // Don't throw error here as the payment is still successful
      }

      // Update gift card status in our system
    //   await updateGiftCardStatus(responseData);

    } catch (zenotiError) {
      console.error('Error processing Zenoti payment:', zenotiError);
      // Continue with success flow even if Zenoti API fails
      // The payment is still successful from PayU's perspective
    }

    // Construct the redirect URL with success parameters
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
    
    // Add gift card specific parameters
    if (responseData.udf1) params.append('recipient_name', responseData.udf1)
    if (responseData.udf2) params.append('recipient_email', responseData.udf2)
    if (responseData.udf3) params.append('occasion', responseData.udf3)
    if (responseData.udf4) params.append('message', responseData.udf4)
    if (responseData.udf5) params.append('gift_card_id', responseData.udf5)
    
    params.append('error_Message', 'Gift card payment processed successfully')

    const redirectUrl = `/gift-cards/payment/success?${params.toString()}`

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
    console.error('Error processing gift card payment success:', error)
    const params = new URLSearchParams()
    
    try {
      const formData = await request.formData()
      const responseData = Object.fromEntries(formData.entries()) as unknown as PayUResponse
      if (responseData.txnid) {
        params.append('txnid', responseData.txnid)
      }
      if (responseData.udf5) {
        params.append('gift_card_id', responseData.udf5)
      }
    } catch (e) {
      console.error('Error getting txnid from request:', e)
    }
    
    params.append('error_Message', error instanceof Error ? error.message : 'An error occurred while processing gift card payment')
    
    const redirectUrl = `/gift-cards/payment/failure?${params.toString()}`

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
