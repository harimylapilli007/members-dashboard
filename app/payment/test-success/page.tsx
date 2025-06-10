"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TestSuccess() {
  const router = useRouter()

  useEffect(() => {
    // Create test parameters
    const params = new URLSearchParams({
      txnid: 'TEST_TXN_' + Date.now(),
      amount: '1000',
      productinfo: 'Test Membership',
      firstname: 'Test User',
      email: 'test@example.com',
      status: 'success',
      hash: 'test_hash',
      mihpayid: 'TEST_PAY_' + Date.now()
    })

    // Redirect to success page with test parameters
    router.push(`/payment/success?${params.toString()}`)
  }, [router])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Success Page...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you with test data.</p>
      </div>
    </div>
  )
} 