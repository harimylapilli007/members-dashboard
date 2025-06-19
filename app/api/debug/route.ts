import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    ZENOTI_API_KEY: process.env.ZENOTI_API_KEY ? 'Set' : 'Not set',
    PAYU_KEY: process.env.PAYU_KEY ? 'Set' : 'Not set',
    PAYU_SALT: process.env.PAYU_SALT ? 'Set' : 'Not set',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
  }

  return NextResponse.json({
    message: 'Environment variables status',
    environment: envVars,
    timestamp: new Date().toISOString()
  })
} 