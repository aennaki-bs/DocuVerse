import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserDto } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  X,
  Mail,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import adminService from "@/services/adminService";

interface DirectEditUserEmailModalProps {
  user: UserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, newEmail: string) => Promise<void>;
}

export function DirectEditUserEmailModal({
  user,
  isOpen,
  onClose,
  onSave,
}: DirectEditUserEmailModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [formError, setFormError] = useState("");
  const [showDuplicateCheck, setShowDuplicateCheck] = useState(false);

  // Reset form state when user changes
  useEffect(() => {
    if (user) {
      setNewEmail("");
      setEmailError("");
      setFormError("");
      setShowDuplicateCheck(false);
    }
  }, [user]);

  // Debounce function for email checking
  useEffect(() => {
    if (!newEmail || !showDuplicateCheck) return;

    const timer = setTimeout(() => {
      checkEmailDuplicate(newEmail);
    }, 600);

    return () => clearTimeout(timer);
  }, [newEmail, showDuplicateCheck]);

  if (!isOpen || !user) return null;

  // Check if email is duplicate
  const checkEmailDuplicate = async (email: string) => {
    if (!validateEmailFormat(email)) return;

    try {
      setIsCheckingEmail(true);
      // Replace with your actual API call to check email
      const exists = await adminService
        .checkEmailExists(email)
        .catch(() => false);

      if (exists) {
        setEmailError("This email is already registered in the system");
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    if (email === user.email) {
      setEmailError("New email must be different from current email");
      return false;
    }

    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!validateEmailFormat(email)) {
      return false;
    }

    // If we've passed basic validation and not currently checking,
    // set flag to initiate duplicate check
    if (!showDuplicateCheck) {
      setShowDuplicateCheck(true);
    }

    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!validateEmail(newEmail)) {
      return;
    }

    if (emailError) {
      setFormError("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(user.id, newEmail);

      // Enhanced success toast
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-lg shadow-lg border border-green-500/30 flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-200 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Email Updated Successfully</h3>
              <p className="text-sm text-green-100">
                Verification email has been sent to {newEmail}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="ml-auto text-green-200 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ),
        { duration: 5000 }
      );

      onClose();
    } catch (error: any) {
      console.error("Failed to update email:", error);

      // Show meaningful error based on error code or message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";

      setFormError(`Failed to update email: ${errorMessage}`);

      // Enhanced error toast
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-lg border border-red-500/30 flex items-start gap-3">
            <XCircle className="h-6 w-6 text-red-200 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Email Update Failed</h3>
              <p className="text-sm text-red-100">{errorMessage}</p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="ml-auto text-red-200 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ),
        { duration: 7000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create portal to render outside of component hierarchy
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] rounded-xl border border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] overflow-hidden">
        <div className="p-4 border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-blue-100">
              Update Email
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-blue-100 rounded-full p-1 hover:bg-blue-800/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-blue-200 block mb-1">
                Current Email
              </label>
              <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2.5 text-gray-300">
                {user.email}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-blue-200 block">New Email</label>
              <div className="relative">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter new email address"
                  className={`bg-[#111633] border-blue-900/50 text-white pr-8 ${
                    emailError ? "border-red-500" : ""
                  }`}
                />
                {isCheckingEmail && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>
              {emailError && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  <p className="text-red-400 text-xs">{emailError}</p>
                </div>
              )}
              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />A verification email will be
                sent to the new address
              </p>
            </div>
          </div>

          {formError && (
            <Alert
              variant="destructive"
              className="mt-4 bg-red-900/30 border-red-500/40 text-red-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-900/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !newEmail || !!emailError || isCheckingEmail
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Email
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
