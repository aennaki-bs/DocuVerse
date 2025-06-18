import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AtSign, User, Check, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface UsernameEmailStepProps {
  form: UseFormReturn<any>;
  usernameAvailable: boolean | null;
  emailAvailable: boolean | null;
  usernameChecking: boolean;
  emailChecking: boolean;
}

export function UsernameEmailStep({
  form,
  usernameAvailable,
  emailAvailable,
  usernameChecking,
  emailChecking,
}: UsernameEmailStepProps) {
  const { t } = useTranslation();
  
  // Helper function to render availability indicator
  const renderAvailabilityIndicator = (
    isChecking: boolean,
    isAvailable: boolean | null,
    fieldName: string
  ) => {
    if (isChecking) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (isAvailable === true) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
          <Check className="h-4 w-4" />
        </div>
      );
    }

    if (isAvailable === false) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
          <AlertCircle className="h-4 w-4" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">{t("userManagement.username")}</h3>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">
                  {t("userManagement.chooseUsername")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder={t("userManagement.usernamePlaceholder")}
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                    {renderAvailabilityIndicator(
                      usernameChecking,
                      usernameAvailable,
                      "username"
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
                {usernameAvailable && (
                  <p className="text-xs text-green-400 mt-1">
                    {t("userManagement.usernameAvailable")}
                  </p>
                )}
              </FormItem>
            )}
          />

          <p className="text-xs text-blue-400 mt-1">
            {t("userManagement.usernameRequirement")}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <AtSign className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">{t("userManagement.emailAddress")}</h3>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">{t("userManagement.emailAddressLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                      <AtSign className="h-4 w-4" />
                    </div>
                    <Input
                      type="email"
                      placeholder={t("userManagement.emailPlaceholder")}
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                    {renderAvailabilityIndicator(
                      emailChecking,
                      emailAvailable,
                      "email"
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
                {emailAvailable && (
                  <p className="text-xs text-green-400 mt-1">
                    {t("userManagement.emailAvailable")}
                  </p>
                )}
              </FormItem>
            )}
          />

          <p className="text-xs text-blue-400 mt-1">
            {t("userManagement.emailVerification")}
          </p>
        </div>
      </div>
    </div>
  );
}
