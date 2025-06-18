import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  WifiOff,
  ShieldAlert,
  LogIn,
  Mail,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import DocuVerseLogo from "@/components/DocuVerseLogo";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkApiConnection } from "@/services/api/connectionCheck";
import ConnectionErrorFallback from "@/components/shared/ConnectionErrorFallback";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useTranslation } from "@/hooks/useTranslation";

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

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
    general?: string;
    type?:
      | "auth"
      | "connection"
      | "validation"
      | "server"
      | "verification"
      | "deactivated";
  }>({});
  const [isTouched, setIsTouched] = useState<{
    emailOrUsername: boolean;
    password: boolean;
  }>({
    emailOrUsername: false,
    password: false,
  });

  // Use the custom hook instead of manual checks
  const { isAvailable, isChecking, checkConnection } = useApiConnection({
    checkOnMount: false, // Don't auto-check on mount to prevent button from being disabled
  });
  const { t } = useTranslation();

  const { login, isLoading: authIsLoading } = useAuth();

  // Override isLoading if it's been stuck for too long
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const isLoading = localIsLoading;
  const navigate = useNavigate();

  // Debug logging
  console.log("Login component state:", {
    authIsLoading,
    localIsLoading,
    isChecking,
    isAvailable,
    errors: errors.general,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: {
      emailOrUsername?: string;
      password?: string;
      type?: "validation";
    } = {};

    if (!emailOrUsername) {
      newErrors.emailOrUsername = t("auth.requiredField");
      newErrors.type = "validation";
    }

    if (!password) {
      newErrors.password = t("auth.requiredField");
      newErrors.type = "validation";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 ||
      (Object.keys(newErrors).length === 1 && newErrors.type)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setIsTouched({ emailOrUsername: true, password: true });

    // Clear any previous errors
    setErrors({});

    if (!validateForm()) return;

    // Set local loading state
    setLocalIsLoading(true);

    // Check connection before attempting login
    if (isAvailable === false) {
      setErrors({
        general:
          "Cannot connect to server. Please check your connection and try again.",
        type: "connection",
      });
      return;
    }

    // If we haven't checked the connection yet, check it now
    // if (isAvailable === null) {
    //   const connectionResult = await checkConnection();
    //   // If connection check fails, the error will be shown via the error state
    //   if (!connectionResult) {
    //     return;
    //   }
    // }

    try {
      const success = await login({
        emailOrUsername,
        password,
      });

      if (success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error handled in component:", error);

      // Handle different error types
      if (error.code === "ERR_NETWORK") {
        setErrors({
          general:
            "Connection error. Please check your internet connection and try again.",
          type: "connection",
        });
      } else if (
        error.message?.includes("SSL") ||
        error.code === "ERR_SSL_PROTOCOL_ERROR"
      ) {
        // SSL-specific error message
        setErrors({
          general:
            "SSL connection error. Contact your administrator to configure correct API settings.",
          type: "connection",
        });
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        // Authentication errors - use specific backend message
        const backendMessage =
          error.response?.data ||
          error.response?.data?.message ||
          error.message;

        // Determine the specific error type based on the backend message
        let errorMessage = backendMessage;
        let errorType: "auth" | "verification" | "deactivated" = "auth";

        if (typeof backendMessage === "string") {
          if (backendMessage.includes("Invalid email or username")) {
            errorMessage =
              "The email or username you entered doesn't exist. Please check and try again.";
          } else if (backendMessage.includes("Invalid password")) {
            errorMessage =
              "The password you entered is incorrect. Please try again.";
          } else if (
            backendMessage.includes("not activated yet") ||
            backendMessage.includes("email for verification")
          ) {
            errorMessage =
              "Your account is not activated yet. Please check your email for verification before logging in.";
            errorType = "verification";
          } else if (
            backendMessage.includes("Desactivated") ||
            backendMessage.includes("contact an admin")
          ) {
            errorMessage =
              "Your account has been deactivated. Please contact an administrator for assistance.";
            errorType = "deactivated";
          } else {
            // Use the exact backend message if it's a string
            errorMessage = backendMessage;
          }
        }

        setErrors({
          general: errorMessage,
          type: errorType,
        });
      } else if (error.response?.status === 429) {
        // Rate limiting
        setErrors({
          general:
            "Too many login attempts. Please try again later or reset your password.",
          type: "auth",
        });
      } else if (error.response?.status >= 500) {
        // Server errors
        setErrors({
          general:
            "Server error. Our team has been notified. Please try again later.",
          type: "server",
        });
      } else {
        // Extract the specific error message from the API response
        const errorMessage =
          error.response?.data ||
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred. Please try again.";

        setErrors({
          general: errorMessage,
          type: "auth",
        });
      }
    } finally {
      // Always reset local loading state
      setLocalIsLoading(false);
    }
  };

  const handleInputChange = (
    field: "emailOrUsername" | "password",
    value: string
  ) => {
    if (field === "emailOrUsername") {
      setEmailOrUsername(value);
    } else {
      setPassword(value);
    }

    // Mark the field as touched
    setIsTouched((prev) => ({ ...prev, [field]: true }));

    // Clear field-specific errors when user types
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general:
        field === "password" && prev.type === "auth" ? undefined : prev.general,
      type:
        field === "password" && prev.type === "auth" ? undefined : prev.type,
    }));
  };

  // Helper function to determine input border color based on error state
  const getInputBorderClass = (field: "emailOrUsername" | "password") => {
    if (
      (field === "emailOrUsername" && errors.emailOrUsername) ||
      (field === "password" && errors.password)
    ) {
      return "border-red-500/70 focus:border-red-500/70 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_0_15px_rgba(239,68,68,0.2)]";
    }
    return "border-blue-900/50 focus:border-blue-500/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]";
  };

  // Return error icon based on error type
  const getErrorIcon = () => {
    switch (errors.type) {
      case "auth":
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case "verification":
        return <Mail className="h-4 w-4 text-amber-400" />;
      case "deactivated":
        return <Lock className="h-4 w-4 text-red-400" />;
      case "connection":
        return <WifiOff className="h-4 w-4 text-red-400" />;
      case "server":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  // Return error title based on error type
  const getErrorTitle = () => {
    switch (errors.type) {
      case "auth":
        return "Authentication Error";
      case "verification":
        return "Account Not Verified";
      case "deactivated":
        return "Account Deactivated";
      case "connection":
        return "Connection Error";
      case "server":
        return "Server Error";
      case "validation":
        return "Validation Error";
      default:
        return "Error";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1033] to-[#040714] p-4 relative overflow-hidden text-white">
      {/* Background elements */}
      <CircuitPattern />
      <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Content container */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden z-10 gap-8">
        {/* Left side - Login form */}
        <motion.div
          className="w-full lg:w-1/2 space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="text-center" variants={itemVariants}>
            <DocuVerseLogo className="mx-auto h-14 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-blue-100">
              Welcome Back
            </h2>
            <p className="mt-2 text-blue-300">
              Sign in to access your documents and workspace
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-b from-[#122259]/95 to-[#0a1033]/95 backdrop-blur-md border border-blue-900/30 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] p-6"
            variants={itemVariants}
          >
            {/* Consolidated error display */}
            {(errors.general || isAvailable === false) && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-lg border ${
                  errors.type === "auth"
                    ? "bg-red-900/20 border-red-800/30"
                    : errors.type === "verification"
                    ? "bg-amber-900/20 border-amber-800/30"
                    : errors.type === "deactivated"
                    ? "bg-red-900/20 border-red-800/30"
                    : errors.type === "connection"
                    ? "bg-amber-900/20 border-amber-800/30"
                    : errors.type === "server"
                    ? "bg-purple-900/20 border-purple-800/30"
                    : "bg-red-900/20 border-red-800/30"
                } text-white text-sm relative overflow-hidden`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-1.5 rounded-full ${
                      errors.type === "auth"
                        ? "bg-red-800/50"
                        : errors.type === "verification"
                        ? "bg-amber-800/50"
                        : errors.type === "deactivated"
                        ? "bg-red-800/50"
                        : errors.type === "connection"
                        ? "bg-amber-800/50"
                        : errors.type === "server"
                        ? "bg-purple-800/50"
                        : "bg-red-800/50"
                    } mt-0.5`}
                  >
                    {isAvailable === false ? (
                      <WifiOff className="h-4 w-4 text-amber-300" />
                    ) : (
                      getErrorIcon()
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium mb-1 ${
                        errors.type === "auth"
                          ? "text-red-200"
                          : errors.type === "verification"
                          ? "text-amber-200"
                          : errors.type === "deactivated"
                          ? "text-red-200"
                          : errors.type === "connection"
                          ? "text-amber-200"
                          : errors.type === "server"
                          ? "text-purple-200"
                          : "text-red-200"
                      }`}
                    >
                      {isAvailable === false
                        ? "Connection Error"
                        : getErrorTitle()}
                    </h3>
                    <p className="text-gray-300">
                      {isAvailable === false
                        ? "Cannot connect to the server. Please check your network connection."
                        : errors.general}
                    </p>

                    {/* Action buttons based on error type */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {isAvailable === false && (
                        <button
                          onClick={checkConnection}
                          className="text-xs py-1 px-2 bg-amber-800/40 hover:bg-amber-800/60 rounded border border-amber-700/40 transition-colors text-amber-200 flex items-center gap-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retry Connection
                        </button>
                      )}

                      {errors.type === "auth" && (
                        <>
                          {errors.general?.includes("doesn't exist") ? (
                            <Link
                              to="/register"
                              className="text-xs py-1 px-2 bg-blue-800/40 hover:bg-blue-800/60 rounded border border-blue-700/40 transition-colors text-blue-200 flex items-center gap-1"
                            >
                              <User className="w-3 h-3" />
                              Create Account
                            </Link>
                          ) : (
                            <Link
                              to="/forgot-password"
                              className="text-xs py-1 px-2 bg-red-800/40 hover:bg-red-800/60 rounded border border-red-700/40 transition-colors text-red-200 flex items-center gap-1"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1021 9z" />
                              </svg>
                              Reset Password
                            </Link>
                          )}
                        </>
                      )}

                      {errors.type === "verification" && (
                        <Link
                          to="/verify"
                          className="text-xs py-1 px-2 bg-amber-800/40 hover:bg-amber-800/60 rounded border border-amber-700/40 transition-colors text-amber-200 flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Verify Email
                        </Link>
                      )}

                      {errors.type === "deactivated" && (
                        <a
                          href="mailto:support@docuverse.com"
                          className="text-xs py-1 px-2 bg-red-800/40 hover:bg-red-800/60 rounded border border-red-700/40 transition-colors text-red-200 flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          Contact Support
                        </a>
                      )}

                      {errors.type === "server" && (
                        <a
                          href="mailto:support@docuverse.com"
                          className="text-xs py-1 px-2 bg-purple-800/40 hover:bg-purple-800/60 rounded border border-purple-700/40 transition-colors text-purple-200 flex items-center gap-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Support
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Animated background pulse for error */}
                <motion.div
                  className={`absolute inset-0 opacity-10 ${
                    errors.type === "auth"
                      ? "bg-red-500"
                      : errors.type === "verification"
                      ? "bg-amber-500"
                      : errors.type === "deactivated"
                      ? "bg-red-500"
                      : errors.type === "connection"
                      ? "bg-amber-500"
                      : errors.type === "server"
                      ? "bg-purple-500"
                      : "bg-red-500"
                  }`}
                  initial={{ opacity: 0.05 }}
                  animate={{
                    opacity: [0.05, 0.1, 0.05],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-blue-200">
                  Email or Username
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="Enter your email or username"
                    className={`pl-10 h-10 w-full rounded-md transition-all duration-200 bg-blue-50 border-blue-200 text-blue-900 placeholder:text-blue-500 dark:bg-[#0f1642]/70 ${getInputBorderClass(
                      "emailOrUsername"
                    )} dark:text-white dark:placeholder:text-blue-300/50`}
                    value={emailOrUsername}
                    onChange={(e) =>
                      handleInputChange("emailOrUsername", e.target.value)
                    }
                  />
                  {errors.emailOrUsername && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {isTouched.emailOrUsername && errors.emailOrUsername && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.emailOrUsername}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-blue-200">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 h-10 w-full rounded-md transition-all duration-200 bg-blue-50 border-blue-200 text-blue-900 placeholder:text-blue-500 dark:bg-[#0f1642]/70 ${getInputBorderClass(
                      "password"
                    )} dark:text-white dark:placeholder:text-blue-300/50`}
                    value={password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
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
                  {errors.password && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {isTouched.password && errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.password}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  errors.general
                    ? "bg-blue-600/60 border-blue-900/30"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 border-blue-900/30"
                } hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]`}
                disabled={isLoading}
              >
                <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 ease-out group-hover:w-full rounded-md"></span>
                <LogIn className="h-4 w-4" />
                <span className="relative z-10">
                  {isLoading ? "Signing in..." : "Sign in"}
                </span>
              </Button>
            </form>

            {/* Register Link */}
            <div className="pt-4 mt-4 border-t border-blue-900/30">
              <div className="flex items-center justify-center my-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 blur-sm rounded-full"></div>
                  <Link
                    to="/register"
                    className="group relative flex items-center gap-2 text-blue-300 hover:text-blue-200 py-2 px-4 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 border border-blue-700/50 group-hover:bg-blue-800/60 group-hover:border-blue-600/50 transition-all duration-300">
                      <User className="h-4 w-4" />
                    </span>
                    <span>
                      Don't have an account?{" "}
                      <span className="font-medium underline decoration-blue-500/30 underline-offset-2 group-hover:decoration-blue-500/60">
                        Sign up
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
          </motion.div>
        </motion.div>

        {/* Right side - Information panel */}
        <motion.div
          className="hidden lg:block lg:w-1/2 rounded-xl overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-full bg-gradient-to-br from-[#122259]/20 to-[#0f1642]/20 backdrop-blur-sm border border-blue-900/20 rounded-xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-100">DocuVerse</h2>
              <p className="text-blue-300 mt-2">
                Your complete document management solution
              </p>
            </div>

            <div className="space-y-6 my-8">
              <motion.div
                className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-medium text-blue-200 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-full bg-blue-700/30">
                    <Lock className="h-4 w-4 text-blue-300" />
                  </div>
                  Secure Document Management
                </h3>
                <p className="text-sm text-blue-300">
                  Store and manage your documents with enterprise-grade security
                  and encryption. Control access permissions and keep your data
                  protected.
                </p>
              </motion.div>

              <motion.div
                className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="font-medium text-blue-200 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-full bg-blue-700/30">
                    <Mail className="h-4 w-4 text-blue-300" />
                  </div>
                  Collaborative Workflows
                </h3>
                <p className="text-sm text-blue-300">
                  Work together seamlessly with team members. Share documents,
                  assign tasks, and track progress in real-time with our
                  intuitive interface.
                </p>
              </motion.div>

              <motion.div
                className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-medium text-blue-200 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-full bg-blue-700/30">
                    <AlertCircle className="h-4 w-4 text-blue-300" />
                  </div>
                  Smart Document Processing
                </h3>
                <p className="text-sm text-blue-300">
                  Leverage AI-powered features to organize, search, and extract
                  information from your documents. Save time with automated
                  workflows and intelligent suggestions.
                </p>
              </motion.div>
            </div>

            <div className="flex items-start gap-3 bg-blue-800/20 rounded-lg p-4 border border-blue-700/30">
              <div className="p-1 rounded-full bg-blue-700/30 text-blue-300 mt-0.5">
                <HelpCircle size={16} />
              </div>
              <div className="text-sm text-blue-300">
                <p>
                  Need help? Contact our support team at{" "}
                  <a
                    href="mailto:support@docuverse.com"
                    className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 underline-offset-2 hover:decoration-blue-500/60"
                  >
                    support@docuverse.com
                  </a>{" "}
                  or check our{" "}
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 underline-offset-2 hover:decoration-blue-500/60"
                  >
                    documentation
                  </a>{" "}
                  for assistance.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
