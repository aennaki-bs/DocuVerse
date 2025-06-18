import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
  Send,
  RefreshCw,
} from "lucide-react";
import DocuVerseLogo from "@/components/DocuVerseLogo";
import authService from "@/services/authService";
import { motion } from "framer-motion";

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const { email } = useParams<{ email?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    if (!email) {
      console.log("No email found in URL params");
    }

    // Focus the first input field when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  const handleResendCode = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is missing. Please ensure you have a valid email.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.resendVerificationCode(email);
      toast({
        title: "Success",
        description: "Verification code has been resent to your email.",
      });
      // Reset the verification code fields
      setVerificationCode(["", "", "", "", "", ""]);
      // Focus the first input after resetting
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } catch (error: any) {
      console.error("Error resending verification code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resend verification code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFullVerificationCode = () => verificationCode.join("");

  const handleVerifyEmail = async () => {
    const fullCode = getFullVerificationCode();

    // Debug the verification code before submission
    console.log("Submitting verification code:", fullCode);

    // Add additional validation to ensure we have 6 digits
    if (
      fullCode.length !== 6 ||
      verificationCode.some((digit) => digit === "")
    ) {
      setError("Please enter the complete 6-digit verification code.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!email) {
      setError(
        "Email is missing. Please ensure you have a valid email in the URL."
      );
      setIsLoading(false);
      return;
    }

    try {
      const success = await authService.verifyEmail(email, fullCode);
      if (success) {
        toast({
          title: "Success",
          description: "Email verified successfully!",
        });
        navigate("/welcome", {
          state: {
            verified: true,
            email: email,
          },
        });
      } else {
        setError("Invalid verification code.");
        // Reset the code on failure
        setVerificationCode(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      setError("Invalid verification code.");
      // Reset the code on failure
      setVerificationCode(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Update the current input value
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);

    // If we entered a digit and there's a next field, move to it
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (verificationCode[index] === "" && index > 0) {
        // If current field is empty, move to previous field
        inputRefs.current[index - 1]?.focus();
        // Clear the previous field
        const newVerificationCode = [...verificationCode];
        newVerificationCode[index - 1] = "";
        setVerificationCode(newVerificationCode);
      } else {
        // Clear current field
        const newVerificationCode = [...verificationCode];
        newVerificationCode[index] = "";
        setVerificationCode(newVerificationCode);
      }
    }
    // Handle left arrow key
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow key
    else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Paste operation is handled in onPaste event
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    // Check if pasted content is a number and maximum 6 digits
    if (/^\d{1,6}$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 6);
      const newVerificationCode = [...verificationCode];

      // Fill in the verification code array with pasted digits
      digits.forEach((digit, index) => {
        if (index < 6) newVerificationCode[index] = digit;
      });

      setVerificationCode(newVerificationCode);

      // Focus the appropriate input box based on pasted content length
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();

      // If all 6 digits were pasted, submit automatically
      if (digits.length === 6) {
        setTimeout(handleVerifyEmail, 300);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] relative overflow-hidden">
      {/* Background image and overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')",
          backgroundBlendMode: "overlay",
        }}
      ></div>

      {/* Abstract ERP-themed background elements */}
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(59, 130, 246, 0.05)"
                strokeWidth="0.5"
              ></path>
            </pattern>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="10%" cy="20%" r="150" fill="url(#grad1)" />
          <circle cx="80%" cy="60%" r="200" fill="url(#grad1)" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d]/90 to-[#0a0f1d]/80 z-0"></div>

      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <DocuVerseLogo className="h-12 text-blue-400" />
        </div>

        <Card
          className="border-blue-900/30 shadow-xl backdrop-blur-xl relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(13, 21, 40, 0.95), rgba(10, 15, 29, 0.95))",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="absolute inset-0 bg-[#0a0f1d]/95 z-0"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/0 via-blue-900/30 to-blue-900/0 rounded-lg blur-sm opacity-70 z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d]/50 to-blue-900/20 z-0"></div>

          <CardHeader className="relative z-10 text-center">
            <CardTitle className="text-2xl font-semibold text-white">
              Email Verification
            </CardTitle>
            <CardDescription className="text-blue-300">
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6">
            {/* Progress Steps */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            </div>

            <div className="mx-auto bg-blue-900/20 rounded-full p-4 w-20 h-20 flex items-center justify-center backdrop-blur-xl border border-blue-900/40">
              <ShieldCheck className="h-10 w-10 text-blue-400" />
            </div>

            <div className="text-center">
              <p className="text-blue-300/80 text-sm">
                We've sent a verification code to:
              </p>
              <p className="font-medium text-white text-lg bg-blue-500/10 rounded-md py-1 px-3 inline-block mt-1 border border-blue-500/20">
                {email}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-blue-300 text-center text-sm font-medium">
                Verification Code
              </p>

              <div className="flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="w-10 h-12"
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-full h-full bg-blue-900/30 border border-blue-800/60 focus:border-blue-500 rounded-md text-center text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      onClick={(e) => e.currentTarget.select()} // Select text on click
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {error &&
              error !==
                "Please enter the complete 6-digit verification code." && (
                <div className="bg-red-900/20 backdrop-blur-md border border-red-800/50 rounded-md p-3">
                  <p className="text-red-400 text-center text-sm">{error}</p>
                </div>
              )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 relative z-10 border-t border-blue-900/30 bg-blue-950/30 backdrop-blur-xl px-6 py-4">
            <Button
              onClick={handleVerifyEmail}
              disabled={
                isLoading ||
                verificationCode.some((digit) => digit === "") ||
                verificationCode.length !== 6
              }
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 border border-blue-500/40"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Verify Email
            </Button>

            <div className="flex justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
              >
                Resend Code
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
