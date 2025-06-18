import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Key, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface PasswordStepProps {
  form: UseFormReturn<any>;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

export function PasswordStep({
  form,
  showPassword,
  togglePasswordVisibility,
}: PasswordStepProps) {
  const password = form.watch("passwordHash");
  const { t } = useTranslation();

  // Password strength indicators
  const hasMinLength = password?.length >= 8;
  const hasUppercase = /[A-Z]/.test(password || "");
  const hasLowercase = /[a-z]/.test(password || "");
  const hasNumber = /[0-9]/.test(password || "");
  const hasSpecial = /[^A-Za-z0-9]/.test(password || "");

  // Calculate password strength
  const calculateStrength = () => {
    let strength = 0;
    if (hasMinLength) strength += 1;
    if (hasUppercase) strength += 1;
    if (hasLowercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;
    return strength;
  };

  const passwordStrength = calculateStrength();

  // Get color based on strength
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  // Get description based on strength
  const getStrengthText = () => {
    if (passwordStrength <= 2) return t("userManagement.weak");
    if (passwordStrength <= 3) return t("userManagement.fair");
    if (passwordStrength <= 4) return t("userManagement.good");
    return t("userManagement.strong");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            {t("userManagement.createPassword")}
          </h3>
        </div>

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="passwordHash"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">{t("userManagement.password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("userManagement.passwordPlaceholder")}
                      {...field}
                      className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-blue-400 hover:text-blue-300 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-300">{t("userManagement.passwordStrength")}</span>
                  <span
                    className={
                      password
                        ? passwordStrength <= 2
                          ? "text-red-400"
                          : passwordStrength <= 3
                          ? "text-yellow-400"
                          : passwordStrength <= 4
                          ? "text-blue-400"
                          : "text-green-400"
                        : "text-blue-300"
                    }
                  >
                    {password ? getStrengthText() : "None"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-blue-950/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <RequirementItem
                  text={t("userManagement.atLeast8Chars")}
                  met={hasMinLength}
                />
                <RequirementItem
                  text={t("userManagement.atLeastOneUppercase")}
                  met={hasUppercase}
                />
                <RequirementItem
                  text={t("userManagement.atLeastOneLowercase")}
                  met={hasLowercase}
                />
                <RequirementItem
                  text={t("userManagement.atLeastOneNumber")}
                  met={hasNumber}
                />
                <RequirementItem
                  text={t("userManagement.atLeastOneSpecial")}
                  met={hasSpecial}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {t("userManagement.passwordProtection")}
        </p>
      </div>
    </div>
  );
}

// Helper component for password requirements
function RequirementItem({ text, met }: { text: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <div className="text-green-400">
          <Check className="h-4 w-4" />
        </div>
      ) : (
        <div className="text-red-400">
          <X className="h-4 w-4" />
        </div>
      )}
      <span className={met ? "text-green-300" : "text-red-300"}>{text}</span>
    </div>
  );
}
