import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

const AdminAccessForm: React.FC = () => {
  const { formData, setFormData } = useMultiStepForm();

  // Form state
  const [showKey, setShowKey] = useState(false);

  // Initialize adminKeyRequired from formData
  const adminKeyRequired = formData.requestAdminAccess || false;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  // Handle checkbox toggle
  const handleToggleAdminKey = () => {
    const newState = !adminKeyRequired;
    
    // Update the form data
    setFormData({
      requestAdminAccess: newState,
      role: newState ? "admin" : "user",
      // Clear the admin key if not required
      adminSecretKey: newState ? formData.adminSecretKey : "",
    });
  };

  // Helper function to determine input border color based on error state
  const getInputBorderClass = (field: string) => {
    if (formData.validationError && adminKeyRequired && !formData.adminSecretKey) {
      return "border-red-500/70 focus:border-red-500/70 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_0_15px_rgba(239,68,68,0.2)]";
    }
    return "border-blue-900/50 focus:border-blue-500/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]";
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-full bg-blue-800/20 text-blue-400">
            <Shield className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-medium text-blue-200">Admin Access</h3>
        </div>

        <div className="space-y-3">
          {/* Admin Key Toggle */}
          <div
            className={`relative rounded-lg p-3 cursor-pointer transition-all border-2 ${
              adminKeyRequired
                ? "border-amber-500/70 bg-amber-900/10"
                : "border-blue-800/30 bg-blue-900/20 hover:border-blue-700/40"
            }`}
            onClick={handleToggleAdminKey}
          >
            <div className="flex items-center">
              <div className="mr-3 flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
                    adminKeyRequired
                      ? "bg-amber-500 border-amber-400"
                      : "border-blue-700/50 bg-blue-900/40"
                  }`}
                >
                  {adminKeyRequired && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <span
                  className={`text-sm font-medium ${
                    adminKeyRequired ? "text-amber-300" : "text-blue-200"
                  }`}
                >
                  Request Admin Access
                </span>
                <p className="text-xs text-blue-300/80 mt-0.5">
                  Full system access with administrator privileges
                </p>
                {adminKeyRequired && (
                  <span className="inline-block mt-1 text-xs py-0.5 px-2 bg-amber-900/40 text-amber-300 rounded-sm border border-amber-700/50">
                    Requires Key
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Key Input - Only shown when toggle is active */}
          {adminKeyRequired && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor="adminSecretKey"
                className="text-blue-200 text-xs flex items-center gap-1"
              >
                Admin Secret Key <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <Shield className="h-4 w-4" />
                </div>
                <Input
                  id="adminSecretKey"
                  name="adminSecretKey"
                  type={showKey ? "text" : "password"}
                  value={formData.adminSecretKey || ""}
                  onChange={handleChange}
                  placeholder="Enter admin secret key"
                  className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                    "adminSecretKey"
                  )} text-white placeholder:text-blue-300/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {formData.validationError && adminKeyRequired && !formData.adminSecretKey && (
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
              {formData.validationError && adminKeyRequired && !formData.adminSecretKey && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  Admin key is required when requesting admin access
                </motion.p>
              )}
              <div className="mt-2 text-xs text-blue-300 bg-blue-900/30 rounded-lg p-2.5 border border-blue-800/30">
                <p className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-blue-400 flex-shrink-0"
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
                  The admin key is provided to authorized administrators only.
                  If you don't have an admin key, please uncheck this option.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccessForm;
