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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl">
        <div className="bg-[#A87A36] px-6 pt-8 pb-6 rounded-t-xl">
          <DialogHeader className="p-0 bg-transparent">
            <DialogTitle className="text-white text-center text-2xl font-semibold">Membership Details</DialogTitle>
            <DialogDescription className="text-white text-center mt-2">
              Review the membership details before proceeding
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 bg-white">
          <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
            <Image
              src={`/membership/${membership.price?.sales || 'default'}.png`}
              alt="Ode Spa Membership"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#232323]">Ode Spa Membership</h3>
              <p className="text-sm text-[#454545] mt-1">Code: {membership.code}</p>
            </div>
            {membership.description && (
              <p className="text-sm text-[#454545] text-center">{membership.description}</p>
            )}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#a07735]">₹{membership.price?.sales?.toLocaleString()}</div>
              <p className="text-sm text-[#454545] mt-1">One-time payment</p>
            </div>
            {membership.freeze_fee_reason_enabled && (
              <div className="mt-2 text-sm text-green-600 text-center">Freeze option available</div>
            )}
          </div>
        </div>
        <DialogFooter className="p-6 bg-white border-t border-[#ced4da]">
          <div className="flex gap-4 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-[#a07735] text-[#a07735] hover:bg-[#a07735] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] text-[#98564D] hover:opacity-90 font-bold"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 