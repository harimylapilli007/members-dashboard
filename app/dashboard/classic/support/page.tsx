import { HelpCircle, MessageSquare, Phone, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ClassicSupport() {
  return (
    <DashboardLayout membershipType="classic">
      <div className="container p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground">Get help with your membership and services.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Send us a message and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Input placeholder="Subject" />
                </div>
                <div>
                  <Textarea placeholder="Describe your issue or question..." className="min-h-[120px]" />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Support</CardTitle>
                <CardDescription>Get immediate assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Call Support</h3>
                    <p className="text-sm text-muted-foreground">24/7 Priority Support Line</p>
                  </div>
                  <Button variant="outline">Call Now</Button>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Chat with a support agent</p>
                  </div>
                  <Button variant="outline">Start Chat</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQs</CardTitle>
                <CardDescription>Common questions and answers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">How do I book a spa session?</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You can book a spa session through the Bookings page or by calling our support line.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">Can I transfer my membership?</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Annual spa memberships can be transferred to friends or family through the Vouchers page.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium">How do I redeem my realty voucher?</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Visit the Vouchers page and click on "Redeem Now" under the Ridhira Realty Voucher section.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 