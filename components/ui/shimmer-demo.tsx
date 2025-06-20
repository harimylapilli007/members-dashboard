import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Skeleton, 
  CardSkeleton, 
  TextSkeleton, 
  ButtonSkeleton, 
  ImageSkeleton,
  MembershipCardSkeleton,
  LoadingGrid 
} from "./skeleton"

export function ShimmerDemo() {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Shimmer Loading Effects</h1>
        <p className="text-muted-foreground">Different shimmer effects you can use throughout your app</p>
      </div>

      {/* Basic Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Skeleton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-[125px] w-full" />
        </CardContent>
      </Card>

      {/* Text Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Text Skeletons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextSkeleton className="h-6 w-3/4" />
          <div className="flex items-center justify-between">
            <TextSkeleton className="h-5 w-1/3" />
            <TextSkeleton className="h-5 w-1/4" />
          </div>
          <TextSkeleton className="h-5 w-2/3" />
        </CardContent>
      </Card>

      {/* Button Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Button Skeletons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <ButtonSkeleton className="h-10 w-32" />
            <ButtonSkeleton className="h-10 w-40" />
            <ButtonSkeleton className="h-10 w-28" />
          </div>
          <ButtonSkeleton className="h-12 w-full" />
        </CardContent>
      </Card>

      {/* Image Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Image Skeletons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImageSkeleton className="aspect-square" />
            <ImageSkeleton className="aspect-video" />
            <ImageSkeleton className="aspect-[16/9]" />
          </div>
        </CardContent>
      </Card>

      {/* Card Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Card Skeletons</CardTitle>
        </CardHeader>
        <CardContent>
          <CardSkeleton className="w-full max-w-sm" />
        </CardContent>
      </Card>

      {/* Membership Card Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Card Skeletons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MembershipCardSkeleton />
            <MembershipCardSkeleton />
            <MembershipCardSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* Loading Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingGrid count={3} />
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Basic Usage:</h4>
            <code className="text-sm">
              {`import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-[250px]" />`}
            </code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Text Skeleton:</h4>
            <code className="text-sm">
              {`import { TextSkeleton } from "@/components/ui/skeleton"

<TextSkeleton className="h-6 w-3/4" />`}
            </code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Button Skeleton:</h4>
            <code className="text-sm">
              {`import { ButtonSkeleton } from "@/components/ui/skeleton"

<ButtonSkeleton className="h-10 w-32" />`}
            </code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Loading Grid:</h4>
            <code className="text-sm">
              {`import { LoadingGrid } from "@/components/ui/skeleton"

<LoadingGrid count={6} />`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 