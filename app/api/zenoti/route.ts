import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  try {
    console.log('Making request to Zenoti API with phone:', phone);
    console.log('Using API key:', process.env.ZENOTI_API_KEY ? 'API key exists' : 'API key is missing');

    const response = await fetch(`https://api.zenoti.com/v1/guests/search?phone=${phone}`, {
      headers: {
        'Authorization': `apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283`,
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zenoti API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json({ 
        error: 'Zenoti API error', 
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Zenoti:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data from Zenoti',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 