import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  Check,
  Shield,
  AlertCircle,
  LogIn,
  Info,
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

// Password strength component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  // Calculate password strength
  const getStrength = () => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  const strength = getStrength();
  const percentage = (strength / 5) * 100;

  const getColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-400";
    return "bg-green-500";
  };

  const getLabel = () => {
    if (strength <= 1) return "Very weak";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    if (strength <= 4) return "Strong";
    return "Very strong";
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full bg-blue-900/40 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-blue-300">{getLabel()}</span>
        <span className="text-blue-300">{strength}/5</span>
      </div>
    </div>
  );
};

const UpdatePassword = () => {
  const { email } = useParams<{ email: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error(
        "Email address is missing. Please start the password reset process again."
      );
      // Don't automatically redirect, just show an error
      setErrors({
        general:
          "Email address is missing. Please start the password reset process again.",
      });
    }
  }, [email]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Please enter your new password";
    } else if (password.length < 8) {
      newErrors.password = "Your password must be at least 8 characters long";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
    ) {
      newErrors.password =
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&)";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "The passwords do not match. Please enter the same password in both fields.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !email) return;

    try {
      setIsLoading(true);
      setErrors({});

      await authService.updatePassword(email, password);
      setIsSuccess(true);
      toast.success("Your password has been successfully updated.");
    } catch (err: any) {
      console.error("Update password error:", err);

      // Handle specific error cases with user-friendly messages
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data;

        if (status === 404) {
          setErrors({
            general:
              "No account exists with this email address. Please check your email or contact support.",
          });
        } else if (status === 401) {
          if (errorMessage.includes("Not Verified")) {
            setErrors({
              general:
                "This email address has not been verified. Please verify your email before resetting your password.",
            });
          } else if (errorMessage.includes("Desactivated")) {
            setErrors({
              general:
                "Your account has been deactivated. Please contact support for assistance.",
            });
          } else {
            setErrors({
              general:
                errorMessage ||
                "Authorization failed. Please try the password reset process again.",
            });
          }
        } else if (status === 400) {
          setErrors({
            general:
              "The password you provided does not meet security requirements. Please try a stronger password.",
          });
        } else {
          setErrors({
            general:
              errorMessage ||
              "An unexpected error occurred. Please try again later.",
          });
        }
      } else if (err.request) {
        setErrors({
          general:
            "Unable to reach the server. Please check your internet connection and try again.",
        });
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again later.",
        });
      }

      toast.error(errors.general || "Failed to update your password.");
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
              Password Updated
            </h2>
            <p className="mt-2 text-blue-300">
              Your password has been successfully changed
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
                  Your password has been successfully updated. You can now log
                  in to your account with your new password.
                </p>

                <div className="flex items-start gap-3 bg-blue-900/30 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 text-left">
                  <div className="p-1.5 rounded-full bg-blue-800/50 text-blue-200 mt-0.5">
                    <Info size={16} />
                  </div>
                  <p className="text-sm text-blue-300">
                    For security reasons, you'll need to use your new password
                    the next time you log in. If you're logged in on other
                    devices, you may be asked to sign in again.
                  </p>
                </div>
              </div>

              <Link to="/login" className="w-full">
                <Button className="w-full bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  <LogIn className="h-4 w-4" />
                  Go to Login
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
            Reset Password
          </h2>
          <p className="mt-2 text-blue-300">
            Create a new password for your account
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] p-6"
          variants={itemVariants}
        >
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-900/30 border border-red-800/30 rounded-md text-red-300 text-sm relative z-10"
            >
              {errors.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-200">
                New Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 h-10 w-full rounded-md transition-all duration-200 bg-[#081029] border border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1.5 ml-1"
                >
                  {errors.password}
                </motion.p>
              )}

              <PasswordStrengthIndicator password={password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-blue-200">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <Shield className="h-4 w-4" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 h-10 w-full rounded-md transition-all duration-200 bg-[#081029] border border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1.5 ml-1"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            <motion.div
              className="flex items-start gap-3 bg-blue-800/20 rounded-lg p-4 border border-blue-700/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-1 rounded-full bg-blue-700/30 text-blue-300 mt-0.5">
                <AlertCircle size={16} />
              </div>
              <div className="text-sm text-blue-300">
                <p>
                  For a strong password, include uppercase and lowercase
                  letters, numbers, and special characters.
                </p>
              </div>
            </motion.div>

            <Button
              type="submit"
              className="w-full bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              disabled={isLoading}
            >
              <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 ease-out group-hover:w-full rounded-md"></span>
              <Lock className="h-4 w-4" />
              <span className="relative z-10">
                {isLoading ? "Processing..." : "Update Password"}
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

export default UpdatePassword;
