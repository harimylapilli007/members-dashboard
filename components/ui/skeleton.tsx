import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer-effect animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton components for different use cases
function CardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer-card rounded-lg overflow-hidden", className)}
      {...props}
    />
  )
}

function TextSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer-text rounded", className)}
      {...props}
    />
  )
}

function ButtonSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer-button rounded-lg", className)}
      {...props}
    />
  )
}

function ImageSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer-card relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-30" />
    </div>
  )
}

// Membership card skeleton component
function MembershipCardSkeleton() {
  return (
    <div className="group overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] border-0 bg-white/50 rounded-lg skeleton-container">
      <div className="p-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <ImageSkeleton className="absolute inset-0 w-full h-full" />
        </div>
        <div className="p-4 space-y-4">
          <div className="h-6 w-3/4 shimmer-text rounded" />
          <div className="flex items-center justify-between">
            <div className="h-5 w-1/3 shimmer-text rounded" />
            <div className="h-5 w-1/4 shimmer-text rounded" />
          </div>
          <div className="flex items-center mt-4 relative h-[24px]">
            <div className="h-5 w-2/3 shimmer-text rounded" />
          </div>
          <div className="flex items-center justify-center text-center mx-auto mt-4">
            <div className="h-10 w-full shimmer-button rounded border border-gray-200" />
          </div>
          <div className="flex justify-center mt-4">
            <div className="h-10 w-full shimmer-button rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced membership card skeleton that matches the actual design
function EnhancedMembershipCardSkeleton() {
  return (
    <div className="group overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] border-0 bg-white/50 rounded-lg card-transition membership-skeleton">
      <div className="p-0">
        {/* Image skeleton with gradient overlay */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <div className="absolute inset-0 shimmer-card">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 opacity-60" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="p-4 space-y-4">
          {/* Membership name skeleton */}
          <div className="h-7 w-4/5 shimmer-text rounded" />
          
          {/* Price and validity row */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-2/5 shimmer-text rounded" />
            <div className="h-5 w-1/3 shimmer-text rounded" />
          </div>
          
          {/* Offer text skeleton with proper height */}
          <div className="flex items-center mt-4 relative h-[24px]">
            <div className="h-5 w-3/4 shimmer-text rounded" />
          </div>
          
          {/* View Details button skeleton */}
          <div className="flex items-center justify-center text-center mx-auto mt-4">
            <div className="h-10 w-full shimmer-button rounded border border-gray-200 bg-white/20" />
          </div>
          
          {/* Buy Membership button skeleton with gradient */}
          <div className="flex justify-center mt-4">
            <div className="h-10 w-full shimmer-button rounded bg-gradient-to-r from-gray-200 to-gray-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced loading grid skeleton with better responsive design
function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0 items-stretch max-w-[1100px] mx-auto">
      {Array.from({ length: count }).map((_, index) => (
        <EnhancedMembershipCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Demo component to showcase skeleton loading
function SkeletonDemo() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 max-w-[1100px] mx-auto">
        <h2 className="text-[#454545] mb-4 font-inter">{"Here's everything you need to live the Ode Life, seamlessly."}</h2>
        <h1 className="text-2xl md:text-3xl font-marcellus text-[#232323] mb-2">Available Memberships</h1>
        <h2 className="text-[#454545] font-inter">Explore our membership options</h2>
      </div>
      
      {isLoading ? (
        <LoadingGrid count={6} />
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 mb-4">Content loaded successfully!</p>
          <button 
            onClick={() => setIsLoading(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Show Skeleton Again
          </button>
        </div>
      )}
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  TextSkeleton, 
  ButtonSkeleton, 
  ImageSkeleton,
  MembershipCardSkeleton,
  EnhancedMembershipCardSkeleton,
  LoadingGrid,
  SkeletonDemo
}
