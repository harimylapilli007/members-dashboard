"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { initiatePayment } from "@/lib/payment-utils"
import { MembershipDetail } from "@/types/membership"
import { useEffect, useState } from "react"
import Image from "next/image"

interface MembershipModalProps {
  isOpen: boolean
  onClose: () => void
  membership: MembershipDetail
  onConfirm: () => Promise<{ invoice_id: string }>
  loading?: boolean
}

export function MembershipModal({ isOpen, onClose, membership, onConfirm, loading }: MembershipModalProps) {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    // Load user info from localStorage when component mounts
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      const userData = JSON.parse(storedUserData)
      setUserInfo({
        firstName: userData.first_name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      })
    }
  }, [])

  const handlePayment = async () => {
    if (!userInfo.firstName || !userInfo.phone) {
      alert('Missing user information. Please ensure you are logged in with complete details.')
      return
    }

    try {
      // First create the membership invoice
      const invoiceData = await onConfirm()
      
      // Then initiate the payment
      initiatePayment({
        name: "Ode Spa Membership",
        price: membership.price?.sales || 0,
        firstName: userInfo.firstName,
        email: userInfo.email,
        phone: userInfo.phone,
        invoiceId: invoiceData.invoice_id
      })
    } catch (error) {
      console.error('Error processing payment:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl bg-[#A87A36] w-[92%] sm:w-full mx-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="p-0 bg-transparent pt-5 sm:pt-8 pb-3 sm:pb-6 px-4 sm:px-6">
          <DialogTitle className="text-white text-center text-lg sm:text-2xl font-semibold">Membership Details</DialogTitle>
          <DialogDescription className="text-white text-center mt-1.5 sm:mt-2 text-xs sm:text-base">
            Review the membership details before proceeding
          </DialogDescription>
        </DialogHeader>
        <div className="p-3.5 sm:p-6 bg-white">
          <div className="relative h-32 sm:h-48 mb-3.5 sm:mb-6 rounded-lg overflow-hidden">
            <Image
              src={`/membership/${membership.price?.sales || 'default'}.png`}
              alt="Ode Spa Membership"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-2.5 sm:space-y-4">
            <div className="text-center">
              <h3 className="text-base sm:text-xl font-semibold text-[#232323]">Ode Spa Membership</h3>
              <p className="text-[11px] sm:text-sm text-[#454545] mt-0.5 sm:mt-1">Code: {membership.code}</p>
            </div>
            {membership.description && (
              <p className="text-[11px] sm:text-sm text-[#454545] text-center leading-relaxed">{membership.description}</p>
            )}
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-[#a07735]">₹{membership.price?.sales?.toLocaleString()}</div>
              <p className="text-[11px] sm:text-sm text-[#454545] mt-0.5 sm:mt-1">One-time payment</p>
            </div>
            {membership.freeze_fee_reason_enabled && (
              <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-green-600 text-center">Freeze option available</div>
            )}
          </div>
        </div>
        <DialogFooter className="p-3.5 sm:p-6 bg-white border-t border-[#ced4da]">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:flex-1 border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white text-xs sm:text-base h-9 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full sm:flex-1 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] text-[#98564D] hover:opacity-90 font-bold text-xs sm:text-base h-9 sm:h-10"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 