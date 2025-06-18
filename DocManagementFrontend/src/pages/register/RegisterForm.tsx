import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "@/context/form";
import { FormError } from "@/components/ui/form-error";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Lock,
  Shield,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Check,
  CircleCheck,
  PenLine,
  UserPlus,
  Database,
  BarChart3,
  Layers,
  Fingerprint,
  FileText,
  LogIn,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Step Components
import UserTypeSelection from "@/components/register/StepOneTypeSelector";
import PersonalInfoForm from "@/components/register/StepTwoPersonalInfo";
import AddressStep from "@/components/register/StepThreeAddressInfo";
import UsernameEmailForm from "@/components/register/StepFourCredentials";
import PasswordForm from "@/components/register/StepFivePassword";
import AdminAccessForm from "@/components/register/StepSixAdminAccess";
import ReviewStep from "@/components/register/StepSevenSummary";

// Define our StepInfo interface
export interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Define error types for categorization
type ErrorType =
  | "validation"
  | "availability"
  | "security"
  | "server"
  | "general";

// Animation variants for step transitions
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

// Background icons for aesthetic purposes
const BackgroundIcon = ({
  icon,
  className,
}: {
  icon: React.ReactNode;
  className: string;
}) => (
  <div className={`absolute opacity-5 text-blue-300 ${className}`}>{icon}</div>
);

const RegisterForm: React.FC = () => {
  const {
    currentStep,
    formData,
    stepValidation,
    nextStep,
    prevStep,
    validateCurrentStep,
  } = useMultiStepForm();
  const [direction, setDirection] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const isPersonal = formData.userType === "personal";

  // Function to determine error type based on error messages
  const determineErrorType = (): ErrorType => {
    // Error from username/email availability check
    if (
      stepValidation.errors.username?.includes("already taken") ||
      stepValidation.errors.email?.includes("already registered")
    ) {
      return "availability";
    }

    // Password related errors
    if (formData.validationError?.includes("Password") || currentStep === 4) {
      return "security";
    }

    // Registration submission errors
    if (
      stepValidation.errors.registration?.includes("server") ||
      stepValidation.errors.registration?.includes("unexpected")
    ) {
      return "server";
    }

    // Default case - validation errors
    return "validation";
  };

  // Get appropriate icon for error message
  const getErrorIcon = (errorType: ErrorType) => {
    switch (errorType) {
      case "availability":
        return <User className="h-4 w-4 text-amber-300" />;
      case "security":
        return <Shield className="h-4 w-4 text-red-300" />;
      case "server":
        return <AlertTriangle className="h-4 w-4 text-purple-300" />;
      case "validation":
      default:
        return <AlertCircle className="h-4 w-4 text-red-300" />;
    }
  };

  // Get title for error message
  const getErrorTitle = (errorType: ErrorType) => {
    switch (errorType) {
      case "availability":
        return "Availability Issue";
      case "security":
        return "Security Requirement";
      case "server":
        return "Server Error";
      case "validation":
      default:
        return "Validation Error";
    }
  };

  // Get appropriate background and border colors for error type
  const getErrorStyles = (errorType: ErrorType) => {
    switch (errorType) {
      case "availability":
        return "bg-amber-900/20 border-amber-800/30 text-amber-100";
      case "security":
        return "bg-red-900/20 border-red-800/30 text-red-100";
      case "server":
        return "bg-purple-900/20 border-purple-800/30 text-purple-100";
      case "validation":
      default:
        return "bg-red-900/20 border-red-800/30 text-red-100";
    }
  };

  // Get current error message - consolidated logic to avoid duplications
  const getErrorMessage = () => {
    if (currentStep === 3) {
      // Username and email errors have priority in step 3
      return (
        stepValidation.errors.username ||
        stepValidation.errors.email ||
        formData.validationError ||
        stepValidation.errors.registration
      );
    }

    // For other steps
    return formData.validationError || stepValidation.errors.registration;
  };

  // Error message to display
  const errorMessage = getErrorMessage();

  // Error type determined from the message
  const errorType = errorMessage ? determineErrorType() : "validation";

  // Step information
  const steps: StepInfo[] = [
    {
      id: 0,
      title: "Account Type",
      description: "Choose between personal or company account",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 1,
      title: "Account Details",
      description: isPersonal
        ? "Enter your personal information"
        : "Enter your company information",
      icon: <PenLine className="h-5 w-5" />,
    },
    {
      id: 2,
      title: "Address",
      description: "Enter your contact information",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 3,
      title: "Username & Email",
      description: "Create your account identifiers",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: 4,
      title: "Password",
      description: "Create a secure password",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      id: 5,
      title: "Admin Access",
      description: "Optional admin privileges",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: 6,
      title: "Review",
      description: "Review and confirm your information",
      icon: <CircleCheck className="h-5 w-5" />,
    },
  ];

  // Handle next button click
  const handleNext = async () => {
    setAttemptedNext(true);

    // Validate current step before proceeding
    const isValid = await validateCurrentStep();

    if (isValid) {
      setDirection(1);
      nextStep();
      setAttemptedNext(false);
    } else {
      // Show error state but don't proceed
      console.log("Validation failed. Please check the form.");
    }
  };

  // Handle prev button click
  const handlePrev = () => {
    setDirection(-1);
    prevStep();
    setAttemptedNext(false);
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    // Always allow moving to the next step from the account type selection
    if (currentStep === 0) return false;

    // For the address step (step 2), only require city and country fields
    if (currentStep === 2) {
      // Check if city and country are filled
      const isCityEmpty = !(formData as any).city;
      const isCountryEmpty = !(formData as any).country;

      // Allow proceeding if both required fields are filled and there are no validation errors
      return !!(
        isCityEmpty ||
        isCountryEmpty ||
        (stepValidation.errors &&
          ((stepValidation.errors as any).city ||
            (stepValidation.errors as any).country))
      );
    }

    // For the review step, don't show the next button
    if (currentStep === 6) return true;

    // For required info steps, check if essential fields are filled
    if (currentStep === 1) {
      if (formData.userType === "personal") {
        return !formData.firstName || !formData.lastName;
      } else {
        return !formData.companyName || !formData.companyRC;
      }
    }

    // For credentials step, check if username and email are valid
    if (currentStep === 3) {
      return !!(
        !formData.username ||
        !formData.email ||
        (stepValidation.errors &&
          (stepValidation.errors.username || stepValidation.errors.email))
      );
    }

    // For password step, check if passwords match and meet requirements
    if (currentStep === 4) {
      return !!(
        !formData.password ||
        !formData.confirmPassword ||
        formData.password !== formData.confirmPassword ||
        formData.password.length < 8
      );
    }

    // For admin access step, check if admin key is required and provided
    if (currentStep === 5) {
      // If admin access is requested, admin key is required
      if (formData.requestAdminAccess && !formData.adminSecretKey) {
        return true; // Disable next button if admin key is required but not provided
      }
      return false; // Allow proceeding if admin access is not requested or admin key is provided
    }

    // Default case for other steps - disable if validation errors exist
    return !!(
      stepValidation.errors && Object.keys(stepValidation.errors).length > 0
    );
  };

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <UserTypeSelection />;
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <AddressStep />;
      case 3:
        return <UsernameEmailForm />;
      case 4:
        return <PasswordForm />;
      case 5:
        return <AdminAccessForm />;
      case 6:
        return <ReviewStep />;
      default:
        return <UserTypeSelection />;
    }
  };

  // Render error message component with enhanced UI
  const renderErrorMessage = () => {
    if (!errorMessage) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={`mt-4 p-4 rounded-lg border ${getErrorStyles(
          errorType
        )} relative overflow-hidden`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-1.5 rounded-full ${
              errorType === "availability"
                ? "bg-amber-800/50"
                : errorType === "security"
                ? "bg-red-800/50"
                : errorType === "server"
                ? "bg-purple-800/50"
                : "bg-red-800/50"
            } mt-0.5`}
          >
            {getErrorIcon(errorType)}
          </div>
          <div>
            <h3
              className={`text-sm font-medium mb-1 ${
                errorType === "availability"
                  ? "text-amber-200"
                  : errorType === "security"
                  ? "text-red-200"
                  : errorType === "server"
                  ? "text-purple-200"
                  : "text-red-200"
              }`}
            >
              {getErrorTitle(errorType)}
            </h3>
            <p className="text-gray-300">{errorMessage}</p>

            {/* Add helpful tips based on error type */}
            {errorType === "availability" && (
              <div className="mt-2 text-xs text-amber-200/80 bg-amber-800/20 p-2 rounded border border-amber-800/20 flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Try a different{" "}
                  {stepValidation.errors.username
                    ? "username"
                    : "email address"}{" "}
                  or login if you already have an account.
                </span>
              </div>
            )}

            {errorType === "security" && (
              <div className="mt-2 text-xs text-red-200/80 bg-red-800/20 p-2 rounded border border-red-800/20 flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Strong passwords include a mix of uppercase and lowercase
                  letters, numbers, and special characters.
                </span>
              </div>
            )}

            {errorType === "server" && (
              <div className="mt-2 text-xs text-purple-200/80 bg-purple-800/20 p-2 rounded border border-purple-800/20 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Please try again later or contact support if the problem
                  persists.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Animated background pulse for error */}
        <motion.div
          className={`absolute inset-0 opacity-10 ${
            errorType === "availability"
              ? "bg-amber-500"
              : errorType === "security"
              ? "bg-red-500"
              : errorType === "server"
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
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 relative overflow-auto">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-blue-600/5 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-3xl mx-auto z-10 relative">
        {/* ERP banner */}
        {/* <div className="p-4 bg-gradient-to-r from-blue-900/50 to-blue-900/20 rounded-lg border border-blue-800/30 mb-6 relative overflow-hidden">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-10">
            <svg
              className="w-16 h-16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 8V16C22 17.1046 21.1046 18 20 18H4C2.89543 18 2 17.1046 2 16V8M22 8C22 6.89543 21.1046 6 20 6H4C2.89543 6 2 6.89543 2 8M22 8H2M6 12H8M16 12H18M11 12H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-blue-300">
            Enterprise Resource Platform
          </h3>
          <p className="text-xs text-blue-400 mt-1">
            Document Management System
          </p>
        </div> */}

        {/* Advanced Linear Step Indicator */}
        <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] p-6 mb-6 text-white">
          <h2 className="text-xl font-bold text-blue-100 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-600/20 text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            Registration Steps
          </h2>

          {/* Horizontal Steps Indicator */}
          <div className="w-full relative mt-6">
            {/* Connector line */}
            <div className="absolute top-[14px] left-0 right-0 h-[2px] bg-blue-900/50 z-0"></div>

            {/* Steps */}
            <div className="flex justify-between items-center relative z-10">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: currentStep === step.id ? 1.1 : 1,
                      y: currentStep === step.id ? -2 : 0,
                    }}
                    className={`relative flex items-center justify-center rounded-full transition-all duration-300 border-2
                      ${
                        currentStep === step.id
                          ? "w-8 h-8 bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] pulse-animation"
                          : currentStep > step.id
                          ? "w-7 h-7 bg-green-600/80 border-green-400 text-white"
                          : "w-7 h-7 bg-blue-900/60 border-blue-800 text-blue-400/70"
                      }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">{step.id + 1}</span>
                    )}
                  </motion.div>

                  {/* Label (only show for current step and adjacent steps) */}
                  {(currentStep === step.id ||
                    Math.abs(currentStep - step.id) <= 1) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`mt-2 text-center w-20 ${
                        currentStep === step.id
                          ? "text-blue-200"
                          : "text-blue-400/70"
                      }`}
                    >
                      <p className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {step.title}
                      </p>
                      {currentStep === step.id && (
                        <motion.div
                          className="h-0.5 w-0 bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        />
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 border-b border-blue-900/30 relative overflow-hidden">
            {/* Background header pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <pattern
                  id="circuitPattern"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0 20h40M20 0v40M10 0v10M30 0v10M10 30v10M30 30v10M0 10h10M30 10h10M0 30h10M30 30h10"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </pattern>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="url(#circuitPattern)"
                />
              </svg>
            </div>

            <h1 className="text-xl text-blue-100 flex items-center gap-3 mb-1 relative z-10">
              <div className="p-2 rounded-full bg-blue-600/20 text-blue-400">
                {steps[currentStep].icon}
              </div>
              {steps[currentStep].title}
              <span className="ml-auto px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded-full border border-blue-800/30">
                Step {currentStep + 1} of 8
              </span>
            </h1>
            <p className="text-blue-300 relative z-10">
              {steps[currentStep].description}
            </p>

            {/* Enhanced error message display */}
            <AnimatePresence>
              {errorMessage && renderErrorMessage()}
            </AnimatePresence>
          </div>

          {/* Form content with animation */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="px-6 pb-6 pt-2 border-t border-blue-900/30 flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-transparent">
            <Button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`border border-blue-900/50 transition-all duration-200 flex items-center gap-2 ${
                currentStep === 0
                  ? "opacity-50 bg-blue-950/30 text-blue-300/50"
                  : "bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 6 && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] ${
                  isNextDisabled() ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Simplified Login Link */}
        <div className="flex items-center justify-center my-6">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 blur-sm rounded-full"></div>
            <Link
              to="/login"
              className="group relative flex items-center gap-2 text-blue-300 hover:text-blue-200 py-2 px-4 transition-all duration-300"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 border border-blue-700/50 group-hover:bg-blue-800/60 group-hover:border-blue-600/50 transition-all duration-300">
                <LogIn className="h-4 w-4" />
              </span>
              <span>
                Already have an account?{" "}
                <span className="font-medium underline decoration-blue-500/30 underline-offset-2 group-hover:decoration-blue-500/60">
                  Sign in
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
    </div>
  );
};

export default RegisterForm;
