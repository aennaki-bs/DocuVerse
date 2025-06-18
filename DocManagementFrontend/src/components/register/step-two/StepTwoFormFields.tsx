import React from "react";
import UsernameField from "../fields/UsernameField";
import EmailField from "../fields/EmailField";
import PasswordFields from "../fields/PasswordFields";

interface StepTwoFormFieldsProps {
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  validationErrors: Record<string, string>;
  passwordStrength: number;
}

const StepTwoFormFields: React.FC<StepTwoFormFieldsProps> = ({
  formData,
  onChange,
  localErrors,
  validationErrors,
  passwordStrength,
}) => {
  return (
    <div className="bg-[#101b30] rounded-xl border border-gray-800/20 shadow-lg overflow-hidden p-4 sm:p-6 space-y-4 sm:space-y-6">
      <UsernameField
        value={formData.username}
        onChange={onChange}
        localErrors={localErrors}
        validationErrors={validationErrors}
      />

      <EmailField
        value={formData.email}
        onChange={onChange}
        localErrors={localErrors}
        validationErrors={validationErrors}
      />

      <PasswordFields
        password={formData.password}
        confirmPassword={formData.confirmPassword}
        onChange={onChange}
        localErrors={localErrors}
        passwordStrength={passwordStrength}
      />
    </div>
  );
};

export default StepTwoFormFields;
