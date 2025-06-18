import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Mail } from "lucide-react";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleVerification = () => {
    navigate(`/verify/${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] relative overflow-hidden">
      {/* Background image and overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581092160607-ee22731cc50d?q=80&w=2070&auto=format&fit=crop')",
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

      {/* Animated data flow lines */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="absolute h-0.5 w-1/4 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 animate-[flowRight_8s_infinite]"
          style={{ top: "20%", left: "10%" }}
        ></div>
        <div
          className="absolute h-0.5 w-1/4 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 animate-[flowRight_12s_infinite]"
          style={{ top: "40%", left: "30%" }}
        ></div>
        <div
          className="absolute h-0.5 w-1/4 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 animate-[flowRight_7s_infinite]"
          style={{ top: "60%", left: "50%" }}
        ></div>
        <div
          className="absolute h-0.5 w-1/4 bg-gradient-to-l from-blue-500/0 via-blue-500 to-blue-500/0 animate-[flowLeft_10s_infinite]"
          style={{ top: "30%", left: "40%" }}
        ></div>
        <div
          className="absolute h-0.5 w-1/4 bg-gradient-to-l from-blue-500/0 via-blue-500 to-blue-500/0 animate-[flowLeft_15s_infinite]"
          style={{ top: "70%", left: "20%" }}
        ></div>
      </div>

      {/* Main card */}
      <Card
        className="w-full max-w-md border-blue-900/30 shadow-xl backdrop-blur-xl relative overflow-hidden mx-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(13, 21, 40, 0.95), rgba(10, 15, 29, 0.95))",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="absolute inset-0 bg-[#0a0f1d]/95 z-0"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/0 via-blue-900/30 to-blue-900/0 rounded-lg blur-sm opacity-70 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d]/50 to-blue-900/20 z-0"></div>

        <CardContent className="pt-8 pb-6 flex flex-col items-center relative z-10">
          <div className="bg-green-500/30 rounded-full p-4 mb-6 shadow-lg shadow-green-500/20 backdrop-blur-xl border border-green-500/40 animate-pulse-slow">
            <Check className="h-12 w-12 text-green-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Registration Successful!
          </h2>

          <div className="space-y-4 mb-6 w-full">
            <p className="text-blue-300 text-center">
              Thank you for joining DocuVerse Enterprise ERP System!
            </p>

            <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300 shadow-lg">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">
                    Email Verification Required
                  </p>
                  <p>
                    Please verify your email address before logging in. We've
                    sent a verification code to:
                  </p>
                  <div className="font-medium mt-2 text-white bg-blue-500/30 py-1.5 px-3 rounded-md inline-block border border-blue-500/40">
                    {email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleVerification}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 border border-blue-500/40"
            size="lg"
          >
            Verify Email
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
