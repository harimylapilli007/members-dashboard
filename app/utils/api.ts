import { LRUCache } from 'lru-cache';
import { toast } from "@/hooks/use-toast";

// Cache configuration
const cache = new LRUCache<string, any>({
  max: 500, // Maximum number of items to store
  ttl: 1000 * 60 * 5, // Time to live: 5 minutes
});

// Request queue to prevent too many concurrent requests
let requestQueue: Promise<any>[] = [];
const MAX_CONCURRENT_REQUESTS = 5;

// Exponential backoff configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 30000; // 30 seconds

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  cacheKey?: string
): Promise<any> {
  // Check cache first if cacheKey is provided
  if (cacheKey) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // Wait if we have too many concurrent requests
  while (requestQueue.length >= MAX_CONCURRENT_REQUESTS) {
    await Promise.race(requestQueue);
  }

  let retryCount = 0;
  let delay = INITIAL_RETRY_DELAY;

  while (retryCount < MAX_RETRIES) {
    let currentRequest: Promise<any> | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Request timed out after ${REQUEST_TIMEOUT}ms`));
        }, REQUEST_TIMEOUT);
      });

      // Add request to queue with timeout
      currentRequest = Promise.race([
        fetch(url, options),
        timeoutPromise
      ]);
      requestQueue.push(currentRequest);

      const response = await currentRequest;
      
      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Remove request from queue
      requestQueue = requestQueue.filter(p => p !== currentRequest);

      if (response.status === 429) {
        // Rate limit hit - implement exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Double the delay for next retry
        retryCount++;
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please refresh the page or select another date to try again.",
        });
        return null;
      }

      const data = await response.json();

      // Cache the response if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, data);
      }

      return data;
    } catch (error: unknown) {
      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Remove request from queue on error
      if (currentRequest) {
        requestQueue = requestQueue.filter(p => p !== currentRequest);
      }
      
      if (retryCount === MAX_RETRIES - 1) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please refresh the page or select another date to try again.",
        });
        return null;
      }
      
      // Only retry on network errors or timeouts
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('timed out'))) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        retryCount++;
      } else {
        // Don't retry on other errors
        throw error;
      }
    }
  }

  throw new Error('Max retries reached');
}

// Helper function to generate cache key
export function generateCacheKey(url: string, params?: Record<string, any>): string {
  return `${url}${params ? JSON.stringify(params) : ''}`;
} 