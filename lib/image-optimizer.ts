// Image optimization utilities
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  const promises = imageUrls.map(url => preloadImage(url))
  await Promise.allSettled(promises)
}

// Optimize image loading for critical images
export const loadCriticalImages = (imageUrls: string[], onLoad?: (url: string) => void) => {
  imageUrls.forEach(url => {
    const img = new Image()
    img.onload = () => onLoad?.(url)
    img.src = url
  })
}

// Check if image is cached
export const isImageCached = (src: string): boolean => {
  const img = new Image()
  img.src = src
  return img.complete
}

// Get optimized image dimensions based on viewport
export const getOptimizedImageSizes = (containerWidth: number): string => {
  if (containerWidth <= 768) return '100vw'
  if (containerWidth <= 1200) return '50vw'
  return '33vw'
} 