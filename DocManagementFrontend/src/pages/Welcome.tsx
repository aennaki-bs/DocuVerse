import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import DocuVerseLogo from "@/components/DocuVerseLogo";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified || false;
  const userEmail = location.state?.email || "";

  useEffect(() => {
    if (verified) {
      toast.success("Registration completed successfully!", {
        description: "Welcome to DocuVerse!",
      });
    }
  }, [verified]);

  const handleContinue = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:bg-[#0a0f1d] relative overflow-hidden">
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
          <div className="absolute inset-0 bg-white/95 dark:bg-[#0a0f1d]/95 z-0"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/0 via-blue-900/30 to-blue-900/0 rounded-lg blur-sm opacity-70 z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d]/50 to-blue-900/20 z-0"></div>

          <CardContent className="pt-8 pb-6 flex flex-col items-center relative z-10">
            <div className="bg-green-500/30 rounded-full p-4 mb-6 shadow-lg shadow-green-500/20 backdrop-blur-xl border border-green-500/40 animate-pulse-slow">
              <ShieldCheck className="h-12 w-12 text-green-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 dark:from-white dark:to-blue-200">
              Registration Complete
            </h2>

            <div className="space-y-4 mb-6 w-full">
              <p className="text-blue-700 dark:text-blue-300 text-center">
                Your account has been verified and is ready to use
              </p>

              {userEmail && (
                <div className="bg-blue-100 border-blue-300 dark:bg-blue-500/20 dark:border-blue-500/30 backdrop-blur-xl rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200 shadow-lg">
                  <p className="text-center">
                    You've successfully registered with{" "}
                    <span className="font-medium text-blue-900 dark:text-white">
                      {userEmail}
                    </span>
                  </p>
                </div>
              )}

              <p className="text-blue-600 dark:text-blue-200/80 text-center text-sm px-4">
                Thank you for joining DocuVerse! You can now sign in to your
                account and start managing your documents securely.
              </p>
            </div>
          </CardContent>

          <CardFooter className="border-t border-blue-300 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/30 backdrop-blur-xl p-6 relative z-10">
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 border border-blue-500/40"
              size="lg"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center text-blue-400/50 text-xs relative z-10">
          DocuVerse Enterprise ERP System &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
