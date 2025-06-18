import { useState } from "react";
import {
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Building,
  Globe,
  AtSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserInfo, UpdateProfileRequest } from "@/services/authService";
import authService from "@/services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PersonalInfoFormProps {
  user: UserInfo;
  refreshUserInfo: () => Promise<void>;
  logout: (navigate: any) => void;
}

export function PersonalInfoForm({
  user,
  refreshUserInfo,
  logout,
}: PersonalInfoFormProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [emailData, setEmailData] = useState({
    email: user?.email || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData((prev) => ({ ...prev, email: e.target.value }));
    setApiError(null);
  };

  const handleSaveProfile = async () => {
    try {
      setApiError(null);

      // Update profile data
      await authService.updateProfile(profileData);

      // Refresh user info to get the updated data
      await refreshUserInfo();

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "Failed to update profile";
      setApiError(errorMessage);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      setApiError(null);

      await authService.updateEmail(emailData.email);
      toast.success(
        "Email update request sent. Please check your email to verify."
      );
      logout(navigate); // Log out user as they need to verify new email
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "Failed to update email";
      setApiError(errorMessage);
    }
  };

  return (
    <Card className="shadow-xl border-white/10 bg-gradient-to-br from-gray-900/80 to-blue-900/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-gradient-to-r from-blue-800/30 to-purple-800/20">
        <CardTitle className="text-white/90 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-300" />
          Personal Information
        </CardTitle>
        <Button
          variant={isEditing ? "destructive" : "outline"}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className={
            isEditing
              ? "bg-red-500/90 hover:bg-red-600/90 text-white"
              : "border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          }
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
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

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-2 text-blue-200"
              >
                <User className="h-4 w-4 text-blue-300" /> First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                  !isEditing ? "opacity-70" : "focus:border-blue-400"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="flex items-center gap-2 text-blue-200"
              >
                <User className="h-4 w-4 text-blue-300" /> Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                  !isEditing ? "opacity-70" : "focus:border-blue-400"
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="flex items-center gap-2 text-blue-200"
            >
              <AtSign className="h-4 w-4 text-blue-300" /> Username
            </Label>
            <Input
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                !isEditing ? "opacity-70" : "focus:border-blue-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="flex items-center gap-2 text-blue-200"
              >
                <Phone className="h-4 w-4 text-blue-300" /> Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                  !isEditing ? "opacity-70" : "focus:border-blue-400"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-blue-200"
              >
                <Mail className="h-4 w-4 text-blue-300" /> Email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  name="email"
                  value={emailData.email}
                  onChange={handleEmailChange}
                  disabled={!isEditing}
                  className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                    !isEditing ? "opacity-70" : "focus:border-blue-400"
                  }`}
                />
                {isEditing && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpdateEmail}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Update
                  </Button>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-blue-300/70 mt-1">
                  Updating email will require verification and log you out
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="flex items-center gap-2 text-blue-200"
            >
              <MapPin className="h-4 w-4 text-blue-300" /> Address
            </Label>
            <Input
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                !isEditing ? "opacity-70" : "focus:border-blue-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="flex items-center gap-2 text-blue-200"
              >
                <Building className="h-4 w-4 text-blue-300" /> City
              </Label>
              <Input
                id="city"
                name="city"
                value={profileData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                  !isEditing ? "opacity-70" : "focus:border-blue-400"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="flex items-center gap-2 text-blue-200"
              >
                <Globe className="h-4 w-4 text-blue-300" /> Country
              </Label>
              <Input
                id="country"
                name="country"
                value={profileData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 ${
                  !isEditing ? "opacity-70" : "focus:border-blue-400"
                }`}
              />
            </div>
          </div>
        </div>
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end border-t border-white/5 bg-gradient-to-r from-blue-800/20 to-purple-800/10 py-4">
          <Button
            onClick={handleSaveProfile}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
