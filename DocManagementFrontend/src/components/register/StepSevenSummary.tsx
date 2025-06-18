import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  MapPin,
  AtSign,
  Key,
  Shield,
  Check,
  Loader2,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Form data interface to provide proper typing
interface FormData {
  userType?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  companyName?: string;
  companyRC?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  website?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roleName?: string;
  requestAdminAccess?: boolean;
  [key: string]: any;
}

// Review section interface
interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    value: React.ReactNode;
    private?: boolean;
    valueClass?: string;
  }[];
  stepIndex: number;
  onEdit: (stepIndex: number) => void;
  expanded?: boolean;
  toggleExpand?: () => void;
}

const ReviewStep: React.FC = () => {
  const { formData, submitForm, goToStep, stepValidation } = useMultiStepForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  // Typed formData for better TypeScript support
  const typedFormData = formData as FormData;

  const isPersonal = typedFormData.userType === "personal";

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await submitForm();
      if (!success) {
        // If submission failed, reset the submitting state
        setIsSubmitting(false);
      }
      // If successful, the submitForm function handles navigation
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Function to handle edit button click
  const handleEdit = (stepIndex: number) => {
    if (goToStep) {
      goToStep(stepIndex);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionIndex: number) => {
    setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex);
  };

  // Format personal name
  const formatName = () => {
    if (isPersonal) {
      return `${typedFormData.firstName || ""} ${typedFormData.lastName || ""}`;
    }
    return typedFormData.companyName || "";
  };

  // Format address
  const formatAddress = () => {
    const parts = [
      typedFormData.address,
      typedFormData.city,
      typedFormData.state,
      typedFormData.zipCode,
      typedFormData.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Format role with proper styling
  const formatRole = () => {
    if (typedFormData.requestAdminAccess) {
      return <span className="text-amber-300">Admin Access Requested</span>;
    }
    return <span className="text-blue-300">Standard User</span>;
  };

  // Define review sections
  const reviewSections = [
    {
      title: "Account Type",
      icon: <User className="h-5 w-5" />,
      items: [
        {
          label: "Account Type",
          value: isPersonal ? "Personal User" : "Company Account",
          valueClass: isPersonal ? "text-blue-300" : "text-emerald-300",
        },
      ],
      stepIndex: 0,
    },
    {
      title: isPersonal ? "Personal Information" : "Company Information",
      icon: isPersonal ? (
        <User className="h-5 w-5" />
      ) : (
        <Building2 className="h-5 w-5" />
      ),
      items: isPersonal
        ? [
            { label: "Full Name", value: formatName() },
            { label: "ID Number", value: typedFormData.cin || "-" },
          ]
        : [
            { label: "Company Name", value: typedFormData.companyName || "-" },
            {
              label: "Registration Number",
              value: typedFormData.companyRC || "-",
            },
            { label: "Industry", value: typedFormData.industry || "-" },
          ],
      stepIndex: 1,
    },
    {
      title: "Contact Information",
      icon: <MapPin className="h-5 w-5" />,
      items: [
        { label: "Address", value: formatAddress() },
        { label: "Phone", value: typedFormData.phoneNumber || "-" },
        ...(isPersonal
          ? []
          : [{ label: "Website", value: typedFormData.website || "-" }]),
      ],
      stepIndex: 2,
    },
    {
      title: "Account Credentials",
      icon: <AtSign className="h-5 w-5" />,
      items: [
        { label: "Username", value: typedFormData.username || "-" },
        { label: "Email", value: typedFormData.email || "-" },
      ],
      stepIndex: 3,
    },
    {
      title: "Security",
      icon: <Key className="h-5 w-5" />,
      items: [{ label: "Password", value: "●●●●●●●●●", private: true }],
      stepIndex: 4,
    },
    {
      title: "Access Level",
      icon: <Shield className="h-5 w-5" />,
      items: [
        { 
          label: "Access Type", 
          value: formatRole() 
        },
        ...(typedFormData.requestAdminAccess ? [
          { 
            label: "Admin Key", 
            value: typedFormData.adminSecretKey ? "●●●●●●●●●" : "Not provided",
            private: true 
          }
        ] : [])
      ],
      stepIndex: 5,
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Summary header */}
        <div className="bg-blue-800/20 rounded-lg border border-blue-700/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-100 mb-1">
                {formatName()}
              </h3>
              <p className="text-sm text-blue-300">
                {isPersonal ? "Personal Account" : "Company Account"} •{" "}
                {typedFormData.email}
              </p>
            </div>

            <div className="p-3 rounded-full bg-blue-700/20 text-blue-400">
              {isPersonal ? (
                <User className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>

        {/* Review sections */}
        <div className="space-y-4">
          <AnimatePresence>
            {reviewSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReviewSection
                  {...section}
                  onEdit={handleEdit}
                  expanded={expandedSection === index}
                  toggleExpand={() => toggleSection(index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Confirmation message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-900/20 rounded-lg p-4 text-sm text-green-300 border border-green-800/30 flex items-center gap-3"
        >
          <div className="p-2 rounded-full bg-green-500/20 text-green-400">
            <Check className="h-4 w-4" />
          </div>
          <p>
            Please review all information carefully before completing
            registration. Click on any section to edit if needed.
          </p>
        </motion.div>

        {/* Error Display - Moved to bottom for better visibility */}
        {stepValidation.errors.registration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-red-900/30 border-2 border-red-500/50 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-500/20 text-red-400 mt-0.5">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-200 mb-2">
                  Registration Error
                </h3>
                <p className="text-red-100 mb-3">
                  {stepValidation.errors.registration}
                </p>
                <div className="text-sm text-red-300 bg-red-800/20 p-3 rounded border border-red-700/30">
                  <p className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    Please review your information and try again. You can edit any section by clicking the "Edit" button.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || stepValidation.isLoading || !!stepValidation.errors.registration}
            className={`transition-all duration-200 flex items-center gap-2 ${
              stepValidation.errors.registration
                ? "bg-gray-600/50 text-gray-300 border border-gray-600/50 cursor-not-allowed"
                : "bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            }`}
          >
            {(isSubmitting || stepValidation.isLoading) ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : stepValidation.errors.registration ? (
              <>
                <svg
                  className="h-4 w-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Fix Errors to Continue
              </>
            ) : (
              <>Complete Registration</>
            )}
          </Button>
        </div>

        {/* ERP decoration */}
        <div className="flex justify-center mt-6 opacity-20">
          <svg
            width="120"
            height="20"
            viewBox="0 0 120 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="circuit"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 10h20M10 0v20"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
            <rect width="120" height="20" fill="url(#circuit)" />
            <circle
              cx="60"
              cy="10"
              r="3"
              fill="currentColor"
              fillOpacity="0.8"
            />
            <circle
              cx="20"
              cy="10"
              r="2"
              fill="currentColor"
              fillOpacity="0.6"
            />
            <circle
              cx="100"
              cy="10"
              r="2"
              fill="currentColor"
              fillOpacity="0.6"
            />
          </svg>
        </div>
      </motion.div>
    </form>
  );
};

// Review Section Component
const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  items,
  stepIndex,
  onEdit,
  expanded = false,
  toggleExpand,
}) => {
  return (
    <div className="border border-blue-900/30 rounded-lg overflow-hidden">
      {/* Section header */}
      <div
        className="bg-blue-900/30 p-4 flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-900/40 text-blue-400">
            {icon}
          </div>
          <h4 className="text-sm font-medium text-blue-200">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(stepIndex);
            }}
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-blue-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-400" />
          )}
        </div>
      </div>

      {/* Section content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-blue-900/30 bg-blue-950/30">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-xs text-blue-400">{item.label}</div>
                    <div className={item.valueClass || "text-blue-100"}>
                      {item.value || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewStep;
