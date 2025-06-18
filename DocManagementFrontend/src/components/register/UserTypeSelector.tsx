import React from "react";
import { useMultiStepForm } from "@/context/form";
import { User, Building2, Check } from "lucide-react";
import { motion } from "framer-motion";

const UserTypeSelector: React.FC = () => {
  const { formData, setFormData } = useMultiStepForm();
  const userType = formData.userType || "";

  const handleSelection = (type: "personal" | "company") => {
    setFormData({ userType: type });
  };

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TypeCard
          title="Personal Account"
          description="For individual users managing their personal documents"
          icon={<User className="h-6 w-6" />}
          selected={userType === "personal"}
          onClick={() => handleSelection("personal")}
          features={[
            "Personal document management",
            "Individual workflow",
            "Basic sharing capabilities",
            "Personal dashboard",
          ]}
        />

        <TypeCard
          title="Company Account"
          description="For businesses with multiple users and advanced document needs"
          icon={<Building2 className="h-6 w-6" />}
          selected={userType === "company"}
          onClick={() => handleSelection("company")}
          features={[
            "Team collaboration tools",
            "Advanced document workflows",
            "Role-based access control",
            "Analytics and reporting",
          ]}
        />
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Choose the account type that best fits your needs. You'll be able to
          customize your experience after registration.
        </p>
      </div>
    </div>
  );
};

interface TypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  features: string[];
}

const TypeCard: React.FC<TypeCardProps> = ({
  title,
  description,
  icon,
  selected,
  onClick,
  features,
}) => {
  return (
    <motion.div
      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {selected && (
        <div className="absolute -right-2 -top-2 rounded-full bg-blue-500 p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div
          className={`rounded-full p-3 ${
            selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                selected ? "bg-blue-500" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserTypeSelector;
