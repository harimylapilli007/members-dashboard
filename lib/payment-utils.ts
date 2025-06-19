import SHA512 from 'crypto-js/sha512'

interface PaymentData {
  key: string
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  phone: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
  salt: string
  surl: string
  furl: string
  hash?: string
}

export const generateHash = (paymentData: PaymentData, salt: string): string => {
  const { key, txnid, amount, productinfo, firstname, email, phone, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' } = paymentData
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`
  return SHA512(hashString).toString()
}

export const initiatePayment = (membershipData: {
  name: string
  price: number
  firstName: string
  email: string
  phone: string
  invoiceId: string
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if a payment form is already being processed
      const existingForm = document.getElementById('payu-payment-form')
      if (existingForm) {
        reject(new Error('Payment is already being processed. Please wait.'))
        return
      }

      // Check if we have valid PayU credentials
      const payuKey = process.env.PAYU_KEY || ''
      const payuSalt = process.env.PAYU_SALT || ''
      
      if (!payuKey || !payuSalt) {
        reject(new Error('Payment gateway configuration is missing. Please contact support.'))
        return
      }

      const paymentData: PaymentData = {
        key: payuKey,
        txnid: membershipData.invoiceId,
        amount: membershipData.price.toString(),
        productinfo: membershipData.name,
        firstname: membershipData.firstName,
        email: membershipData.email,
        phone: membershipData.phone,
        salt: payuSalt, 
        surl: `${window.location.protocol}//${window.location.host}/api/payment/success`,
        furl: `${window.location.protocol}//${window.location.host}/api/payment/failure`,
      }

      // Generate the hash for the payment
      const hash = generateHash(paymentData, paymentData.salt)
      paymentData.hash = hash

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

export const verifyPayUResponse = (responseData: {
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

// Function to check if payment is in progress
export const isPaymentInProgress = (): boolean => {
  return document.getElementById('payu-payment-form') !== null
}

// Function to clear any existing payment forms
export const clearPaymentForms = (): void => {
  const existingForm = document.getElementById('payu-payment-form')
  if (existingForm && existingForm.parentNode) {
    existingForm.parentNode.removeChild(existingForm)
  }
} 