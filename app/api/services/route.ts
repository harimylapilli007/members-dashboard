import { NextResponse } from 'next/server'
import { generateCacheKey } from '@/app/utils/api'

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to fetch with retry
async function fetchWithRetry(url: string, options: RequestInit, cacheKey: string, maxRetries = 3) {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }

      // Validate services array
      if (!data.services || !Array.isArray(data.services)) {
        throw new Error('Invalid services data format')
      }
      
      return data
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i < maxRetries - 1) {
        await delay(1000 * Math.pow(2, i)) // Exponential backoff
      }
    }
  }
  
  throw lastError
}

// Helper function to categorize services
function categorizeServices(allData: any[]) {
  if (!Array.isArray(allData)) {
    console.error('Invalid data format for categorization:', allData)
    return {}
  }

  const categories: { [key: string]: string[] } = {
    "Spa Therapies": ["massage", "reflexology", "champi", "aromatherapy", "balinese", "deep tissue", "swedish", "thai", "head massage", "foot massage", "neck and back", "neck and back massage", "cream massage", "dry massage", "junior massage"],
    "Spa Facial": ["facial", "mask", "whitening", "detox", "charcoal", "peppermint", "organic", "rejuvenating", "cleansing", "24 carat gold facial", "anti aging facial", "deep cleansing facial", "gentleman's facial", "charcoal facial","bleach", "de-tan"],
    "Saloon Services": ["hair", "styling", "color", "rebonding", "keratin", "straightening", "blow dry", "root touchup", "scalp treatment", "hair fall", "trimming", "shaving", "haircut","mehndi", "bridal mehndi", "mehndi per hand", "special occasion", "stylists","makeup", "saree drape", "beard styling", "mehendi", "bridal"],
    "Hand & Feet": ["manicure", "pedicure", "nailcut", "polish", "filing", "spa manicure", "spa pedicure", "french manicure", "french pedicure"],
    "Scrubs & Wraps": ["whitening wrap", "charcoal scrub", "charcoal wrap", "detox treatment", "scrub","detox", "detox treatment", "body detox","waxing", "threading", "bikini", "underarms", "full body", "arms", "legs"],
    "Other Services": ["balm", "event", "hot rollers", "ironing", "tonging", "cleanser", "peel off"]
  }

  const categorizedServices: { [key: string]: any[] } = {}
  for (const category in categories) categorizedServices[category] = []

  allData.forEach(service => {
    if (!service || typeof service !== 'object') {
      console.warn('Invalid service object:', service)
      return
    }

    const name = (service.name || '').toLowerCase()
    const description = (service.description || '').toLowerCase()
    let matchedCategory = "Other Services"
    
    for (const category in categories) {
      if (categories[category].some(keyword => name.includes(keyword) || description.includes(keyword))) {
        matchedCategory = category
        break
      }
    }
    
    categorizedServices[matchedCategory].push({
      id: service.id || '',
      name: service.name || '',
      final_price: service.price_info?.price_without_tax || service.price || 0,
      duration: service.duration || 0,
      description: service.description || ''
    })
  })

  return categorizedServices
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('centerId')

    if (!centerId) {
      return NextResponse.json(
        { error: 'Missing centerId parameter' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ZENOTI_API_KEY
    console.log('Environment check:', {
      ZENOTI_API_KEY: apiKey ? 'Present' : 'Missing',
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      key: apiKey
    })
    
    if (!apiKey) {
      console.error('ZENOTI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          error: 'API configuration error',
          details: 'ZENOTI_API_KEY environment variable is not configured',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    let allData: any[] = []
    let currentPage = 1
    const pageSize = 100
    const headers = {
      Authorization: apiKey,
      accept: "application/json",
    }

    while (true) {
      try {
        const url = `https://api.zenoti.com/v1/Centers/${centerId}/services?page=${currentPage}&size=${pageSize}`
        const cacheKey = generateCacheKey(url, { centerId, page: currentPage })
        
        const data = await fetchWithRetry(url, { 
          method: "GET", 
          headers 
        }, cacheKey)

        const services = data.services
        if (!services || services.length === 0) break

        allData = [...allData, ...services]
        if (services.length < pageSize) break
        currentPage++
      } catch (error) {
        console.error(`Error fetching services page ${currentPage}:`, error)
        throw error
      }
    }

    if (allData.length === 0) {
      console.error('No services found for centerId:', centerId)
      return NextResponse.json(
        { error: 'No services found for this center' },
        { status: 404 }
      )
    }

    const categorizedServices = categorizeServices(allData)

    return NextResponse.json({
      services: categorizedServices
    })
  } catch (error) {
    console.error('Error in services API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 