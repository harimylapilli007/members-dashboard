import SHA512 from 'crypto-js/sha512'

interface GiftCardPaymentData {
  key: string
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  phone: string
  udf1?: string // recipient_name
  udf2?: string // recipient_email
  udf3?: string // occasion
  udf4?: string // message
  udf5?: string // gift_card_id
  salt: string
  surl: string
  furl: string
  hash?: string
}

export const generateGiftCardHash = (paymentData: GiftCardPaymentData, salt: string): string => {
  const { key, txnid, amount, productinfo, firstname, email, phone, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' } = paymentData
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`
  return SHA512(hashString).toString()
}

export const initiateGiftCardPayment = (giftCardData: {
  giftCardId: string
  amount: number
  productInfo: string
  customerName: string
  customerEmail: string
  customerPhone: string
  recipientName?: string
  recipientEmail?: string
  occasion?: string
  message?: string
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if a payment form is already being processed
      const existingForm = document.getElementById('payu-gift-card-payment-form')
      if (existingForm) {
        reject(new Error('Gift card payment is already being processed. Please wait.'))
        return
      }

      // Check if we have valid PayU credentials
      const payuKey = process.env.PAYU_KEY || '26sF13CI'
      const payuSalt = process.env.PAYU_SALT || '0Rd0lVQEvO'
      
      if (!payuKey || !payuSalt) {
        reject(new Error('Payment gateway configuration is missing. Please contact support.'))
        return
      }

      // Generate unique transaction ID for gift card
      const txnid = `GC_${giftCardData.giftCardId}_${Date.now()}`

      const paymentData: GiftCardPaymentData = {
        key: payuKey,
        txnid: txnid,
        amount: giftCardData.amount.toString(),
        productinfo: giftCardData.productInfo,
        firstname: giftCardData.customerName,
        email: giftCardData.customerEmail,
        phone: giftCardData.customerPhone,
        udf1: giftCardData.recipientName || '',
        udf2: giftCardData.recipientEmail || '',
        udf3: giftCardData.occasion || '',
        udf4: giftCardData.message || '',
        udf5: giftCardData.giftCardId,
        salt: payuSalt, 
        surl: `${window.location.protocol}//${window.location.host}/api/giftcards/payment/success`,
        furl: `${window.location.protocol}//${window.location.host}/api/giftcards/payment/failure`,
      }

      // Generate the hash for the payment
      const hash = generateGiftCardHash(paymentData, paymentData.salt)
      paymentData.hash = hash

      // Store gift card payment details in localStorage for retry functionality
      localStorage.setItem('giftCardPaymentDetails', JSON.stringify({
        amount: paymentData.amount,
        productinfo: paymentData.productinfo,
        firstname: paymentData.firstname,
        email: paymentData.email,
        phone: paymentData.phone,
        txnid: paymentData.txnid,
        recipient_name: paymentData.udf1,
        recipient_email: paymentData.udf2,
        occasion: paymentData.udf3,
        message: paymentData.udf4,
        gift_card_id: paymentData.udf5,
        timestamp: Date.now()
      }))

      // Create a form dynamically with a unique ID
      const form = document.createElement('form')
      form.id = 'payu-gift-card-payment-form'
      form.action = 'https://secure.payu.in/_payment'
      form.method = 'POST'
      form.style.display = 'none'

      // Append payment data to the form as hidden inputs
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
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
          
          resolve()
        } catch (error) {
          // Clean up on error
          if (form.parentNode) {
            form.parentNode.removeChild(form)
          }
          reject(error)
        }
      }, 100) // 100ms delay to prevent rapid submissions

    } catch (error) {
      reject(error)
    }
  })
}

export const verifyGiftCardPayUResponse = (responseData: {
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  status: string
  hash: string
  salt: string
}): boolean => {
  const { txnid, amount, productinfo, firstname, status, hash, salt } = responseData
  
  // Create the hash string in the same order as PayU
  const hashString = `${salt}|${status}|||||||||||${firstname}|${productinfo}|${amount}|${txnid}`
  const calculatedHash = SHA512(hashString).toString()
  
  return calculatedHash === hash
}

// Function to check if gift card payment is in progress
export const isGiftCardPaymentInProgress = (): boolean => {
  return document.getElementById('payu-gift-card-payment-form') !== null
}

// Function to clear any existing gift card payment forms
export const clearGiftCardPaymentForms = (): void => {
  const existingForm = document.getElementById('payu-gift-card-payment-form')
  if (existingForm && existingForm.parentNode) {
    existingForm.parentNode.removeChild(existingForm)
  }
}

// Function to retry gift card payment from localStorage
export const retryGiftCardPayment = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const storedData = localStorage.getItem('giftCardPaymentDetails')
      if (!storedData) {
        reject(new Error('No stored gift card payment data found'))
        return
      }

      const paymentDetails = JSON.parse(storedData)
      const now = Date.now()
      const timeDiff = now - paymentDetails.timestamp

      // Check if stored data is not older than 30 minutes
      if (timeDiff > 30 * 60 * 1000) {
        localStorage.removeItem('giftCardPaymentDetails')
        reject(new Error('Stored payment data has expired. Please start a new payment.'))
        return
      }

      // Retry the payment with stored data
      initiateGiftCardPayment({
        giftCardId: paymentDetails.gift_card_id,
        amount: parseFloat(paymentDetails.amount),
        productInfo: paymentDetails.productinfo,
        customerName: paymentDetails.firstname,
        customerEmail: paymentDetails.email,
        customerPhone: paymentDetails.phone,
        recipientName: paymentDetails.recipient_name,
        recipientEmail: paymentDetails.recipient_email,
        occasion: paymentDetails.occasion,
        message: paymentDetails.message
      }).then(resolve).catch(reject)

    } catch (error) {
      reject(error)
    }
  })
} 