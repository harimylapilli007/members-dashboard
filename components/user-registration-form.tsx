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
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#b9935a] rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl shadow-xl bg-white w-[500px] relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-t-2xl bg-gradient-to-b from-[#a87b3c] to-[#b9935a] px-8 pt-8 pb-6 text-center"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-white mb-1"
          >
            Signup
          </motion.h1>
        </motion.div>

        <div className="px-8 pb-8 pt-6">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-[#454545] text-center font-inter text-[22px] font-bold mb-4">Get Started...!</h1>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-700 text-sm text-[18px] font-400 font-['Marcellus']">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                    className="border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none h-11 rounded-lg bg-white transition-all duration-200 placeholder-[#B3B3B3] font-['Marcellus']"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-700 text-sm text-[18px] font-400 font-['Marcellus']">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                    className="border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none h-11 rounded-lg bg-white transition-all duration-200 placeholder-[#B3B3B3] font-['Marcellus']"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-sm text-[18px] font-400 font-['Marcellus']">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none h-11 rounded-lg bg-white transition-all duration-200 placeholder-[#B3B3B3] font-['Marcellus']"
                  />
                </div>

                <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-700 text-sm text-[18px] font-400 font-['Marcellus']">Gender</Label>
                <div>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger
                      className="border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none h-11 rounded-lg bg-white transition-all duration-200 placeholder-[#B3B3B3] font-['Marcellus'] text-sm"
                    >
                      <SelectValue
                        placeholder="Select Gender"
                        className="text-sm font-['Marcellus']"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="text-sm font-['Marcellus']">
                        Male
                      </SelectItem>
                      <SelectItem value="2" className="text-sm font-['Marcellus']">
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 text-sm text-[18px] font-400 font-['Marcellus']">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Phone number"
                    className="border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none h-11 rounded-lg bg-white transition-all duration-200 placeholder-[#B3B3B3] font-['Marcellus']"
                  />
                </div>

            
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)] font-['Marcellus'] text-[#98564D] font-bold text-[20px] leading-[17px] text-center disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
                disabled={loading}
                style={{ boxShadow: 'none' }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-lg font-['Marcellus'] text-[18px] font-400 border-[#a07735] hover:bg-gray-50 text-[#a07735] transition-all duration-200"
                onClick={handleBackToSignIn}
                disabled={loading}
              >
                Back to Sign In
              </Button> */}
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
} 