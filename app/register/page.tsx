import { UserRegistrationForm } from "@/components/user-registration-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | Membership Dashboard",
  description: "Create your account to access the membership dashboard and manage your bookings.",
  keywords: ["register", "sign up", "membership", "dashboard", "account creation"],
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
    <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
        }}
      />
      {/* Subtle blurred circles */}
      <div className="fixed top-20 -left-60 w-[600px] h-[600px] bg-[#e2c799] opacity-60 rounded-full -z-10 blur-3xl" />
      <div className="fixed bottom-20 right-0 w-[800px] h-[800px] bg-[#b2d5e4] opacity-50 rounded-full -z-10 blur-3xl" />
      <div className="fixed top-1/3 left-1/2 w-[2000px] h-[2000px] bg-[#b2d5e4] opacity-40 rounded-full -z-10 blur-3xl" />
      <UserRegistrationForm />
    </div>
  )
} 