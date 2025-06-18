import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { motion } from "framer-motion";
import { User, Building2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/hooks/useTranslation";

interface UserTypeStepProps {
  form: UseFormReturn<any>;
}

export function UserTypeStep({ form }: UserTypeStepProps) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <p className="text-blue-300">
        {t("userManagement.selectUserType")}
      </p>

      <FormField
        control={form.control}
        name="userType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex flex-col gap-4">
                <div
                  className={`group cursor-pointer border rounded-xl p-5 transition-all ${
                    field.value === "simple"
                      ? "border-blue-500 bg-blue-800/20"
                      : "border-blue-900/30 bg-blue-950/20 hover:bg-blue-900/20"
                  }`}
                  onClick={() => field.onChange("simple")}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-3 transition-all ${
                        field.value === "simple"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-900/30 text-blue-400 group-hover:bg-blue-800/40"
                      }`}
                    >
                      <User className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-blue-100">
                        {t("userManagement.personalUser")}
                      </h3>
                      <p className="text-sm text-blue-300">
                        {t("userManagement.personalUserDesc")}
                      </p>

                      {field.value === "simple" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-blue-200 mt-2 border-t border-blue-700/40 pt-2"
                        >
                          <ul className="list-disc list-inside space-y-1">
                            <li>{t("userManagement.accessPersonalDocs")}</li>
                            <li>{t("userManagement.basicWorkflow")}</li>
                            <li>{t("userManagement.limitedPermissions")}</li>
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`group cursor-pointer border rounded-xl p-5 transition-all ${
                    field.value === "company"
                      ? "border-blue-500 bg-blue-800/20"
                      : "border-blue-900/30 bg-blue-950/20 hover:bg-blue-900/20"
                  }`}
                  onClick={() => field.onChange("company")}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-3 transition-all ${
                        field.value === "company"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-900/30 text-blue-400 group-hover:bg-blue-800/40"
                      }`}
                    >
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-blue-100">
                        {t("userManagement.companyAccount")}
                      </h3>
                      <p className="text-sm text-blue-300">
                        {t("userManagement.companyAccountDesc")}
                      </p>

                      {field.value === "company" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-blue-200 mt-2 border-t border-blue-700/40 pt-2"
                        >
                          <ul className="list-disc list-inside space-y-1">
                            <li>{t("userManagement.advancedDocManagement")}</li>
                            <li>{t("userManagement.multiUserAccess")}</li>
                            <li>{t("userManagement.enhancedCollaboration")}</li>
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
