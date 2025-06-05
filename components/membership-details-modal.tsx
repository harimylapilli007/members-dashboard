"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MembershipDetail } from "@/types/membership"
import { ChevronLeft, CheckCircle } from "lucide-react"
import Image from "next/image"

interface MembershipDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  membership: MembershipDetail
}

export function MembershipDetailsModal({ isOpen, onClose, membership }: MembershipDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-xl">
        <DialogTitle className="sr-only">Ode Spa Membership Details</DialogTitle>
        <div className="bg-[#a07735] p-4 rounded-t-xl text-center relative">
          <h1 className="text-2xl font-marcellus text-white mb-1">Odespa Membership</h1>
        </div>
        <div className="px-0 pt-0 pb-0 rounded-t-2xl text-center relative">
          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <button
              className="hover:text-[#a07735] text-lg font-bold font-inter flex items-center gap-2"
              onClick={onClose}
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-bold font-inter">Back</span>
            </button>
            <div className="flex-1 flex flex-col items-center">
              <h1 className="text-2xl font-bold font-marcellus mb-1">₹{membership.price?.sales?.toLocaleString()}</h1>
            </div>
            <div className="w-[140px]"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-6 p-8 bg-white">
          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.30176 3.35938L11.001 6.25H10.9375H7.42188C6.34277 6.25 5.46875 5.37598 5.46875 4.29688C5.46875 3.21777 6.34277 2.34375 7.42188 2.34375H7.5293C8.25684 2.34375 8.93555 2.72949 9.30176 3.35938ZM3.125 4.29688C3.125 5 3.2959 5.66406 3.59375 6.25H1.5625C0.698242 6.25 0 6.94824 0 7.8125V10.9375C0 11.8018 0.698242 12.5 1.5625 12.5H23.4375C24.3018 12.5 25 11.8018 25 10.9375V7.8125C25 6.94824 24.3018 6.25 23.4375 6.25H21.4062C21.7041 5.66406 21.875 5 21.875 4.29688C21.875 1.92383 19.9512 0 17.5781 0H17.4707C15.9131 0 14.4678 0.825195 13.6768 2.16797L12.5 4.1748L11.3232 2.17285C10.5322 0.825195 9.08691 0 7.5293 0H7.42188C5.04883 0 3.125 1.92383 3.125 4.29688ZM19.5312 4.29688C19.5312 5.37598 18.6572 6.25 17.5781 6.25H14.0625H13.999L15.6982 3.35938C16.0693 2.72949 16.7432 2.34375 17.4707 2.34375H17.5781C18.6572 2.34375 19.5312 3.21777 19.5312 4.29688ZM1.5625 14.0625V22.6562C1.5625 23.9502 2.6123 25 3.90625 25H10.9375V14.0625H1.5625ZM14.0625 25H21.0938C22.3877 25 23.4375 23.9502 23.4375 22.6562V14.0625H14.0625V25Z" fill="#9E5F45"/>
              </svg>
              <h1 className="font-semibold text-[22px] text-[#98564d] ml-4">Benefits</h1>
            </div>
            <ul className="space-y-2 text-sm text-[#454545]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Flat 5% OFF on all subsequent bookings after redemption</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">10% OFF on ODE skincare and wellness products</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Birthday month special: One free head massage</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_937_2657)">
                  <path d="M27.1785 12.5479C29.827 9.89946 29.827 5.6104 27.1785 2.96196C24.8348 0.618211 21.141 0.313524 18.4457 2.24009L18.3707 2.29165C17.6957 2.77446 17.541 3.71196 18.0238 4.38227C18.5066 5.05259 19.4441 5.21196 20.1145 4.72915L20.1895 4.67759C21.6941 3.60415 23.752 3.7729 25.0551 5.08071C26.5316 6.55727 26.5316 8.9479 25.0551 10.4245L19.7957 15.6932C18.3191 17.1698 15.9285 17.1698 14.452 15.6932C13.1441 14.3854 12.9754 12.3276 14.0488 10.8276L14.1004 10.7526C14.5832 10.0776 14.4238 9.14009 13.7535 8.66196C13.0832 8.18384 12.141 8.33852 11.6629 9.00884L11.6113 9.08384C9.68008 11.7745 9.98477 15.4682 12.3285 17.812C14.977 20.4604 19.266 20.4604 21.9145 17.812L27.1785 12.5479ZM2.82227 11.451C0.173828 14.0995 0.173828 18.3885 2.82227 21.037C5.16602 23.3807 8.85977 23.6854 11.5551 21.7588L11.6301 21.7073C12.3051 21.2245 12.4598 20.287 11.977 19.6167C11.4941 18.9463 10.5566 18.787 9.88633 19.2698L9.81133 19.3213C8.30664 20.3948 6.24883 20.226 4.9457 18.9182C3.46914 17.437 3.46914 15.0463 4.9457 13.5698L10.2051 8.30571C11.6816 6.82915 14.0723 6.82915 15.5488 8.30571C16.8566 9.61352 17.0254 11.6713 15.952 13.176L15.9004 13.251C15.4176 13.926 15.577 14.8635 16.2473 15.3417C16.9176 15.8198 17.8598 15.6651 18.3379 14.9948L18.3895 14.9198C20.3207 12.2245 20.016 8.53071 17.6723 6.18696C15.0238 3.53852 10.7348 3.53852 8.08633 6.18696L2.82227 11.451Z" fill="#98564D"/>
                </g>
              </svg>
              <h1 className="font-semibold text-[#98564d] text-[22px] ml-4">Terms</h1>
            </div>
            <ul className="space-y-2 text-sm text-[#454545]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Non-transferable</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Cannot be clubbed with other promotional offers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Advance booking recommended on weekends</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_937_2625)">
                  <g clipPath="url(#clip1_937_2625)">
                    <path d="M20.2148 2.29102L27.7031 9.86719C30.7734 12.9727 30.7734 17.9648 27.7031 21.0703L21.1406 27.709C20.5957 28.2598 19.7051 28.2656 19.1543 27.7207C18.6035 27.1758 18.5977 26.2852 19.1426 25.7344L25.6992 19.0957C27.6855 17.0859 27.6855 13.8574 25.6992 11.8477L18.2168 4.27148C17.6719 3.7207 17.6777 2.83008 18.2285 2.28516C18.7793 1.74023 19.6699 1.74609 20.2148 2.29688V2.29102ZM0 13.4473V4.6875C0 3.13477 1.25977 1.875 2.8125 1.875H11.5723C12.5684 1.875 13.5234 2.26758 14.2266 2.9707L24.0703 12.8145C25.5352 14.2793 25.5352 16.6523 24.0703 18.1172L16.248 25.9395C14.7832 27.4043 12.4102 27.4043 10.9453 25.9395L1.10156 16.0957C0.392578 15.3926 0 14.4434 0 13.4473ZM8.4375 8.4375C8.4375 7.94022 8.23996 7.46331 7.88832 7.11168C7.53669 6.76004 7.05978 6.5625 6.5625 6.5625C6.06522 6.5625 5.58831 6.76004 5.23667 7.11168C4.88504 7.46331 4.6875 7.94022 4.6875 8.4375C4.6875 8.93478 4.88504 9.41169 5.23667 9.76333C5.58831 10.115 6.06522 10.3125 6.5625 10.3125C7.05978 10.3125 7.53669 10.115 7.88832 9.76333C8.23996 9.41169 8.4375 8.93478 8.4375 8.4375Z" fill="#9E5F45"/>
                  </g>
                </g>
              </svg>
              <h1 className="font-semibold text-[#98564d] text-[22px] ml-4">Discounts & Offers</h1>
            </div>
            <ul className="space-y-2 text-sm text-[#454545]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Flat 5% OFF on all subsequent bookings after redemption</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">10% OFF on ODE skincare and wellness products</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">Birthday month special: One free head massage</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#f5f1e8] rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center mb-2">
              <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_937_2647)">
                  <g clipPath="url(#clip1_937_2647)">
                    <path d="M6 0C6.82969 0 7.5 0.670312 7.5 1.5V3H13.5V1.5C13.5 0.670312 14.1703 0 15 0C15.8297 0 16.5 0.670312 16.5 1.5V3H18.75C19.9922 3 21 4.00781 21 5.25V7.5H0V5.25C0 4.00781 1.00781 3 2.25 3H4.5V1.5C4.5 0.670312 5.17031 0 6 0ZM0 9H21V21.75C21 22.9922 19.9922 24 18.75 24H2.25C1.00781 24 0 22.9922 0 21.75V9ZM3 12.75V14.25C3 14.6625 3.3375 15 3.75 15H5.25C5.6625 15 6 14.6625 6 14.25V12.75C6 12.3375 5.6625 12 5.25 12H3.75C3.3375 12 3 12.3375 3 12.75ZM9 12.75V14.25C9 14.6625 9.3375 15 9.75 15H11.25C11.6625 15 12 14.6625 12 14.25V12.75C12 12.3375 11.6625 12 11.25 12H9.75C9.3375 12 9 12.3375 9 12.75ZM15.75 12C15.3375 12 15 12.3375 15 12.75V14.25C15 14.6625 15.3375 15 15.75 15H17.25C17.6625 15 18 14.6625 18 14.25V12.75C18 12.3375 17.6625 12 17.25 12H15.75ZM3 18.75V20.25C3 20.6625 3.3375 21 3.75 21H5.25C5.6625 21 6 20.6625 6 20.25V18.75C6 18.3375 5.6625 18 5.25 18H3.75C3.3375 18 3 18.3375 3 18.75ZM9.75 18C9.3375 18 9 18.3375 9 18.75V20.25C9 20.6625 9.3375 21 9.75 21H11.25C11.6625 21 12 20.6625 12 20.25V18.75C12 18.3375 11.6625 18 11.25 18H9.75ZM15 18.75V20.25C15 20.6625 15.3375 21 15.75 21H17.25C17.6625 21 18 20.6625 18 20.25V18.75C18 18.3375 17.6625 18 17.25 18H15.75C15.3375 18 15 18.3375 15 18.75Z" fill="#98564D"/>
                  </g>
                </g>
              </svg>
              <h1 className="font-semibold text-[#98564d] text-[22px] ml-4">Validity</h1>
            </div>
            <ul className="space-y-2 text-sm text-[#454545]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#98564d]" />
                <span className="font-inter text-sm">12 months from the date of activation</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 

