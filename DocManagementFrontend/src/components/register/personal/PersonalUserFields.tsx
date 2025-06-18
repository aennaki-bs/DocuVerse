import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Phone, CheckCircle2 } from "lucide-react";

interface PersonalUserFieldsProps {
  formData: {
    firstName: string;
    lastName: string;
    cin?: string;
    personalPhone?: string;
  };
  localErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalUserFields: React.FC<PersonalUserFieldsProps> = ({
  formData,
  localErrors,
  handleChange,
}) => {
  // Helper function to determine if a field is valid
  const isFieldValid = (fieldName: string, value?: string) => {
    return value && value.trim().length > 0 && !localErrors[fieldName];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Name */}
      <div className="space-y-1">
        <Label
          htmlFor="firstName"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-400" />
            <span>First Name</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="firstName"
            name="firstName"
            placeholder="First Name"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={formData.firstName && !!localErrors.firstName}
            value={formData.firstName}
            onChange={handleChange}
          />
          {isFieldValid("firstName", formData.firstName) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.firstName && (
          <p className="text-xs text-red-500">{localErrors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <Label
          htmlFor="lastName"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-400" />
            <span>Last Name</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={formData.lastName && !!localErrors.lastName}
            value={formData.lastName}
            onChange={handleChange}
          />
          {isFieldValid("lastName", formData.lastName) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.lastName && (
          <p className="text-xs text-red-500">{localErrors.lastName}</p>
        )}
      </div>

      {/* CIN (Optional) */}
      <div className="space-y-1">
        <Label
          htmlFor="cin"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-amber-400" />
            <span>CIN (ID Number) - Optional</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <CreditCard className="h-4 w-4" />
          </div>
          <Input
            id="cin"
            name="cin"
            placeholder="National ID Number (Optional)"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={formData.cin && !!localErrors.cin}
            value={formData.cin || ""}
            onChange={handleChange}
          />
          {isFieldValid("cin", formData.cin) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.cin && (
          <p className="text-xs text-red-500">{localErrors.cin}</p>
        )}
      </div>

      {/* Phone Number (Optional) */}
      <div className="space-y-1">
        <Label
          htmlFor="personalPhone"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-400" />
            <span>Phone Number - Optional</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Phone className="h-4 w-4" />
          </div>
          <Input
            id="personalPhone"
            name="personalPhone"
            placeholder="Your Phone Number (Optional)"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={formData.personalPhone && !!localErrors.personalPhone}
            value={formData.personalPhone || ""}
            onChange={handleChange}
          />
          {isFieldValid("personalPhone", formData.personalPhone) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.personalPhone && (
          <p className="text-xs text-red-500">{localErrors.personalPhone}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalUserFields;
