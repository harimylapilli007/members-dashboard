"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { initiatePayment } from "@/lib/payment-utils"
import { useSearchParams } from "next/navigation"
import { MembershipDetail } from "@/types/membership"

interface MembershipModalProps {
  isOpen: boolean
  onClose: () => void
  membership: MembershipDetail
  onConfirm: () => Promise<{ invoice_id: string }>
  loading?: boolean
}

export function MembershipModal({ isOpen, onClose, membership, onConfirm, loading }: MembershipModalProps) {
  const searchParams = useSearchParams()
  const firstName = searchParams.get('first_name')
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')

  const handlePayment = async () => {
    if (!firstName || !phone) {
      alert('Missing user information. Please ensure you are logged in with complete details.')
      return
    }

    try {
      // First create the membership invoice
      const invoiceData = await onConfirm()
      
      // Then initiate the payment
      initiatePayment({
        name: membership.name,
        price: membership.price?.sales || 0,
        firstName,
        email: email || '',
        phone,
        invoiceId: invoiceData.invoice_id
      })
    } catch (error) {
      console.error('Error processing payment:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Membership Details</DialogTitle>
          <DialogDescription>
            Review the membership details before proceeding
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">{membership.name}</h3>
            <p className="text-sm text-muted-foreground">Code: {membership.code}</p>
            {membership.description && (
              <p className="text-sm text-muted-foreground">{membership.description}</p>
            )}
            <div className="mt-4">
              <div className="text-2xl font-bold">₹{membership.price?.sales?.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>
            {membership.freeze_fee_reason_enabled && (
              <div className="mt-2 text-sm text-green-600">Freeze option available</div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 