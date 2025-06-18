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
    if (strength === 0) return "bg-blue-950/40";
    if (strength <= 2) return "bg-red-500/80";
    if (strength <= 4) return "bg-amber-500/80";
    return "bg-emerald-500/80";
  };

  const getLabelColor = () => {
    if (strength === 0) return "text-blue-300/50";
    if (strength <= 2) return "text-red-400";
    if (strength <= 4) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="mt-2">
      <div className="w-full bg-blue-950/40 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${getStrengthColor()}`}
          style={{ width: `${strength * 20}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-blue-200 flex items-center gap-1">
        Strength:{" "}
        <span className={`font-medium ${getLabelColor()}`}>
          {getStrengthLabel()}
        </span>
      </p>
      {strength < 5 && password && (
        <ul className="text-xs mt-2 text-blue-200/80 list-disc pl-4 space-y-1">
          <li className={password.length >= 8 ? "text-emerald-400" : ""}>
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>
            At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? "text-emerald-400" : ""}>
            At least one lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>
            At least one number
          </li>
          <li
            className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : ""}
          >
            At least one special character
          </li>
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
