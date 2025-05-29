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
}) => {
  const paymentData: PaymentData = {
    key: '26sF13CI',
    txnid: membershipData.invoiceId,
    // amount: membershipData.price.toString(),
    amount: '1',
    productinfo: membershipData.name,
    firstname: membershipData.firstName,
    email: membershipData.email,
    phone: membershipData.phone,
    salt: '0Rd0lVQEvO',
    surl: `${window.location.protocol}//${window.location.host}/api/payment/success`,
    furl: `${window.location.protocol}//${window.location.host}/api/payment/failure`,
  }

  // Generate the hash for the payment
  const hash = generateHash(paymentData, paymentData.salt)
  paymentData.hash = hash

  // Create a form dynamically
  const form = document.createElement('form')
  form.action = 'https://secure.payu.in/_payment'
  form.method = 'POST'

  // Append payment data to the form as hidden inputs
  Object.entries(paymentData).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })

  // Append the form to the body and submit it
  document.body.appendChild(form)
  form.submit()
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