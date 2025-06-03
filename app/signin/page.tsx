// 

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
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

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
        throw new Error('Please enter a valid phone number with country code (e.g., +91 9876543210)');
      }

      // Check if user exists in Zenoti
      const response = await fetch(`https://api.zenoti.com/v1/guests/search?phone=${phoneNumber}`, {
        headers: {
          'Authorization': 'apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283',
          'accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to check user existence');
      }

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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
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
      if (otpString.length !== 6) {
        throw new Error('Please enter a complete 6-digit OTP code.');
      }

      const credential = await window.confirmationResult.confirm(otpString);
      if (credential.user) {
        // Get the ID token
        const idToken = await credential.user.getIdToken();
        
        // Set the auth token cookie with proper domain and path
        document.cookie = `auth-token=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
        
        toast({
          title: "Success",
          description: "Successfully verified!",
        });
        
        // If only one account, navigate directly
        if (guests.length === 1) {
          // Store parameters in localStorage before navigation
          const userData = {
            id: guests[0].id,
            center_id: guests[0].center_id,
            first_name: guests[0].personal_info.first_name,
            last_name: guests[0].personal_info.last_name,
            email: guests[0].personal_info.email ?? '',
            phone: guests[0].personal_info.mobile_phone.number ?? ''
          }
          localStorage.setItem('userData', JSON.stringify(userData))

          // Force a hard navigation to ensure proper state reset
          window.location.href = '/dashboard/memberships';
        } else {
          // Show account selector for multiple accounts
          setShowAccountSelector(true);
        }
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/invalid-verification-code') {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP code is invalid or has expired. Please request a new OTP.",
        });
        // Reset OTP input
        setOtp(['', '', '', '', '', '']);
        // Reset reCAPTCHA
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
        setRecaptchaReady(false);
        setupRecaptcha();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (guest: Guest) => {
    // Store parameters in localStorage before navigation
    const userData = {
      id: guest.id,
      center_id: guest.center_id,
      first_name: guest.personal_info.first_name,
      last_name: guest.personal_info.last_name,
      email: guest.personal_info.email ?? '',
      phone: guest.personal_info.mobile_phone.number ?? ''
    }
    localStorage.setItem('userData', JSON.stringify(userData))

    router.push('/dashboard/memberships');
  };

  if (showAccountSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <AccountSelector 
          guests={guests} 
          onSelect={handleAccountSelect} 
          onClose={() => setShowAccountSelector(false)}
        />
      </div>
    );
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
        className="rounded-2xl shadow-xl bg-white w-[450px] relative z-10"
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
           Login
          </motion.h1>
          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white text-base"
          >
            Enter your phone number to continue
          </motion.p> */}
        </motion.div>

        <div className="px-8 pb-8 pt-6">
          <AnimatePresence mode="wait">
            {!showOtpInput ? (
              <motion.form
                key="phone-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h1 className="text-[#454545] text-center font-inter text-[22px] font-bold mb-4">Welcome Back...!</h1>
                  <Label htmlFor="phone" className="text-gray-700 text-sm text-[18px] font-400 flex items-center gap-2 mb-4">
                    <Phone className="w-4 h-4" />
                   <span className="font-['Marcellus'] text-[18px] font-400"> Please enter your phone number</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loading}
                    className="border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none h-11 rounded-lg bg-white transition-all duration-200"
                  />
                </div>
                <div ref={recaptchaContainerRef} id="recaptcha-container" className="flex justify-center py-2"></div>
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)]  font-['Marcellus'] text-[#98564D] font-bold text-[20px] leading-[17px] text-center  disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
                  disabled={loading || !recaptchaReady}
                  style={{ boxShadow: 'none' }}
                >
                  {loading ? (
                    <motion.p
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-['Marcellus'] text-[18px] font-400"> Enter OTP</span>
                  </Label>
                  <div className="flex gap-2.5 justify-center">
                    {otp.map((digit, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Input
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg border border-gray-300 focus:border-[#b9935a] focus:ring-2 focus:ring-[#b9935a]/20 focus:ring-offset-0 focus:outline-none rounded-lg bg-white transition-all duration-200"
                          disabled={loading}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E6B980] to-[#F8E1A0] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_4px_6px_rgba(0,0,0,0.1)]  font-['Marcellus'] text-[#98564D] font-bold text-[20px] leading-[17px] text-center  disabled:bg-[#d6c3a3] disabled:text-white hover:!bg-[#b9935a] transition-all duration-200 group"
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
                      Verify OTP
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-lg font-['Marcellus'] text-[18px] font-400   border-[#a07735] hover:bg-gray-50  text-[#a07735] transition-all duration-200"
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp(['', '', '', '', '', '']);
                    if (window.recaptchaVerifier) {
                      window.recaptchaVerifier.clear();
                      window.recaptchaVerifier = null;
                    }
                    setRecaptchaReady(false);
                    setupRecaptcha();
                  }}
                  disabled={loading}
                >
                  Back to Phone Number
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
} 