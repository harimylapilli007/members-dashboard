'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AccountSelector } from '@/components/account-selector';
import { fetchWithRetry, generateCacheKey } from '../utils/api';

interface Guest {
  id: string;
  center_id: string;
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    mobile_phone: {
      number: string;
    };
  };
}

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const setupRecaptcha = () => {
    try {
      if (!recaptchaContainerRef.current) {
        throw new Error('reCAPTCHA container not found');
      }

      // Clear any existing reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Create new reCAPTCHA instance
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: 'normal',
          callback: () => {
            setRecaptchaReady(true);
            toast({
              title: "Success",
              description: "reCAPTCHA verified",
            });
          },
          'expired-callback': () => {
            setRecaptchaReady(false);
            window.recaptchaVerifier = null;
            setupRecaptcha();
            toast({
              variant: "destructive",
              title: "Error",
              description: "reCAPTCHA expired. Please try again.",
            });
          }
        }
      );

      // Render the reCAPTCHA widget
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error setting up reCAPTCHA. Please refresh the page.",
      });
    }
  };

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    const timer = setTimeout(() => {
      setupRecaptcha();
    }, 1000); // Give time for the container to be rendered

    return () => {
      clearTimeout(timer);
      // Clean up reCAPTCHA when component unmounts
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If the number doesn't start with a country code, assume it's a US number
    if (!phone.startsWith('+')) {
      return `+1${cleaned}`; // Default to US (+1)
    }
    
    // If it starts with +, keep the + and add the cleaned number
    return `+${cleaned}`;
  };

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters for validation
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if the number is too short (less than 10 digits)
    if (cleaned.length < 10) {
      return false;
    }
    
    // Check if the number is too long (more than 15 digits)
    if (cleaned.length > 15) {
      return false;
    }
    
    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!recaptchaReady) {
        throw new Error('Please complete the reCAPTCHA verification');
      }

      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Validate phone number
      if (!validatePhoneNumber(formattedPhone)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)');
      }

      // Check if user exists in Zenoti
      const data = await fetchWithRetry(
        `https://api.zenoti.com/v1/guests/search?phone=${phoneNumber}`,
        {
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_ZENOTI_API_KEY ?? '',
            'accept': 'application/json'
          }
        },
        generateCacheKey('guest-search', { phone: phoneNumber })
      );

      // If no user found, redirect to signup
      if (!data || !data.guests || data.guests.length === 0) {
        // Store phone number in localStorage for registration form
        localStorage.setItem('registrationPhone', phoneNumber);
        
        toast({
          variant: "destructive",
          title: "User Not Found",
          description: "Please sign up first to continue.",
        });
        router.push('/register');
        return;
      }

      // Ensure the guest data is properly structured
      const formattedGuests = data.guests.map((guest: any) => ({
        id: guest.id,
        center_id: guest.center_id,
        personal_info: {
          first_name: guest.personal_info?.first_name || '',
          last_name: guest.personal_info?.last_name || '',
          email: guest.personal_info?.email || '',
          mobile_phone: {
            number: guest.personal_info?.mobile_phone?.number || ''
          }
        }
      }));

      // Store all guests
      setGuests(formattedGuests);

      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      
      window.confirmationResult = confirmationResult;
      setVerificationId(confirmationResult.verificationId);
      setShowOtpInput(true);
      toast({
        title: "Success",
        description: "OTP sent successfully!",
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      if (error.code === 'auth/operation-not-allowed') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Phone authentication is not enabled. Please contact support.",
        });
      } else if (error.code === 'auth/invalid-phone-number') {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number with country code (e.g., +1234567890)",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || 'Failed to send OTP. Please try again.',
        });
      }
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setRecaptchaReady(false);
      setupRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!window.confirmationResult) {
        throw new Error('No verification in progress. Please request a new OTP.');
      }

      const otpString = otp.join('');
      const credential = await window.confirmationResult.confirm(otpString);
      if (credential.user) {
        // Get the ID token
        const idToken = await credential.user.getIdToken();
        
        // Set the auth token cookie
        document.cookie = `auth-token=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
        
        toast({
          title: "Success",
          description: "Successfully verified!",
        });
        
        // If only one account, navigate directly
        if (guests.length === 1) {
          // Store parameters in localStorage before navigation
          const dashboardParams = new URLSearchParams()
          dashboardParams.append('id', guests[0].id)
          dashboardParams.append('center_id', guests[0].center_id)
          dashboardParams.append('first_name', guests[0].personal_info.first_name)
          dashboardParams.append('last_name', guests[0].personal_info.last_name)
          dashboardParams.append('email', guests[0].personal_info.email ?? '')
          dashboardParams.append('phone', guests[0].personal_info.mobile_phone.number ?? '')
          localStorage.setItem('dashboardParams', dashboardParams.toString())

          // Check if there's a redirect URL stored
          const redirectUrl = localStorage.getItem('redirectAfterLogin')
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin')
            router.push(redirectUrl)
          } else {
            router.push(`/`);
          }
        } else {
          // Show account selector for multiple accounts
          setShowAccountSelector(true);
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Invalid OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (guest: Guest) => {
    // Store parameters in localStorage before navigation
    const dashboardParams = new URLSearchParams()
    dashboardParams.append('id', guest.id)
    dashboardParams.append('center_id', guest.center_id)
    dashboardParams.append('first_name', guest.personal_info.first_name)
    dashboardParams.append('last_name', guest.personal_info.last_name)
    dashboardParams.append('email', guest.personal_info.email ?? '')
    dashboardParams.append('phone', guest.personal_info.mobile_phone.number ?? '')
    localStorage.setItem('dashboardParams', dashboardParams.toString())

    // Check if there's a redirect URL stored
    const redirectUrl = localStorage.getItem('redirectAfterLogin')
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin')
      router.push(redirectUrl)
    } else {
      router.push(`/`);
    }
  };

  if (showAccountSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <AccountSelector 
          guests={guests} 
          onSelect={handleAccountSelect} 
          onClose={() => setShowAccountSelector(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="mx-auto max-w-md w-full">
          <Card className="border-none shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90">
            <CardHeader className="bg-gradient-to-r from-[#a07735] to-[#8a6630] text-white p-8">
              <CardTitle className="text-2xl font-semibold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-white/90 text-center mt-2">
                {showOtpInput ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {!showOtpInput ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a07735] focus:border-[#a07735] outline-none transition-all duration-200 bg-white/50"
                      />
                    </div>
                  </div>
                  <div ref={recaptchaContainerRef} className="flex justify-center my-6"></div>
                  <Button
                    type="submit"
                    disabled={loading || !recaptchaReady}
                    className="w-full bg-gradient-to-r from-[#a07735] to-[#8a6630] hover:from-[#8a6630] hover:to-[#a07735] text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-700 text-sm font-medium">Enter OTP</Label>
                    <div className="flex justify-between gap-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const newOtp = [...otp];
                            newOtp[index] = e.target.value;
                            setOtp(newOtp);
                            if (e.target.value && index < 5) {
                              const nextInput = document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement;
                              if (nextInput) nextInput.focus();
                            }
                          }}
                          name={`otp-${index}`}
                          className="w-12 h-14 text-center text-xl border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a07735] focus:border-[#a07735] outline-none transition-all duration-200 bg-white/50"
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#a07735] to-[#8a6630] hover:from-[#8a6630] hover:to-[#a07735] text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify OTP'}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpInput(false);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="text-[#a07735] hover:text-[#8a6630] text-sm font-medium transition-colors duration-200"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {showAccountSelector && (
            <div className="mt-6">
              <AccountSelector
                guests={guests}
                onSelect={handleAccountSelect}
                onClose={() => setShowAccountSelector(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 