import { useState } from "react";
import { Lock, Save, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserInfo, UpdateProfileRequest } from "@/services/authService";
import authService from "@/services/authService";
import { toast } from "sonner";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { calculatePasswordStrength } from "./utils/passwordUtils";
import PasswordInput from "./PasswordInput";

interface PasswordFormProps {
  user: UserInfo;
  refreshUserInfo: () => Promise<void>;
}

export function PasswordForm({ user, refreshUserInfo }: PasswordFormProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
  };

  const handleUpdatePassword = async () => {
    try {
      setApiError(null);

      // Verify confirmation matches
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setApiError("Passwords do not match");
        return;
      }

      // Check password strength
      if (passwordStrength < 3) {
        setApiError("Password is too weak. Please use a stronger password.");
        return;
      }

      // Create the update request
      const requestWithPassword: UpdateProfileRequest = {
        username: user.username,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      await authService.updateProfile(requestWithPassword);

      // Refresh user info to get the updated data
      await refreshUserInfo();

      toast.success("Password updated successfully");
      setIsChangingPassword(false);

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "Failed to update password";
      setApiError(errorMessage);
    }
  };

  return (
    <Card className="shadow-xl border-white/10 bg-gradient-to-br from-gray-900/80 to-blue-900/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-gradient-to-r from-blue-800/30 to-purple-800/20">
        <CardTitle className="text-white/90 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-blue-300" />
          Change Password
        </CardTitle>
        <Button
          variant={isChangingPassword ? "destructive" : "outline"}
          size="sm"
          onClick={() => setIsChangingPassword(!isChangingPassword)}
          className={
            isChangingPassword
              ? "bg-red-500/90 hover:bg-red-600/90 text-white"
              : "border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          }
        >
          {isChangingPassword ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" /> Change Password
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {apiError && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-500/20 text-red-200 border-red-500/50"
          >
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {isChangingPassword ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="flex items-center gap-2 text-blue-200"
              >
                <Lock className="h-4 w-4 text-blue-300" /> Current Password
              </Label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                showPassword={showCurrentPassword}
                toggleVisibility={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="flex items-center gap-2 text-blue-200"
              >
                <Lock className="h-4 w-4 text-blue-300" /> New Password
              </Label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                showPassword={showNewPassword}
                toggleVisibility={() => setShowNewPassword(!showNewPassword)}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              {passwordData.newPassword && (
                <PasswordStrengthIndicator
                  strength={passwordStrength}
                  password={passwordData.newPassword}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 text-blue-200"
              >
                <Lock className="h-4 w-4 text-blue-300" /> Confirm New Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                showPassword={showConfirmPassword}
                toggleVisibility={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              {passwordData.newPassword && passwordData.confirmPassword && (
                <div className="mt-1">
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Lock className="h-12 w-12 text-blue-300/50 mx-auto mb-4" />
              <p className="text-blue-200">
                To change your password, click the "Change Password" button.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {isChangingPassword && (
        <CardFooter className="flex justify-end border-t border-white/5 bg-gradient-to-r from-blue-800/20 to-purple-800/10 py-4">
          <Button
            onClick={handleUpdatePassword}
            disabled={
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword ||
              passwordStrength < 3
            }
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" /> Update Password
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
