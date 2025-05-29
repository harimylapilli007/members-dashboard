"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createZenotiUser } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserRegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: ""
  })

  useEffect(() => {
    // Get phone number from localStorage if available
    const storedPhone = localStorage.getItem('registrationPhone')
    if (storedPhone) {
      setFormData(prev => ({
        ...prev,
        phone: storedPhone
      }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format phone number (remove any spaces or special characters)
      const cleanPhone = formData.phone.replace(/\D/g, "")

      const userData = await createZenotiUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile_phone: {
          country_code: 95,
          number: cleanPhone
        },
        gender: formData.gender ? parseInt(formData.gender) : undefined
      })

      // Store user data in localStorage
      const userDataToStore = {
        id: userData.id,
        center_id: userData.center_id,
        first_name: userData.personal_info.first_name,
        last_name: userData.personal_info.last_name,
        email: userData.personal_info.email,
        phone: userData.personal_info.mobile_phone.number
      }
      localStorage.setItem('userData', JSON.stringify(userDataToStore))
      
      // Clear the registration phone from localStorage
      localStorage.removeItem('registrationPhone')

      toast({
        title: "Success",
        description: "User created successfully!",
      })

      // Redirect to dashboard
      router.push('/dashboard/memberships')
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBackToSignIn = () => {
    localStorage.removeItem('registrationPhone')
    router.push('/signin')
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="Enter your first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Enter your last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Male</SelectItem>
              <SelectItem value="2">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleBackToSignIn}
          disabled={loading}
        >
          Back to Sign In
        </Button>
      </form>
    </div>
  )
} 