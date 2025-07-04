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
      const exists = await adminService.checkEmailExists(email);

      if (exists) {
        setEmailError("This email is already registered in the system");
      } else {
        // Clear any previous error if email is available
        if (emailError === "This email is already registered in the system") {
          setEmailError("");
        }
      }
    } catch (error: any) {
      console.error("Error checking email:", error);
      
      // Handle specific errors from checkEmailExists
      if (error.message) {
        if (error.message.includes('Email is required') || 
            error.message.includes('valid email address')) {
          // These are validation errors - let the validateEmailFormat handle them
          return;
        } else if (error.message.includes('connect to server') || 
                   error.message.includes('internet connection')) {
          setEmailError("Unable to verify email availability. Please check your connection and try again.");
        } else if (error.message.includes('Server error') || 
                   error.message.includes('service not available')) {
          setEmailError("Email verification service temporarily unavailable. You may continue, but please ensure the email is correct.");
        } else if (error.message.includes('Authentication required') || 
                   error.message.includes('permission')) {
          setEmailError("Unable to verify email availability due to permissions. Please contact your administrator.");
        } else {
          // Generic error message for other cases
          setEmailError("Unable to verify email availability. Please ensure the email is correct.");
        }
      } else {
        setEmailError("Unable to verify email availability. Please ensure the email is correct.");
      }
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

      // Extract comprehensive error message from response
      let errorMessage = "An unknown error occurred";
      
      if (error.response?.data) {
        // Backend returns error message directly as string in response.data
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Map common error codes to user-friendly messages
      if (error.response?.status) {
        switch (error.response.status) {
          case 400:
            if (!errorMessage || errorMessage.includes("Request failed")) {
              if (errorMessage.includes("Email is already in use") || errorMessage.includes("Email already in use")) {
                errorMessage = "This email address is already registered in the system. Please choose a different email.";
              } else {
                errorMessage = "Invalid request. Please check the email format and try again.";
              }
            }
            break;
          case 401:
            errorMessage = "You are not authorized to perform this action. Please log in again.";
            break;
          case 403:
            errorMessage = "You don't have permission to update this user's email.";
            break;
          case 404:
            errorMessage = "User not found. The user may have been deleted.";
            break;
          case 409:
            errorMessage = "This email address is already registered in the system. Please choose a different email.";
            break;
          case 500:
            errorMessage = "Server error occurred while updating the email. Please try again later.";
            break;
          case 503:
            errorMessage = "Service temporarily unavailable. Please try again in a few moments.";
            break;
        }
      }

      setFormError(errorMessage);

      // Enhanced error toast with more detailed message
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-lg border border-red-500/30 flex items-start gap-3 max-w-md">
            <XCircle className="h-6 w-6 text-red-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Email Update Failed</h3>
              <p className="text-sm text-red-100 break-words">{errorMessage}</p>
              {error.response?.status && (
                <p className="text-xs text-red-200 mt-1 opacity-75">
                  Error Code: {error.response.status}
                </p>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="ml-auto text-red-200 hover:text-white flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ),
        { duration: 8000 }
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
