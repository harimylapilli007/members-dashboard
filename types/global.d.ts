import { RecaptchaVerifier } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
    recaptchaWidgetId: number;
    confirmationResult: any;
  }
} 