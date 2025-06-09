interface PaymentInitiateParams {
  name: string;
  price: number;
  firstName: string;
  email: string;
  phone: string;
  invoiceId: string;
}

export const initiatePayment = async (params: PaymentInitiateParams) => {
  try {
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice_id: params.invoiceId,
        amount: params.price,
        product_info: params.name,
        customer_name: params.firstName,
        customer_email: params.email,
        customer_phone: params.phone,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to initiate payment')
    }

    const data = await response.json()
    
    if (data.payment_url) {
      // Redirect to PayU payment page
      window.location.href = data.payment_url
    } else {
      throw new Error('Payment URL not received')
    }
  } catch (error) {
    console.error('Payment initiation error:', error)
    throw error
  }
} 