"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
  Hotel,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'

interface DashboardLayoutProps {
  children: React.ReactNode
  membershipType: string
}

export function DashboardLayout({ children, membershipType }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const membershipColor =
    {
      essential: "text-amber-600",
      classic: "text-amber-600",
      signature: "text-amber-600",
    }[membershipType] || "text-amber-600"

  const membershipTitle =
    {
      essential: "Essential",
      classic: "Classic",
      signature: "Signature",
    }[membershipType] || "Member"

  const routes = [
    {
      href: `/dashboard/${membershipType}`,
      label: "Overview",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${membershipType}/resorts`,
      label: "Resorts",
      icon: <Hotel className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${membershipType}/bookings`,
      label: "Bookings",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${membershipType}/wellness`,
      label: "Wellness Program",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${membershipType}/vouchers`,
      label: "Vouchers",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${membershipType}/support`,
      label: "Support",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${membershipType}/settings`,
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Success",
        description: "Successfully logged out",
      })
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex flex-1 items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-2 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex items-center border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl font-bold">Ode Life</span>
                  </Link>
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close navigation menu</span>
                  </Button>
                </div>
                <nav className="flex flex-col gap-2 py-4">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname === route.href
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Ode Life</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-4 md:flex">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="text-sm font-medium">Ode Life {membershipTitle}</div>
                <div className={`text-xs ${membershipColor}`}>Premium Member</div>
              </div>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex h-14 items-center border-b px-4 py-2">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center`}>
                  <span className={`text-sm font-medium ${membershipColor}`}>{membershipTitle.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Ode Life {membershipTitle}</div>
                  <div className={`text-xs ${membershipColor}`}>Premium Member</div>
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-2 py-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    pathname === route.href
                      ? "bg-background font-medium text-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }`}
                >
                  {route.icon}
                  {route.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
