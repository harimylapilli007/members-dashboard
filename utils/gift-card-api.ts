// Gift Card API utilities for frontend

export interface GiftCardPaymentRequest {
  gift_card_id: string
  amount: number
  product_info: string
  customer_name: string
  customer_email: string
  customer_phone: string
  recipient_name?: string
  recipient_email?: string
  occasion?: string
  message?: string
}

export interface GiftCardPaymentResponse {
  success: boolean
  payment_data?: {
    key: string
    txnid: string
    amount: string
    productinfo: string
    firstname: string
    email: string
    phone: string
    surl: string
    furl: string
    hash: string
  }
  payment_url?: string
  error?: {
    message: string
  }
}

export interface GiftCardDetails {
  id: string
  amount: number
  recipient_name: string
  recipient_email: string
  occasion: string
  message: string
  purchased_by: string
  purchased_email: string
  status: string
  created_date: string
  expiry_date: string
  balance: number
  is_active: boolean
}

// Initiate gift card payment
export const initiateGiftCardPayment = async (paymentData: GiftCardPaymentRequest): Promise<GiftCardPaymentResponse> => {
  try {
    const response = await fetch('/api/giftcards/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error initiating gift card payment:', error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to initiate payment'
      }
    }
  }
}

// Get gift card details by ID
export const getGiftCardDetails = async (giftCardId: string): Promise<{
  success: boolean
  gift_card?: GiftCardDetails
  error?: { message: string }
}> => {
  try {
    const response = await fetch(`/api/giftcards/${giftCardId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching gift card details:', error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch gift card details'
      }
    }
  }
}

// Example usage function for initiating gift card payment
export const purchaseGiftCard = async (giftCardData: {
  giftCardId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  recipientName?: string
  recipientEmail?: string
  occasion?: string
  message?: string
}) => {
  try {
    const paymentRequest: GiftCardPaymentRequest = {
      gift_card_id: giftCardData.giftCardId,
      amount: giftCardData.amount,
      product_info: `Gift Card - ${giftCardData.occasion || 'General'}`,
      customer_name: giftCardData.customerName,
      customer_email: giftCardData.customerEmail,
      customer_phone: giftCardData.customerPhone,
      recipient_name: giftCardData.recipientName,
      recipient_email: giftCardData.recipientEmail,
      occasion: giftCardData.occasion,
      message: giftCardData.message
    }

    const response = await initiateGiftCardPayment(paymentRequest)
    
    if (response.success && response.payment_data) {
      // Redirect to PayU payment gateway
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = response.payment_url || 'https://secure.payu.in/_payment'
      form.style.display = 'none'

      // Add payment data as hidden inputs
      Object.entries(response.payment_data).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } else {
      throw new Error(response.error?.message || 'Payment initiation failed')
    }
  } catch (error) {
    console.error('Error purchasing gift card:', error)
    throw error
  }
}

// Function to check payment status from URL parameters
export const getPaymentStatusFromURL = () => {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  return {
    txnid: urlParams.get('txnid'),
    amount: urlParams.get('amount'),
    status: urlParams.get('status'),
    error_Message: urlParams.get('error_Message'),
    error_code: urlParams.get('error_code'),
    recipient_name: urlParams.get('recipient_name'),
    recipient_email: urlParams.get('recipient_email'),
    occasion: urlParams.get('occasion'),
    message: urlParams.get('message'),
    gift_card_id: urlParams.get('gift_card_id')
  }
} 