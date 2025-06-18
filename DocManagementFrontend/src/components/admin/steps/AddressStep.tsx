import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MapPin, Phone, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AddressStepProps {
  form: UseFormReturn<any>;
}

export function AddressStep({ form }: AddressStepProps) {
  const userType = form.watch("userType");
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            {t("userManagement.contactInformation")}
          </h3>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">{t("userManagement.address")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("userManagement.addressPlaceholder")}
                    {...field}
                    className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">{t("userManagement.city")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("userManagement.cityPlaceholder")}
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">{t("userManagement.country")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("userManagement.countryPlaceholder")}
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
      </div>

      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            {t("userManagement.contactDetails")}
          </h3>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">{t("userManagement.phoneNumber")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("userManagement.phoneNumberPlaceholder")}
                    {...field}
                    className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {userType === "company" && (
            <FormField
              control={form.control}
              name="webSite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {t("userManagement.websiteUrl")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("userManagement.websitePlaceholder")}
                      {...field}
                      className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
