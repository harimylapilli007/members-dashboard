import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  redirect("/signin")
  // return (
  //   <div className="flex min-h-screen flex-col">
  //     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  //       <div className="flex h-16 items-center px-4 md:px-6">
  //         <div className="mr-4 hidden md:flex">
  //           <nav className="flex items-center space-x-6 text-sm font-medium">
  //             <Link href="/" className="text-xl font-bold tracking-tight">
  //               Ode Life
  //             </Link>
  //           </nav>
  //         </div>
  //         <div className="flex flex-1 items-center justify-end space-x-4">
  //           <nav className="flex items-center space-x-2">
  //             <Button variant="ghost">Sign In</Button>
  //             <Button>Sign Up</Button>
  //           </nav>
  //         </div>
  //       </div>
  //     </header>
  //     <main className="flex-1">
  //       <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
  //         <div className="px-4 md:px-6">
  //           <div className="flex flex-col items-center justify-center space-y-4 text-center">
  //             <div className="space-y-2">
  //               <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
  //                 Welcome to Ode Life Membership
  //               </h1>
  //               <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
  //                 Choose your wellness journey and access your personalized dashboard
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </section>
  //       <section className="w-full py-12 md:py-24 lg:py-32">
  //         <div className=" px-4 md:px-6">
  //           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  //             <Card className="border-amber-200 relative overflow-hidden">
  //               <div className="absolute top-0 right-0 p-3">
  //                 <div className="flex items-center justify-center rounded-full bg-amber-50 p-2">
  //                   <svg
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     width="24"
  //                     height="24"
  //                     viewBox="0 0 24 24"
  //                     fill="none"
  //                     stroke="currentColor"
  //                     strokeWidth="2"
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     className="h-6 w-6 text-amber-600"
  //                   >
  //                     <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
  //                     <circle cx="12" cy="10" r="3" />
  //                   </svg>
  //                 </div>
  //               </div>
  //               <CardHeader>
  //                 <CardTitle className="text-2xl">Ode Life Essential</CardTitle>
  //                 <CardDescription>5-Year Membership</CardDescription>
  //               </CardHeader>
  //               <CardContent>
  //                 <div className="text-3xl font-bold">₹3,99,999</div>
  //                 <p className="mt-2 text-sm text-muted-foreground">
  //                   A 5-year wellness journey for those who prioritize balance, healing, and luxury experiences.
  //                 </p>
  //                 <ul className="mt-4 space-y-2">
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     4N/5D Couple Stay with Wellness Program
  //                   </li>
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     4 Couple Day Spa Sessions
  //                   </li>
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     Annual Spa Membership
  //                   </li>
  //                 </ul>
  //               </CardContent>
  //               <CardFooter>
  //                 <Link href="/dashboard/essential" className="w-full">
  //                   <Button className="w-full">
  //                     View Dashboard
  //                     <ArrowRight className="ml-2 h-4 w-4" />
  //                   </Button>
  //                 </Link>
  //               </CardFooter>
  //             </Card>
  //             <Card className="border-amber-200 relative overflow-hidden">
  //               <div className="absolute top-0 right-0 p-3">
  //                 <div className="flex items-center justify-center rounded-full bg-amber-50 p-2">
  //                   <svg
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     width="24"
  //                     height="24"
  //                     viewBox="0 0 24 24"
  //                     fill="none"
  //                     stroke="currentColor"
  //                     strokeWidth="2"
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     className="h-6 w-6 text-amber-600"
  //                   >
  //                     <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  //                   </svg>
  //                 </div>
  //               </div>
  //               <CardHeader>
  //                 <CardTitle className="text-2xl">Ode Life Classic</CardTitle>
  //                 <CardDescription>10-Year Membership</CardDescription>
  //               </CardHeader>
  //               <CardContent>
  //                 <div className="text-3xl font-bold">₹6,99,999</div>
  //                 <p className="mt-2 text-sm text-muted-foreground">
  //                   A decade of luxury, wellness, and unmatched privileges designed for the modern wellness seeker.
  //                 </p>
  //                 <ul className="mt-4 space-y-2">
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     4 Couple Day Spa Sessions
  //                   </li>
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     12 Annual Spa Memberships
  //                   </li>
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     1 Week Stay with Wellness Program
  //                   </li>
  //                 </ul>
  //               </CardContent>
  //               <CardFooter>
  //                 <Link href="/dashboard/classic" className="w-full">
  //                   <Button className="w-full">
  //                     View Dashboard
  //                     <ArrowRight className="ml-2 h-4 w-4" />
  //                   </Button>
  //                 </Link>
  //               </CardFooter>
  //             </Card>
  //             <Card className="border-amber-200 relative overflow-hidden">
  //               <div className="absolute top-0 right-0 p-3">
  //                 <div className="flex items-center justify-center rounded-full bg-amber-50 p-2">
  //                   <svg
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     width="24"
  //                     height="24"
  //                     viewBox="0 0 24 24"
  //                     fill="none"
  //                     stroke="currentColor"
  //                     strokeWidth="2"
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     className="h-6 w-6 text-amber-600"
  //                   >
  //                     <path d="M12 2L5 12l7 10 7-10z" />
  //                   </svg>
  //                 </div>
  //               </div>
  //               <CardHeader>
  //                 <CardTitle className="text-2xl">Ode Life Signature</CardTitle>
  //                 <CardDescription>15-Year Membership</CardDescription>
  //               </CardHeader>
  //               <CardContent>
  //                 <div className="text-3xl font-bold">₹9,99,999</div>
  //                 <p className="mt-2 text-sm text-muted-foreground">
  //                   Join the wellness elite. A 15-year membership designed for a life immersed in rejuvenation and
  //                   rewards.
  //                 </p>
  //                 <ul className="mt-4 space-y-2">
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     4 Couple Day Spa Sessions
  //                   </li>
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     12 Annual Spa Memberships
  //                   </li>
  //                   <li className="flex items-center">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="24"
  //                       height="24"
  //                       viewBox="0 0 24 24"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       strokeWidth="2"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       className="mr-2 h-4 w-4 text-amber-600"
  //                     >
  //                       <path d="M20 6 9 17l-5-5" />
  //                     </svg>
  //                     1 Week Stay with Wellness Program
  //                   </li>
  //                 </ul>
  //               </CardContent>
  //               <CardFooter>
  //                 <Link href="/dashboard/signature" className="w-full">
  //                   <Button className="w-full">
  //                     View Dashboard
  //                     <ArrowRight className="ml-2 h-4 w-4" />
  //                   </Button>
  //                 </Link>
  //               </CardFooter>
  //             </Card>
  //           </div>
  //         </div>
  //       </section>
  //     </main>
  //     <footer className="w-full border-t py-6">
  //       <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
  //         <p className="text-center text-sm leading-loose text-muted-foreground">
  //           © 2025 Ode Life. All rights reserved.
  //         </p>
  //       </div>
  //     </footer>
  //   </div>
  // )
}
