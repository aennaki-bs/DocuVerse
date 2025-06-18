import React from "react";

interface PasswordStrengthIndicatorProps {
  strength: number;
  password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  password = "",
}) => {
  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-700";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getMessageColor = () => {
    if (strength === 0) return "text-gray-400";
    if (strength <= 2) return "text-red-400";
    if (strength <= 4) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="mt-1.5">
      <div className="w-full bg-gray-800/50 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${getStrengthColor()}`}
          style={{ width: `${strength * 20}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 flex flex-wrap justify-between">
        <span>
          Strength:{" "}
          <span className={`font-medium ${getMessageColor()}`}>
            {getStrengthLabel()}
          </span>
        </span>
        {strength < 5 && (
          <span className="text-red-400 text-[10px] sm:text-xs">
            (Must be Strong to continue)
          </span>
        )}
      </p>
      {strength < 5 && password && (
        <ul className="text-[10px] sm:text-xs mt-1.5 text-gray-400 list-disc pl-4 grid grid-cols-1 gap-0.5">
          <li className={password.length >= 8 ? "text-green-400" : ""}>
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
            At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? "text-green-400" : ""}>
            At least one lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? "text-green-400" : ""}>
            At least one number
          </li>
          <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-400" : ""}>
            At least one special character
          </li>
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
