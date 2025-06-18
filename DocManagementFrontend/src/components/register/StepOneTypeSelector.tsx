import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMultiStepForm } from "@/context/form";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Check, ChevronRight } from "lucide-react";

// Styled account type card component
const AccountTypeCard = ({
  type,
  title,
  description,
  icon,
  // features,
  selected,
  onClick,
}: {
  type: "personal" | "company";
  title: string;
  description: string;
  icon: React.ReactNode;
  // features: string[];
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex flex-col rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden h-full
        ${
          selected
            ? "border-2 border-blue-500 bg-blue-900/20"
            : "border border-blue-900/50 bg-blue-950/30 hover:bg-blue-900/20"
        }`}
      onClick={onClick}
    >
      {/* Badge at top */}
      <div className="w-full bg-blue-900/40 px-4 py-2.5 flex items-center justify-between">
        <Badge
          variant="outline"
          className="bg-blue-800/50 text-xs text-blue-300 border-blue-700/50 px-2 py-0.5"
        >
          {type === "personal" ? "Individual" : "Business"}
        </Badge>

        {/* Selected indicator */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-500 text-white p-1 rounded-full"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        )}
      </div>

      {/* Content area */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Icon and title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-full w-12 h-12 flex items-center justify-center ${
              selected
                ? "bg-blue-600/30 text-blue-300"
                : "bg-blue-900/40 text-blue-400/70"
            }`}
          >
            {icon}
          </div>
          <h3 className="text-lg font-medium text-blue-100">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-blue-300/80 mb-5">{description}</p>

        {/* Features list */}
        {/* <ul className="space-y-3 mt-auto">
          {features.map((feature, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { delay: i * 0.1 },
              }}
              className="flex items-center gap-2.5 text-sm text-blue-200"
            >
              <div className="flex-shrink-0 p-0.5 bg-blue-800/50 rounded-full">
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
              {feature}
            </motion.li>
          ))}
        </ul> */}
      </div>

      {/* Card decoration */}
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-5">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="40"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="20"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M20 80 H140 M80 20 V140"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>
    </motion.div>
  );
};

const UserTypeSelection: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();
  const [selectedType, setSelectedType] = useState<"personal" | "company">(
    formData.userType || "personal"
  );

  // Handle type selection
  const handleTypeSelect = (type: "personal" | "company") => {
    setSelectedType(type);
    setFormData({ userType: type });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Account */}
        <AccountTypeCard
          type="personal"
          title="Personal Account"
          description="For individual users who want to manage their own documents"
          icon={<User size={24} />}
          // features={[
          //   "Store and organize your documents",
          //   "Share documents with others",
          //   "Access from any device",
          //   "User-friendly dashboard",
          // ]}
          selected={selectedType === "personal"}
          onClick={() => handleTypeSelect("personal")}
        />

        {/* Company Account */}
        <AccountTypeCard
          type="company"
          title="Company Account"
          description="For businesses and organizations with multiple users"
          icon={<Building2 size={24} />}
          // features={[
          //   "Multi-user collaboration",
          //   "Advanced security features",
          //   "Custom workflow automation",
          //   "User permissions management",
          // ]}
          selected={selectedType === "company"}
          onClick={() => handleTypeSelect("company")}
        />
      </div>

      {/* Information message */}
      <div className="bg-blue-900/30 rounded-lg p-4 text-sm text-blue-300 border border-blue-800/30">
        <p className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-400"
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
          Select the account type that best fits your needs. You can't change
          this later.
        </p>
      </div>

      {/* ERP decoration */}
      <div className="flex justify-center mt-4 opacity-20">
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
          <circle cx="60" cy="10" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="20" cy="10" r="2" fill="currentColor" fillOpacity="0.6" />
          <circle
            cx="100"
            cy="10"
            r="2"
            fill="currentColor"
            fillOpacity="0.6"
          />
        </svg>
      </div>
    </form>
  );
};

export default UserTypeSelection;
