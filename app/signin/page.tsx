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
  const [otp, setOtp] = useState('');
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
        toast({
          variant: "destructive",
          title: "User Not Found",
          description: "Please sign up first to continue.",
        });
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

      const credential = await window.confirmationResult.confirm(otp);
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
          const userData = {
            id: guests[0].id,
            center_id: guests[0].center_id,
            first_name: guests[0].personal_info.first_name,
            last_name: guests[0].personal_info.last_name,
            email: guests[0].personal_info.email ?? '',
            phone: guests[0].personal_info.mobile_phone.number ?? ''
          }
          localStorage.setItem('userData', JSON.stringify(userData))

          router.push('/dashboard/memberships');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your phone number to receive an OTP</CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpInput ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  Enter your phone number with country code (e.g., +1234567890)
                </p>
              </div>
              <div ref={recaptchaContainerRef} id="recaptcha-container" className="flex justify-center"></div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !recaptchaReady}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
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
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 