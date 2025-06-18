import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Check, Info, UserCog } from "lucide-react";

// Define roles
interface Role {
  id: string;
  name: string;
  description: string;
  requiresKey: boolean;
}

const roles: Role[] = [
  {
    id: "user",
    name: "User",
    description: "Standard user with basic access",
    requiresKey: false,
  },
  {
    id: "editor",
    name: "Editor",
    description: "Can create and edit documents",
    requiresKey: false,
  },
  {
    id: "manager",
    name: "Manager",
    description: "Has additional team management capabilities",
    requiresKey: false,
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full system access",
    requiresKey: true,
  },
];

const AdminAccessForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  // Form state
  const [showKey, setShowKey] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedRole, setSelectedRole] = useState<string>(
    formData.role || "user"
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle role selection
  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData({ role: roleId });

    // Clear admin key if not needed
    const requiresKey = roles.find((r) => r.id === roleId)?.requiresKey;
    if (!requiresKey) {
      setFormData({ adminSecretKey: "" });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If admin role is selected, validate admin key
    if (selectedRole === "admin" && !formData.adminSecretKey) {
      setErrors({ adminSecretKey: "Admin key is required for Admin role" });
      setTouched({ adminSecretKey: true });
      return;
    }

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="role" className="flex items-center gap-1 mb-3">
            <UserCog className="h-3.5 w-3.5 text-blue-500" />
            Select User Role
          </Label>

          <div className="grid grid-cols-1 gap-3">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedRole === role.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => handleRoleSelection(role.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {selectedRole === role.id && (
                  <div className="absolute -right-2 -top-2 rounded-full bg-blue-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      selectedRole === role.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">
                      {role.name}
                      {role.requiresKey && (
                        <span className="ml-2 text-xs py-0.5 px-2 bg-amber-100 text-amber-700 rounded-full">
                          Requires Key
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedRole === "admin" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Label
              htmlFor="adminSecretKey"
              className="flex items-center gap-1 mb-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              Admin Secret Key
            </Label>
            <div className="relative">
              <Input
                id="adminSecretKey"
                name="adminSecretKey"
                type={showKey ? "text" : "password"}
                value={formData.adminSecretKey || ""}
                onChange={handleChange}
                onBlur={() => setTouched({ adminSecretKey: true })}
                placeholder="Enter admin secret key"
                className={
                  errors.adminSecretKey && touched.adminSecretKey
                    ? "border-red-300 pr-10"
                    : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1} // Prevent tab focus
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.adminSecretKey && touched.adminSecretKey && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {errors.adminSecretKey}
              </motion.p>
            )}
            <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 rounded-md">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                The admin key is provided to authorized administrators only. If
                you don't have an admin key, please select a different role.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default AdminAccessForm;
