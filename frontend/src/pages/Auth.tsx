import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import axios, { AxiosError } from "axios";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

type Step = "phone" | "otp";

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
              // reCAPTCHA solved
            },
            'expired-callback': () => {
              // Response expired. Ask user to solve reCAPTCHA again.
              toast.error("reCAPTCHA expired. Please try again.");
            }
          });
          await window.recaptchaVerifier.render();
        }
      } catch (error) {
        console.error("reCAPTCHA initialization error:", error);
      }
    };

    initRecaptcha();

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch (e) {
          console.error("Error clearing reCAPTCHA:", e);
        }
      }
    };
  }, []);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    try {
      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page.");
      }
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error) {
       const err = error as { code?: string; message?: string };
       console.error("Error sending OTP:", err);
       
       let message = "Failed to send OTP. Please try again.";
       if (err.code === "auth/operation-not-allowed") {
         message = "SMS service is not enabled in Firebase Console. Please enable Phone Auth and check regional settings (India).";
       } else if (err.code === "auth/invalid-phone-number") {
         message = "Invalid phone number format.";
       } else if (err.code === "auth/too-many-requests") {
         message = "Too many requests. Please try again later.";
       } else if (err.message) {
         message = err.message;
       }
       
       toast.error(message);
      // Reset reCAPTCHA if it fails
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }
    if (!confirmationResult) {
      toast.error("No OTP confirmation found. Please try sending OTP again.");
      setStep("phone");
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      
      // Successfully signed in!
      toast.success("Authentication successful!");
      
      try {
        // Check if garage exists for this phone number
        const response = await axios.get(`http://localhost:5001/api/garages/phone/${phone}`);
        const garage = response.data;
        
        if (garage) {
          localStorage.setItem("mechanic_registered", "true");
          localStorage.setItem("garage_id", garage._id);
          if (garage.isVerified) {
            localStorage.setItem("mechanic_verified", "true");
            navigate("/bookings");
          } else {
            localStorage.setItem("mechanic_verified", "false");
            navigate("/verification-pending");
          }
        }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        // Not registered yet
        navigate("/register", { state: { phone } });
      } else {
        console.error("Error checking registration status:", error);
        toast.error("Failed to check registration status. Please try again.");
      }
    }
  } catch (error) {
      const err = error as Error;
      console.error("Error verifying OTP:", err);
      toast.error(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container flex flex-col min-h-screen">
      {/* Header */}
      <div className="page-padding">
        {step === "otp" && (
          <button
            onClick={() => setStep("phone")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 page-padding pt-8">
        <div id="recaptcha-container"></div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
            <Wrench className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground">MechPro</h1>
            <p className="text-sm text-muted-foreground">For Mechanics</p>
          </div>
        </div>

        {step === "phone" ? (
          <>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
              Welcome Back!
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter your phone number to continue
            </p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-20 h-12 rounded-xl border-2 border-input bg-card flex items-center justify-center text-foreground font-medium">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
              Verify OTP
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter the 6-digit code sent to{" "}
              <span className="text-foreground font-medium">+91 {phone}</span>
            </p>

            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-12 h-14 text-xl rounded-xl border-2 border-input bg-card"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button className="text-primary text-sm font-medium block mx-auto">
              Resend OTP
            </button>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="page-padding pb-8">
        <Button
          variant="accent"
          size="xl"
          className="w-full"
          onClick={step === "phone" ? handleSendOTP : handleVerifyOTP}
          disabled={isLoading || (step === "phone" ? phone.length < 10 : otp.length !== 6)}
        >
          {isLoading ? "Please wait..." : step === "phone" ? "Send OTP" : "Verify & Continue"}
        </Button>
      </div>
    </div>
  );
}
