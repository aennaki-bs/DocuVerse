import { UseFormReturn } from "react-hook-form";
import {
  CircleCheck,
  User,
  Building2,
  MapPin,
  AtSign,
  Key,
  Shield,
} from "lucide-react";

interface ReviewStepProps {
  form: UseFormReturn<any>;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const values = form.getValues();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <CircleCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            Review Information
          </h3>
        </div>

        <div className="space-y-5">
          {/* User Type */}
          <ReviewSection
            title="Account Type"
            icon={<User className="h-5 w-5" />}
            items={[
              {
                label: "User Type",
                value:
                  values.userType === "simple"
                    ? "Personal User"
                    : "Company Account",
              },
            ]}
          />

          {/* Personal/Company Information */}
          <ReviewSection
            title={
              values.userType === "simple"
                ? "Personal Information"
                : "Company Information"
            }
            icon={
              values.userType === "simple" ? (
                <User className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )
            }
            items={
              values.userType === "simple"
                ? [
                    { label: "First Name", value: values.firstName },
                    { label: "Last Name", value: values.lastName },
                  ]
                : [{ label: "Company Name", value: values.companyName }]
            }
          />

          {/* Address */}
          <ReviewSection
            title="Address Information"
            icon={<MapPin className="h-5 w-5" />}
            items={[
              { label: "Address", value: values.address },
              { label: "City", value: values.city },
              { label: "Country", value: values.country },
              { label: "Phone Number", value: values.phoneNumber },
              ...(values.webSite
                ? [{ label: "Website", value: values.webSite }]
                : []),
            ]}
          />

          {/* Username & Email */}
          <ReviewSection
            title="Account Credentials"
            icon={<AtSign className="h-5 w-5" />}
            items={[
              { label: "Username", value: values.username },
              { label: "Email", value: values.email },
            ]}
          />

          {/* Password (for security, just show placeholder) */}
          <ReviewSection
            title="Password"
            icon={<Key className="h-5 w-5" />}
            items={[{ label: "Password", value: "●●●●●●●●" }]}
          />

          {/* Role */}
          <ReviewSection
            title="User Role"
            icon={<Shield className="h-5 w-5" />}
            items={[
              {
                label: "Role",
                value: values.roleName,
                valueClass:
                  values.roleName === "Admin"
                    ? "text-red-300"
                    : values.roleName === "FullUser"
                    ? "text-emerald-300"
                    : "text-blue-300",
              },
            ]}
          />
        </div>
      </div>

      <div className="bg-green-900/30 rounded-lg p-4 text-sm text-green-300 border border-green-800/30 flex items-center gap-3">
        <CircleCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
        <p>
          Please review all information carefully before creating the user.
          Click the "Create User" button below to proceed.
        </p>
      </div>
    </div>
  );
}

// Helper component for review sections
interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    value: string;
    valueClass?: string;
  }[];
}

function ReviewSection({ title, icon, items }: ReviewSectionProps) {
  return (
    <div className="border border-blue-900/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-blue-400">{icon}</div>
        <h4 className="text-sm font-medium text-blue-200">{title}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="text-xs text-blue-400">{item.label}</div>
            <div className={item.valueClass || "text-blue-100"}>
              {item.value || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
