import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Check,
  ArrowLeft,
  FileText,
  Shield,
  AlertCircle,
  HelpCircle,
  LogIn,
} from "lucide-react";
import DocuVerseLogo from "@/components/DocuVerseLogo";
import { toast } from "sonner";
import authService from "@/services/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Background pattern element
const CircuitPattern = () => (
  <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none">
    <svg
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M0 50 H100 M50 0 V100 M25 0 V100 M75 0 V100 M0 25 H100 M0 75 H100"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
      />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
      <circle cx="25" cy="25" r="2" fill="currentColor" />
      <circle cx="75" cy="75" r="2" fill="currentColor" />
      <circle cx="25" cy="75" r="2" fill="currentColor" />
      <circle cx="75" cy="25" r="2" fill="currentColor" />
    </svg>
  </div>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address to continue");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await authService.forgotPassword(email);
      setIsSuccess(true);
      toast.success("A password reset link has been sent to your email.");
    } catch (err: any) {
      console.error("Password reset error:", err);

      // Handle email not verified case - but don't redirect
      if (err.message?.includes("Email not verified")) {
        toast.info(
          "Your email is not verified. A new verification code has been sent to your inbox."
        );
        setError(
          "Your email is not verified. A verification code has been sent to your inbox."
        );
        return;
      }

      // Handle specific error cases with user-friendly messages
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data;

        if (status === 404) {
          setError(
            "No account exists with this email address. Please check your email or create a new account."
          );
        } else if (status === 401 && errorMessage.includes("Desactivated")) {
          setError(
            "Your account has been deactivated. Please contact support for assistance."
          );
        } else {
          setError(
            errorMessage ||
              "An unexpected error occurred. Please try again later."
          );
        }
      } else if (err.request) {
        setError(
          "Unable to reach the server. Please check your internet connection and try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }

      toast.error(error || "Failed to process your request.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1033] to-[#040714] p-4 relative overflow-hidden text-white">
        {/* Background elements */}
        <CircuitPattern />
        <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[20%] right-[20%] w-80 h-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>

        <motion.div
          className="w-full max-w-md z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <DocuVerseLogo className="mx-auto h-14 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-blue-100">
              Reset Link Sent
            </h2>
            <p className="mt-2 text-blue-300">
              Check your email inbox for instructions
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] p-8"
            variants={itemVariants}
          >
            <div className="space-y-6">
              <motion.div
                className="mx-auto bg-green-900/30 rounded-full p-4 w-20 h-20 flex items-center justify-center border border-green-700/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Check className="h-10 w-10 text-green-400" />
              </motion.div>

              <h3 className="text-xl font-semibold text-center text-blue-100">
                Success!
              </h3>

              <div className="space-y-4 text-center">
                <p className="text-blue-200">
                  We've sent a password reset link to:
                </p>
                <motion.div
                  className="font-medium text-white bg-blue-900/30 py-3 px-4 rounded-lg border border-blue-800/50"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Mail className="inline-block mr-2 h-4 w-4 text-blue-400" />
                  {email}
                </motion.div>

                <div className="flex items-start gap-3 bg-blue-900/30 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 text-left">
                  <div className="p-1.5 rounded-full bg-blue-800/50 text-blue-200 mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <p className="text-sm text-blue-300">
                    Please check your email and follow the instructions to reset
                    your password. If you don't see the email in your inbox,
                    please check your spam folder.
                  </p>
                </div>
              </div>

              <Link to="/login" className="w-full">
                <Button className="w-full bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  <ArrowLeft size={16} />
                  Return to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1033] to-[#040714] p-4 relative overflow-hidden text-white">
      {/* Background elements */}
      <CircuitPattern />
      <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>

      <motion.div
        className="w-full max-w-md space-y-8 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center" variants={itemVariants}>
          <DocuVerseLogo className="mx-auto h-14 w-auto" />
          <h2 className="mt-6 text-3xl font-bold text-blue-100">
            Forgot Password
          </h2>
          <p className="mt-2 text-blue-300">
            Enter your email and we'll send you a link to reset your password
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] p-6"
          variants={itemVariants}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-900/30 border border-red-800/30 rounded-md text-red-300 text-sm relative z-10"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-200">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="pl-10 h-10 w-full rounded-md transition-all duration-200 bg-[#081029] border border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Tips box */}
            <motion.div
              className="flex items-start gap-3 bg-blue-800/20 rounded-lg p-4 border border-blue-700/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-1 rounded-full bg-blue-700/30 text-blue-300 mt-0.5">
                <HelpCircle size={16} />
              </div>
              <div className="text-sm text-blue-300">
                <p>
                  We'll send a secure link to your email that will allow you to
                  create a new password for your account.
                </p>
              </div>
            </motion.div>

            <Button
              type="submit"
              className="w-full bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              disabled={isLoading}
            >
              <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 ease-out group-hover:w-full rounded-md"></span>
              <Shield className="h-4 w-4" />
              <span className="relative z-10">
                {isLoading ? "Processing..." : "Send Reset Link"}
              </span>
            </Button>

            {/* Simplified Login Link */}
            <div className="pt-4 border-t border-blue-900/30">
              <div className="flex items-center justify-center my-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 blur-sm rounded-full"></div>
                  <Link
                    to="/login"
                    className="group relative flex items-center gap-2 text-blue-300 hover:text-blue-200 py-2 px-4 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 border border-blue-700/50 group-hover:bg-blue-800/60 group-hover:border-blue-600/50 transition-all duration-300">
                      <LogIn className="h-4 w-4" />
                    </span>
                    <span>
                      Back to{" "}
                      <span className="font-medium underline decoration-blue-500/30 underline-offset-2 group-hover:decoration-blue-500/60">
                        login page
                      </span>
                    </span>
                    <motion.span
                      className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
