import { Activity, Crown, Heart, Scale, Star, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SignatureWellness() {
  return (
    <DashboardLayout membershipType="signature">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elite Wellness Program</h1>
          <p className="text-muted-foreground">Experience premium wellness services and exclusive benefits.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elite Status</CardTitle>
              <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Platinum</div>
              <p className="text-xs text-muted-foreground">Premium Member Benefits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95/100</div>
              <p className="text-xs text-muted-foreground">Elite Performance Level</p>
              <Progress className="mt-2" value={95} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Index</CardTitle>
              <Heart className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Optimal</div>
              <p className="text-xs text-muted-foreground">Based on premium health assessment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elite Points</CardTitle>
              <Crown className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,500</div>
              <p className="text-xs text-muted-foreground">Redeemable for premium services</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Elite Journey</CardTitle>
              <CardDescription>Your premium wellness achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Crown className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Platinum Status Achieved</h3>
                    <p className="text-sm text-muted-foreground">Unlocked on April 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">90-Day Wellness Challenge</h3>
                    <p className="text-sm text-muted-foreground">Completed on March 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Heart className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Premium Health Assessment</h3>
                    <p className="text-sm text-muted-foreground">Completed on February 1, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Programs</CardTitle>
              <CardDescription>Exclusive wellness experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Luxury Wellness Retreat</h3>
                  <p className="text-sm text-muted-foreground mb-4">1-week premium wellness program with luxury accommodation</p>
                  <div className="flex items-center justify-between">
                    <Button className="flex-1">Book Retreat</Button>
                    <Button variant="outline" className="ml-2">View Details</Button>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Personal Wellness Concierge</h3>
                  <p className="text-sm text-muted-foreground mb-4">Dedicated wellness planning and assistance</p>
                  <div className="flex items-center justify-between">
                    <Button className="flex-1">Schedule Call</Button>
                    <Button variant="outline" className="ml-2">Learn More</Button>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Elite Health Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">Comprehensive health and wellness evaluation</p>
                  <div className="flex items-center justify-between">
                    <Button className="flex-1">Book Assessment</Button>
                    <Button variant="outline" className="ml-2">View Package</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Elite Benefits</CardTitle>
            <CardDescription>Exclusive perks for Signature members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <Star className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Priority Access</h3>
                <p className="text-sm text-muted-foreground">Guaranteed slots for all wellness services</p>
              </div>
              <div className="rounded-lg border p-4">
                <Crown className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Personal Concierge</h3>
                <p className="text-sm text-muted-foreground">24/7 dedicated wellness assistance</p>
              </div>
              <div className="rounded-lg border p-4">
                <Trophy className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Elite Rewards</h3>
                <p className="text-sm text-muted-foreground">Exclusive rewards and premium upgrades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 