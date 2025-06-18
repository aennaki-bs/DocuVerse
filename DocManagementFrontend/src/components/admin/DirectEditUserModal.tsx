import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserDto, UpdateUserRequest } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X, UserCog, Save } from "lucide-react";

interface DirectEditUserModalProps {
  user: UserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, data: UpdateUserRequest) => Promise<void>;
}

export function DirectEditUserModal({
  user,
  isOpen,
  onClose,
  onSave,
}: DirectEditUserModalProps) {
  const [formData, setFormData] = useState<{
    username: string;
    firstName: string;
    lastName: string;
    roleName: string;
    isActive: boolean;
  }>({
    username: "",
    firstName: "",
    lastName: "",
    roleName: "SimpleUser",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      const roleString =
        typeof user.role === "string"
          ? user.role
          : (user.role as any)?.roleName || "SimpleUser";

      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        roleName: roleString,
        isActive: user.isActive || false,
      });
      setUsernameError("");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const validateUsername = (username: string): boolean => {
    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }

    if (username.includes(" ")) {
      setUsernameError("Username cannot contain spaces");
      return false;
    }

    setUsernameError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") {
      validateUsername(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate username before submission
    if (!validateUsername(formData.username)) {
      toast.error("Please fix username errors before submitting");
      return;
    }

    setIsSubmitting(true);

    // Build update data (only changed fields)
    const updateData: UpdateUserRequest = {};

    if (formData.username !== user.username) {
      updateData.username = formData.username;
    }

    if (formData.firstName !== user.firstName) {
      updateData.firstName = formData.firstName;
    }

    if (formData.lastName !== user.lastName) {
      updateData.lastName = formData.lastName;
    }

    const currentRole =
      typeof user.role === "string"
        ? user.role
        : (user.role as any)?.roleName || "SimpleUser";

    if (formData.roleName !== currentRole) {
      updateData.roleName = formData.roleName as any;
    }

    if (formData.isActive !== user.isActive) {
      updateData.isActive = formData.isActive;
    }

    // Check if any changes were made
    if (Object.keys(updateData).length === 0) {
      toast.info("No changes were made");
      onClose();
      return;
    }

    try {
      await onSave(user.id, updateData);
      toast.success("User updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create portal to render outside of component hierarchy
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md md:max-w-xl bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] rounded-xl border border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] overflow-hidden">
        <div className="p-4 border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400">
              <UserCog className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-blue-100">Edit User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-blue-100 rounded-full p-1 hover:bg-blue-800/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-5">
            {/* Personal Information */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h3 className="text-blue-100 font-medium mb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">First Name</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-[#111633] border-blue-900/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">Last Name</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-[#111633] border-blue-900/50 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h3 className="text-blue-100 font-medium mb-3">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">Username</label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`bg-[#111633] border-blue-900/50 text-white ${
                      usernameError ? "border-red-500" : ""
                    }`}
                  />
                  {usernameError && (
                    <p className="text-red-400 text-xs mt-1">{usernameError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h3 className="text-blue-100 font-medium mb-3">
                Role & Permissions
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">Role</label>
                  <Select
                    value={formData.roleName}
                    onValueChange={(value) =>
                      handleSelectChange("roleName", value)
                    }
                  >
                    <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2c6b] border-blue-900/50 text-white">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="FullUser">Full User</SelectItem>
                      <SelectItem value="SimpleUser">Simple User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border border-blue-900/30 p-3 bg-[#111633]">
                  <div>
                    <h4 className="text-sm text-blue-200">Active Status</h4>
                    <p className="text-xs text-blue-400">
                      User can access the system
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isActive", checked)
                    }
                    className={
                      formData.isActive ? "bg-emerald-600" : "bg-red-600"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

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
              disabled={isSubmitting || !!usernameError}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
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
