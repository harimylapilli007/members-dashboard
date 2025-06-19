import { NextRequest, NextResponse } from 'next/server'

interface CreateUserData {
  first_name: string;
  last_name: string;
  mobile_phone: {
    country_code: number;
    number: string;
  };
  email?: string;
  gender?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userData: CreateUserData = body

    if (!userData.first_name || !userData.last_name || !userData.mobile_phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'First name, last name, and mobile phone are required' } 
        },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.zenoti.com/v1/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.ZENOTI_API_KEY}`
      },
      body: JSON.stringify({
        center_id: "92d41019-c790-4668-9158-a693e531c1a4", // Using the admin center ID from the codebase
        personal_info: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          mobile_phone: userData.mobile_phone,
          email: userData.email,
          gender: userData.gender
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { 
          success: false, 
          error: { message: error.message || 'Failed to create user' } 
        },
        { status: response.status }
      )
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Internal server error' } 
      },
      { status: 500 }
    )
  }
} 