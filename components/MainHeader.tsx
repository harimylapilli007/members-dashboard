import Image from "next/image";
import Link from "next/link";
import { Phone, Menu, LogIn, LogOut } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function MainHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasGuestId, setHasGuestId] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    // Check for guestId in localStorage
    const guestId = localStorage.getItem('guestId');
    setHasGuestId(!!guestId);

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      // Clear the auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      // Clear dashboard params from localStorage
      localStorage.removeItem('dashboardParams');
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  return (
    <header className="border-b border-gray-200 py-3">
      <div className="mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <Image src="/placeholder-yvzaq.png" alt="ODE SPA Logo" width={48} height={48} className="mr-2 w-12 h-12" />
          <div className="flex flex-col min-w-0">
            <span className="text-[#a07735] text-lg md:text-2xl font-semibold truncate">ODE SPA</span>
            <span className="text-xs text-gray-500">SPA&WELLNESS</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#" className="text-gray-700 hover:text-[#a07735]">FIND A SPA</Link>
          <Link href="#" className="text-gray-700 hover:text-[#a07735] flex items-center">
            SERVICES
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <Link href="#" className="text-gray-700 hover:text-[#a07735]">MEMBERSHIP</Link>
          <Link href="#" className="text-gray-700 hover:text-[#a07735]">ABOUT US</Link>
          <Link href="/ServiceBookingPage?openModal=true" className="bg-[#a07735] text-white px-6 py-2 rounded-md font-medium hover:bg-[#8a6930] transition-colors">Book Now</Link>
          <Link href="#" className="text-gray-700 hover:text-[#a07735]">CAREERS</Link>
          <Link href="#" className="text-gray-700 hover:text-[#a07735]">BLOGS</Link>
          
        </nav>

        <div className="flex items-center gap-2 ">
        <Link href="http://localhost:3000/dashboard/memberships">
          <Button
              variant="outline"
              className="text-gray-700 hover:text-[#a07735] items-center gap-2 hidden md:flex"
           >
              Back to dashboard
          </Button>
        </Link>

        {!hasGuestId && (
          <>
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="text-gray-700 hover:text-[#a07735] items-center gap-2 hidden md:flex"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="text-gray-700 hover:text-[#a07735] items-center gap-2 hidden md:flex"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </>
        )}

      </div>

        {/* Phone and Menu (Mobile) */}
        <div className="flex items-center space-x-2 md:space-x-0">
          {/* <div className="flex items-center md:ml-4">
            <div className="bg-[#111827] text-white p-2 rounded-full">
              <Phone className="h-5 w-5" />
            </div>
            <span className="ml-2 text-gray-700 text-sm hidden sm:inline">+91 9247020202</span>
          </div> */}
          {/* Mobile Menu Button */}
          <div className="md:hidden ml-2">
            <Drawer>
              <DrawerTrigger asChild>
                <button className="p-2 text-gray-700 hover:text-[#a07735]">
                  <Menu className="h-6 w-6" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <nav className="flex flex-col space-y-4 p-4">
                  <Link href="#" className="text-gray-700 hover:text-[#a07735] py-2">FIND A SPA</Link>
                  <Link href="#" className="text-gray-700 hover:text-[#a07735] py-2">SERVICES</Link>
                  <Link href="#" className="text-gray-700 hover:text-[#a07735] py-2">MEMBERSHIP</Link>
                  <Link href="#" className="text-gray-700 hover:text-[#a07735] py-2">ABOUT US</Link>
                  <Link href="/ServiceBookingPage?openModal=true" className="bg-[#a07735] text-white px-8 py-3 rounded-md font-medium hover:bg-[#8a6930] transition-colors text-center">Book Now</Link>
                  <Link href="#" className="text-gray-700 hover:text-[#a07735] py-2">CAREERS</Link>
                  <Link href="#" className="text-gray-700 hover:text-[#a07735] py-2">BLOGS</Link>
                  {!hasGuestId && (
                    <>
                      {isAuthenticated ? (
                        <Button
                          onClick={handleSignOut}
                          variant="ghost"
                          className="text-gray-700 hover:text-[#a07735] flex items-center gap-2 justify-start"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSignIn}
                          variant="ghost"
                          className="text-gray-700 hover:text-[#a07735] flex items-center gap-2 justify-start"
                        >
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                      )}
                    </>
                  )}
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
