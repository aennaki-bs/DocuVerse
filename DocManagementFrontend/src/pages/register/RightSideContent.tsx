import React from "react";
import {
  User,
  Building2,
  Lock,
  Shield,
  ExternalLink,
  Phone,
  MapPin,
  AtSign,
  CreditCard,
  Globe,
  CheckSquare,
  Key,
  Settings,
  CheckCircle,
  CloudUpload,
  FileText,
} from "lucide-react";
import { useMultiStepForm } from "@/context/form";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

interface LeftSideContentProps {
  currentStep: number;
}

const LeftSideContent: React.FC<LeftSideContentProps> = ({ currentStep }) => {
  const { formData } = useMultiStepForm();
  const isPersonal = formData.userType === "personal";

  // Array of content for each step
  const contentByStep = [
    // Step 0: Choose account type
    {
      title: "Welcome to DocuVerse",
      subtitle: "Choose the account type that best fits your needs",
      icon: <User className="h-12 w-12 text-blue-400" />,
      features: [
        {
          icon: <User className="h-6 w-6 text-blue-400" />,
          title: "Personal Account",
          description: "For individual users managing personal documents",
          color: "blue",
        },
        {
          icon: <Building2 className="h-6 w-6 text-green-400" />,
          title: "Company Account",
          description: "For businesses managing company documents",
          color: "green",
        },
        {
          icon: <Shield className="h-6 w-6 text-purple-400" />,
          title: "Secure & Personalized",
          description: "Your experience will be tailored to your account type",
          color: "purple",
        },
      ],
    },
    // Step 1: Account details
    {
      title: isPersonal ? "Personal Information" : "Company Information",
      subtitle: isPersonal
        ? "Complete your profile with personal details"
        : "Enter your company information",
      icon: isPersonal ? (
        <User className="h-12 w-12 text-blue-400" />
      ) : (
        <Building2 className="h-12 w-12 text-green-400" />
      ),
      features: [
        {
          icon: isPersonal ? (
            <User className="h-6 w-6 text-blue-400" />
          ) : (
            <Building2 className="h-6 w-6 text-green-400" />
          ),
          title: isPersonal ? "Personal Details" : "Company Details",
          description: isPersonal
            ? "Enter your name and identification"
            : "Enter company name and business number",
          color: isPersonal ? "blue" : "green",
        },
        {
          icon: <Phone className="h-6 w-6 text-indigo-400" />,
          title: "Contact Information",
          description: isPersonal
            ? "How we can reach you"
            : "Company contact details",
          color: "indigo",
        },
        {
          icon: <FileText className="h-6 w-6 text-cyan-400" />,
          title: "Document Management",
          description:
            "Once registered, you'll be able to manage all your documents",
          color: "cyan",
        },
      ],
    },
    // Step 2: Address information
    {
      title: isPersonal ? "Address Information" : "Company Address",
      subtitle: isPersonal
        ? "Add your personal address details"
        : "Add your company location details",
      icon: <MapPin className="h-12 w-12 text-amber-400" />,
      features: [
        {
          icon: <MapPin className="h-6 w-6 text-amber-400" />,
          title: isPersonal ? "Your Location" : "Company Location",
          description: isPersonal
            ? "Where you're located"
            : "Where your company is headquartered",
          color: "amber",
        },
        {
          icon: <Globe className="h-6 w-6 text-indigo-400" />,
          title: "Geographic Information",
          description: "City and country information",
          color: "indigo",
        },
        {
          icon: <FileText className="h-6 w-6 text-emerald-400" />,
          title: "Document Delivery",
          description: "Used for physical document delivery (optional)",
          color: "emerald",
        },
      ],
    },
    // Step 3: Credentials
    {
      title: "Account Credentials",
      subtitle: "Set up your login information",
      icon: <Key className="h-12 w-12 text-violet-400" />,
      features: [
        {
          icon: <User className="h-6 w-6 text-blue-400" />,
          title: "Username",
          description: "Create a unique username for your account",
          color: "blue",
        },
        {
          icon: <AtSign className="h-6 w-6 text-emerald-400" />,
          title: "Email Address",
          description: "We'll use this for verification and communication",
          color: "emerald",
        },
        {
          icon: <Lock className="h-6 w-6 text-rose-400" />,
          title: "Secure Password",
          description: "Create a strong password to protect your account",
          color: "rose",
        },
      ],
    },
    // Step 4: Admin access
    {
      title: "Admin Privileges",
      subtitle: "Optional administrative access",
      icon: <Shield className="h-12 w-12 text-amber-400" />,
      features: [
        {
          icon: <Settings className="h-6 w-6 text-amber-400" />,
          title: "Administrative Controls",
          description: "Access to system settings and configurations",
          color: "amber",
        },
        {
          icon: <Shield className="h-6 w-6 text-red-400" />,
          title: "Enhanced Security",
          description: "Requires verification with admin secret key",
          color: "red",
        },
        {
          icon: <User className="h-6 w-6 text-purple-400" />,
          title: "User Management",
          description: "Ability to manage other users in the system",
          color: "purple",
        },
      ],
    },
    // Step 5: Review
    {
      title: "Review Your Information",
      subtitle: "Finalize your registration",
      icon: <CheckCircle className="h-12 w-12 text-emerald-400" />,
      features: [
        {
          icon: <CheckSquare className="h-6 w-6 text-emerald-400" />,
          title: "Verification",
          description: "Review all provided information for accuracy",
          color: "emerald",
        },
        {
          icon: <CloudUpload className="h-6 w-6 text-blue-400" />,
          title: "Complete Registration",
          description: "Submit your information to create your account",
          color: "blue",
        },
        {
          icon: <FileText className="h-6 w-6 text-indigo-400" />,
          title: "Start Using DocuVerse",
          description:
            "Access the document management system after registration",
          color: "indigo",
        },
      ],
    },
  ];

  // Get content for current step
  const content = contentByStep[currentStep] || contentByStep[0];

  return (
    <MotionDiv
      key={`side-content-${currentStep}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mx-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-6">
        {content.icon}
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>
      <p className="text-lg text-gray-300 mb-10">{content.subtitle}</p>

      <div className="space-y-6">
        {content.features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30 hover:border-blue-600/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            <div className={`bg-${feature.color}-500/20 p-3 rounded-full`}>
              {feature.icon}
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </MotionDiv>
  );
};

export default LeftSideContent;
