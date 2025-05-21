export interface MembershipDetail {
  id: string
  name: string
  code: string
  description: string | null
  type: number
  freeze_fee_reason_enabled: boolean
  price?: {
    sales: number
  }
}

export interface GuestMembership {
  user_membership_id: string
  status: number
  is_refunded: boolean
  membership: MembershipDetail
  invoice: Invoice
  expiry_date: string
  credit_balance: CreditBalance
  credit_amount: CreditBalance
  member_since: string
  guestpass_total: number
  guestpass_balance: number
  guest: Guest
}

export interface Invoice {
  receipt_no: string
  status: number
  id: string
  item_id: string
  no: string
}

export interface CreditBalance {
  total: number
  service: number
  product: number
  other: number
  comments: string | null
}

export interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
} 