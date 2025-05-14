import { Crown, HelpCircle, MessageSquare, Phone, Send, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SignatureSupport() {
  return (
    <DashboardLayout membershipType="signature">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elite Support</h1>
          <p className="text-muted-foreground">Premium assistance for Signature members.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Concierge</CardTitle>
              <CardDescription>Your dedicated support team is here to help</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Input placeholder="Subject" className="border-amber-200" />
                </div>
                <div>
                  <Textarea 
                    placeholder="How can we assist you today?" 
                    className="min-h-[120px] border-amber-200" 
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" /> Send to Concierge
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Priority Support</CardTitle>
                <CardDescription>Immediate assistance channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Crown className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Elite Support Line</h3>
                    <p className="text-sm text-muted-foreground">24/7 Priority Support</p>
                  </div>
                  <Button>Call Now</Button>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Priority Chat</h3>
                    <p className="text-sm text-muted-foreground">Instant connection to elite support</p>
                  </div>
                  <Button>Start Chat</Button>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Video Consultation</h3>
                    <p className="text-sm text-muted-foreground">Schedule a video call with our experts</p>
                  </div>
                  <Button>Book Call</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elite FAQs</CardTitle>
                <CardDescription>Common questions about premium services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">How do I access my personal concierge?</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your personal concierge is available 24/7 through the Elite Support Line or Priority Chat.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">What are the priority booking benefits?</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Signature members enjoy 48-hour advance booking and guaranteed slots for all services.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">How do I arrange airport transfers?</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Contact your personal concierge at least 24 hours before your wellness stay for complimentary transfers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Elite Support Benefits</CardTitle>
            <CardDescription>Exclusive support privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <Crown className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Personal Concierge</h3>
                <p className="text-sm text-muted-foreground">Dedicated support team for all your needs</p>
              </div>
              <div className="rounded-lg border p-4">
                <Star className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">Priority Resolution</h3>
                <p className="text-sm text-muted-foreground">Fast-track issue resolution for elite members</p>
              </div>
              <div className="rounded-lg border p-4">
                <Phone className="h-5 w-5 text-amber-600 mb-2" />
                <h3 className="font-medium">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Round-the-clock assistance on dedicated lines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 