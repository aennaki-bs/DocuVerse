import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import adminService from "@/services/adminService";
import authService from "@/services/authService";
import {
  Building2,
  User,
  MapPin,
  AtSign,
  Key,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CircleCheck,
  PenLine,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// Import step components
import { UserTypeStep } from "./steps/UserTypeStep";
import { AccountDetailsStep } from "./steps/AccountDetailsStep";
import { AddressStep } from "./steps/AddressStep";
import { UsernameEmailStep } from "./steps/UsernameEmailStep";
import { PasswordStep } from "./steps/PasswordStep";
import { RoleStep } from "./steps/RoleStep";
import { ReviewStep } from "./steps/ReviewStep";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Password must contain at least one number.",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must contain at least one special character.",
  });

// Form schema with all required fields
const formSchema = z.object({
  // User type selection
  userType: z.enum(["simple", "company"], {
    required_error: "Please select a user type.",
  }),

  // Account details
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  cin: z.string().optional(),
  companyName: z.string().optional(),

  // Address information
  address: z.string().min(2, {
    message: "Address is required.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  phoneNumber: z.string().min(6, {
    message: "Phone number is required.",
  }),
  webSite: z.string().optional(),

  // Username & Email
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),

  // Password
  passwordHash: passwordSchema,

  // Role selection
  roleName: z.enum(["Admin", "FullUser", "SimpleUser"], {
    required_error: "Please select a user role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserMultiStepProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Step configuration
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CreateUserMultiStep({
  open,
  onOpenChange,
}: CreateUserMultiStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [direction, setDirection] = useState(0);
  const { t } = useTranslation();

  // Define steps for the form
  const steps: Step[] = [
    {
      id: 0,
      title: t("userManagement.userTypeStep"),
      description: t("userManagement.userTypeStepDesc"),
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 1,
      title: t("userManagement.accountDetailsStep"),
      description: t("userManagement.accountDetailsStepDesc"),
      icon: <PenLine className="h-5 w-5" />,
    },
    {
      id: 2,
      title: t("userManagement.addressStep"),
      description: t("userManagement.addressStepDesc"),
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 3,
      title: t("userManagement.usernameEmailStep"),
      description: t("userManagement.usernameEmailStepDesc"),
      icon: <AtSign className="h-5 w-5" />,
    },
    {
      id: 4,
      title: t("userManagement.passwordStep"),
      description: t("userManagement.passwordStepDesc"),
      icon: <Key className="h-5 w-5" />,
    },
    {
      id: 5,
      title: t("userManagement.adminAccessStep"),
      description: t("userManagement.adminAccessStepDesc"),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: 6,
      title: t("userManagement.reviewStep"),
      description: t("userManagement.reviewStepDesc"),
      icon: <CircleCheck className="h-5 w-5" />,
    },
  ];

  // Form initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "simple",
      firstName: "",
      lastName: "",
      cin: "",
      companyName: "",
      address: "",
      city: "",
      country: "",
      phoneNumber: "",
      webSite: "",
      username: "",
      email: "",
      passwordHash: "",
      roleName: "SimpleUser",
    },
    mode: "onChange",
  });

  // Watch for values
  const userType = form.watch("userType");
  const username = form.watch("username");
  const email = form.watch("email");

  // Username availability check
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (username && username.length >= 3) {
      setUsernameAvailable(null);
      setUsernameChecking(true);

      timeoutId = setTimeout(async () => {
        try {
          const isAvailable = await authService.validateUsername(username);
          setUsernameAvailable(isAvailable);
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameAvailable(false);
        } finally {
          setUsernameChecking(false);
        }
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [username]);

  // Email availability check
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      setEmailChecking(true);

      timeoutId = setTimeout(async () => {
        try {
          const isAvailable = await authService.validateEmail(email);
          setEmailAvailable(isAvailable);
        } catch (error) {
          console.error("Error checking email:", error);
          setEmailAvailable(false);
        } finally {
          setEmailChecking(false);
        }
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Reset form and state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset everything when dialog opens
      setCurrentStep(0);
      setIsSubmitting(false);
      setUsernameAvailable(null);
      setEmailAvailable(null);
      setUsernameChecking(false);
      setEmailChecking(false);
      form.reset({
        userType: "simple",
        firstName: "",
        lastName: "",
        cin: "",
        companyName: "",
        address: "",
        city: "",
        country: "",
        phoneNumber: "",
        webSite: "",
        username: "",
        email: "",
        passwordHash: "",
        roleName: "SimpleUser",
      });
    }
  }, [open, form]);

  // Helper functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validation for specific steps
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["userType"];
        break;
      case 1:
        fieldsToValidate =
          userType === "simple" ? ["firstName", "lastName"] : ["companyName"];
        break;
      case 2:
        fieldsToValidate = ["address", "city", "country", "phoneNumber"];
        break;
      case 3:
        fieldsToValidate = ["username", "email"];
        // Also check if username and email are available
        if (usernameAvailable === false) {
          form.setError("username", {
            message: "This username is already taken. Please choose a different one.",
          });
          return false;
        }
        if (usernameAvailable === null && username && username.length >= 3) {
          form.setError("username", {
            message: "Please wait while we check username availability...",
          });
          return false;
        }
        if (emailAvailable === false) {
          form.setError("email", {
            message: "This email address is already registered. Please use a different email.",
          });
          return false;
        }
        if (emailAvailable === null && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          form.setError("email", {
            message: "Please wait while we check email availability...",
          });
          return false;
        }
        break;
      case 4:
        fieldsToValidate = ["passwordHash"];
        break;
      case 5:
        fieldsToValidate = ["roleName"];
        break;
      case 6:
        // Review step, no validation needed
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  // Navigation between steps
  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit the form - only called when explicitly triggered on review step
  const onSubmit = async (values: FormValues) => {
    // Only allow submission from the review step
    if (currentStep !== 6) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data for API call
      const userData = {
        email: values.email,
        username: values.username,
        passwordHash: values.passwordHash,
        firstName:
          userType === "simple" ? values.firstName : values.companyName || "",
        lastName: userType === "simple" ? values.lastName : "",
        roleName: values.roleName,
        // Additional fields from the form
        phoneNumber: values.phoneNumber,
        address: values.address,
        city: values.city,
        country: values.country,
        webSite: values.webSite,
        userType: values.userType,
        // CIN field for personal users (optional)
        cin: userType === "simple" ? values.cin : undefined,
      };

      await adminService.createUser(userData);
      toast.success("User created successfully");
      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);

      let errorMessage = "Failed to create user";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission - prevent auto-submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission on the review step when explicitly triggered
    if (currentStep === 6) {
      form.handleSubmit(onSubmit)(e);
    }
  };

  // Handle keyboard events - prevent Enter key from submitting form on non-review steps
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== 6) {
      e.preventDefault();
      // Trigger next step instead of form submission
      nextStep();
    }
  };

  // Animation variants
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

  // Render appropriate step content based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <UserTypeStep form={form} />;
      case 1:
        return <AccountDetailsStep form={form} />;
      case 2:
        return <AddressStep form={form} />;
      case 3:
        return (
          <UsernameEmailStep
            form={form}
            usernameAvailable={usernameAvailable}
            emailAvailable={emailAvailable}
            usernameChecking={usernameChecking}
            emailChecking={emailChecking}
          />
        );
      case 4:
        return (
          <PasswordStep
            form={form}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        );
      case 5:
        return <RoleStep form={form} />;
      case 6:
        return <ReviewStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl p-0 overflow-hidden sm:max-w-[620px] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 border-b border-blue-900/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              {t("userManagement.createUserTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300">
            {t("userManagement.createUserSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-5">
              {/* Step indicators */}
              <div className="px-6 pt-6 pb-0">
                <div className="flex justify-between items-center">
                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center min-h-[60px]">
                      <div
                        className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                          currentStep === step.id
                            ? "bg-blue-600 border-blue-400 text-white scale-110"
                            : currentStep > step.id
                            ? "bg-green-600/30 border-green-400/50 text-green-300"
                            : "bg-blue-900/30 border-blue-900/50 text-blue-300/50"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          step.icon
                        )}

                        {/* Connecting line */}
                        {step.id < steps.length - 1 && (
                          <div
                            className={`absolute top-1/2 left-full w-[calc(100%-10px)] h-[2px] -translate-y-1/2 transition-all duration-300 ${
                              currentStep > step.id
                                ? "bg-green-500/50"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                        )}
                      </div>

                      {/* Step label only shows for current step */}
                      {currentStep === step.id && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-blue-300 font-medium text-center w-20 mt-3"
                        >
                          {step.title}
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic step content */}
              <div className="px-6 space-y-6 min-h-[300px]">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
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
                    <div className="py-2">
                      <h3 className="text-lg font-semibold mb-1 text-blue-100">
                        {steps[currentStep].title}
                      </h3>
                      <p className="text-sm text-blue-300 mb-4">
                        {steps[currentStep].description}
                      </p>

                      {/* Render step content */}
                      {renderStepContent()}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="px-6 pb-6 pt-2 border-t border-blue-900/30 flex justify-between items-center">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`border border-blue-900/50 transition-all duration-200 flex items-center gap-2 ${
                    currentStep === 0
                      ? "opacity-50 bg-blue-950/30 text-blue-300/50"
                      : "bg-blue-900/50 hover:bg-blue-800/50 text-blue-300"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("userManagement.back")}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                  >
                    {t("userManagement.next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={isSubmitting}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting ? t("userManagement.creating") : t("userManagement.createUserButton")}
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
