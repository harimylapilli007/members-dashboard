"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useToast } from "@/hooks/use-toast"
import { 
  Bell, 
  Lock, 
  User, 
  UserCog, 
  LogOut, 
  Crown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  Shield,
  Settings as SettingsIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Header from "@/app/components/Header"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [membershipData, setMembershipData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('userData')
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setUserData(parsedData)
        setFormData({
          firstName: parsedData.first_name || '',
          lastName: parsedData.last_name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || ''
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Clear all local storage data
      localStorage.removeItem('userData')
      localStorage.removeItem('guestId')
      localStorage.removeItem('dashboardParams')
      localStorage.removeItem('selectedArea')
      localStorage.removeItem('bookingFor')
      localStorage.removeItem('selectedCategory')
      localStorage.removeItem('selectedLocation')
      
      // Clear the auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      
      // Sign out from Firebase
      await signOut(auth)
      await logout()
      
      toast({
        variant: "default",
        title: "Success",
        description: "Successfully logged out",
      })
      
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the user profile
    toast({
      variant: "default",
      title: "Success",
      description: "Profile updated successfully",
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a07735] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-30"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          minHeight: "100vh",
          width: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-40"
        style={{
          background: "linear-gradient(120deg, rgba(245, 241, 232, 0.85) 0%, rgba(229, 231, 235, 0.85) 60%, rgba(178, 213, 228, 0.85) 100%)"
        }}
      />
      {/* Subtle blurred circles */}
      <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full blur-sm -z-30" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />

      <Header />

      <div className="container p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-marcellus text-[#232323] mb-2">Profile & Settings</h1>
          <p className="text-[#454545] font-inter">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                    <AvatarFallback className="text-2xl bg-[#a07735] text-white">
                      {userData?.first_name?.charAt(0).toUpperCase()}{userData?.last_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl font-marcellus text-[#232323]">
                  {userData?.first_name} {userData?.last_name}
                </CardTitle>
                <CardDescription className="text-[#454545]">
                  ODE SPA Member
                </CardDescription>
                <Badge variant="secondary" className="mt-2 bg-[#a07735] text-white px-2 py-2">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium Member
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-[#a07735]" />
                  <span className="text-[#454545]">{userData?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-[#a07735]" />
                  <span className="text-[#454545]">{userData?.phone}</span>
                </div>
               
              </CardContent>
            </Card>
          </div>

          {/* Settings Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-marcellus text-[#232323]">Profile Information</CardTitle>
                    <CardDescription className="text-[#454545]">Update your personal details</CardDescription>
                  </div>
                  <Button
                    disabled={true}
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#454545]">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/70 border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#454545]">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white/70 border-gray-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#454545]">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/70 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#454545]">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/70 border-gray-300"
                  />
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full bg-[#a07735] hover:bg-[#8a6a2e]"
                  >
                    <User className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Notifications */}
            {/* <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-marcellus text-[#232323] flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-[#a07735]" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-[#454545]">Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#454545]">Booking Reminders</Label>
                    <p className="text-sm text-[#666]">Get notified about upcoming appointments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#454545]">Membership Updates</Label>
                    <p className="text-sm text-[#666]">Receive updates about your membership</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#454545]">Special Offers</Label>
                    <p className="text-sm text-[#666]">Get exclusive spa offers and promotions</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card> */}

            {/* Security */}
            {/* <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-marcellus text-[#232323] flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-[#a07735]" />
                  Security
                </CardTitle>
                <CardDescription className="text-[#454545]">Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#454545]">Two-Factor Authentication</Label>
                    <p className="text-sm text-[#666]">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white">
                    <UserCog className="w-4 h-4 mr-2" /> Setup
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#454545]">Change Password</Label>
                    <p className="text-sm text-[#666]">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white">
                    <Lock className="w-4 h-4 mr-2" /> Change
                  </Button>
                </div>
              </CardContent>
            </Card> */}

            {/* Logout */}
            <Card className="rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-marcellus text-[#232323]">Account</CardTitle>
                <CardDescription className="text-[#454545]">Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 