import { Activity, Heart, Scale, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ClassicWellness() {
  return (
    <DashboardLayout membershipType="classic">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wellness Program</h1>
          <p className="text-muted-foreground">Track your wellness journey and achievements.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82/100</div>
              <p className="text-xs text-muted-foreground">Weekly Activity Level</p>
              <Progress className="mt-2" value={82} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Health</CardTitle>
              <Heart className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Excellent</div>
              <p className="text-xs text-muted-foreground">Based on latest check-up</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BMI Status</CardTitle>
              <Scale className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23.5</div>
              <p className="text-xs text-muted-foreground">Normal Range</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Points</CardTitle>
              <Trophy className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">Redeemable Points</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Journey</CardTitle>
              <CardDescription>Your wellness milestones and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">30-Day Fitness Challenge</h3>
                    <p className="text-sm text-muted-foreground">Completed on June 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Heart className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Heart Health Milestone</h3>
                    <p className="text-sm text-muted-foreground">Achieved on May 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Perfect Activity Week</h3>
                    <p className="text-sm text-muted-foreground">Achieved on April 20, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wellness Programs</CardTitle>
              <CardDescription>Available wellness programs and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">1-Week Wellness Retreat</h3>
                  <p className="text-sm text-muted-foreground mb-4">Comprehensive wellness program with accommodation</p>
                  <Button className="w-full">Book Program</Button>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Nutrition Consultation</h3>
                  <p className="text-sm text-muted-foreground mb-4">Personal nutrition planning and guidance</p>
                  <Button className="w-full">Schedule Session</Button>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Fitness Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">Complete body composition analysis</p>
                  <Button className="w-full">Book Assessment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 