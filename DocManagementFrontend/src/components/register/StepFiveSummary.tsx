import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  User,
  Building2,
  MapPin,
  AtSign,
  Lock,
  Shield,
  Loader2,
} from "lucide-react";

const ReviewForm: React.FC = () => {
  const { formData, registerUser } = useMultiStepForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPersonal = formData.userType === "personal";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await registerUser();
      if (success) {
        navigate("/registration-success");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group form fields for display
  const accountTypeInfo = {
    title: "Account Type",
    icon: <User className="h-5 w-5" />,
    data: [
      {
        label: "Account Type",
        value: isPersonal ? "Personal Account" : "Company Account",
      },
    ],
  };

  const personalInfo = {
    title: "Personal Information",
    icon: <User className="h-5 w-5" />,
    data: [
      { label: "First Name", value: formData.firstName },
      { label: "Last Name", value: formData.lastName },
    ],
  };

  const addressInfo = {
    title: "Address Information",
    icon: <MapPin className="h-5 w-5" />,
    data: [
      {
        label: "Address",
        value: isPersonal ? formData.personalAddress : formData.companyAddress,
      },
      { label: "City", value: formData.city },
      { label: "Country", value: formData.country },
      {
        label: "Phone Number",
        value: isPersonal ? formData.personalPhone : formData.companyPhone,
      },
    ],
  };

  const accountInfo = {
    title: "Account Information",
    icon: <AtSign className="h-5 w-5" />,
    data: [
      { label: "Username", value: formData.username },
      { label: "Email", value: formData.email },
    ],
  };

  const securityInfo = {
    title: "Security",
    icon: <Lock className="h-5 w-5" />,
    data: [
      { label: "Password", value: "••••••••" }, // Don't show actual password
    ],
  };

  const adminInfo = {
    title: "Admin Access",
    icon: <Shield className="h-5 w-5" />,
    data: [
      {
        label: "Admin Secret Key",
        value: formData.adminSecretKey ? "••••••••" : "Not provided",
      },
    ],
  };

  // All sections to display
  const sections = [
    accountTypeInfo,
    personalInfo,
    addressInfo,
    accountInfo,
    securityInfo,
    adminInfo,
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">Review Your Information</h2>
        <p className="text-sm text-gray-500">
          Please review your information before creating your account.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border rounded-lg overflow-hidden"
          >
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                {section.icon}
              </div>
              <h3 className="font-medium">{section.title}</h3>
            </div>

            <div className="p-4 space-y-2">
              {section.data.map((item) => (
                <div key={item.label} className="grid grid-cols-2 gap-4">
                  <div className="text-sm text-gray-500">{item.label}</div>
                  <div className="text-sm font-medium break-words">
                    {item.value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full text-blue-600 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Everything looks good?
              </h3>
              <p className="text-xs text-blue-600 mt-1">
                By clicking "Create Account", you agree to our Terms of Service
                and Privacy Policy. After registration, you'll need to verify
                your email address.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
