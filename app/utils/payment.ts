interface PaymentInitiateParams {
  name: string;
  amount: number;
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
        amount: params.amount,
        product_info: params.name,
        customer_name: params.firstName,
        customer_email: params.email,
        customer_phone: params.phone,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to initiate payment')
    }

    const data = await response.json()
    
    if (data.success && data.payment_data) {
      // Create payment form with the data from API
      const paymentData = data.payment_data
      
      // Check if a payment form is already being processed
      const existingForm = document.getElementById('payu-payment-form')
      if (existingForm) {
        throw new Error('Payment is already being processed. Please wait.')
      }

      // Store payment details in localStorage for retry functionality
      localStorage.setItem('paymentDetails', JSON.stringify({
        amount: paymentData.amount,
        productinfo: paymentData.productinfo,
        firstname: paymentData.firstname,
        email: paymentData.email,
        phone: paymentData.phone,
        txnid: paymentData.txnid,
        timestamp: Date.now()
      }))

      // Create a form dynamically with a unique ID
      const form = document.createElement('form')
      form.id = 'payu-payment-form'
      form.action = 'https://secure.payu.in/_payment'
      form.method = 'POST'
      form.style.display = 'none'

      // Append payment data to the form as hidden inputs
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = String(value)
        form.appendChild(input)
      })

      // Add a small delay to prevent rapid submissions
      setTimeout(() => {
        try {
          // Append the form to the body and submit it
          document.body.appendChild(form)
          form.submit()
          
          // Clean up the form after submission
          setTimeout(() => {
            if (form.parentNode) {
              form.parentNode.removeChild(form)
            }
          }, 1000)
        } catch (error) {
          // Clean up on error
          if (form.parentNode) {
            form.parentNode.removeChild(form)
          }
          throw error
        }
      }, 100) // 100ms delay to prevent rapid submissions
    } else {
      throw new Error('Payment data not received from server')
    }
  } catch (error) {
    console.error('Payment initiation error:', error)
    throw error
  }
} 