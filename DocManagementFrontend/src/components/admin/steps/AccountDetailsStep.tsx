import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AccountDetailsStepProps {
  form: UseFormReturn<any>;
}

export function AccountDetailsStep({ form }: AccountDetailsStepProps) {
  const userType = form.watch("userType");
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {userType === "simple" ? (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-blue-200">
                  {t("userManagement.personalInformation")}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">
                        {t("userManagement.firstName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("userManagement.firstNamePlaceholder")}
                          {...field}
                          className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">{t("userManagement.lastName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("userManagement.lastNamePlaceholder")}
                          {...field}
                          className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="company"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-blue-200">
                  {t("userManagement.companyInformation")}
                </h3>
              </div>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">
                      {t("userManagement.companyName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("userManagement.companyNamePlaceholder")}
                        {...field}
                        className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {t("userManagement.identificationInfo")}
        </p>
      </div>
    </div>
  );
}
