import { useState } from "react";
import { AtSign, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { UserInfo } from "@/services/authService";
import authService from "@/services/authService";
import { toast } from "sonner";

interface ProfilePictureProps {
  user: UserInfo;
  refreshUserInfo: () => Promise<void>;
}

export function ProfilePicture({ user, refreshUserInfo }: ProfilePictureProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(
    user?.profilePicture
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG and GIF images are allowed");
      return;
    }

    try {
      setIsUploadingImage(true);

      const result = await authService.uploadProfileImage(file);
      setProfileImage(result.filePath);

      // Refresh user info to get the updated profile picture
      await refreshUserInfo();

      toast.success(result.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getInitials = () => {
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;
  };

  return (
    <motion.div
      className="md:col-span-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-white/10 bg-gradient-to-br from-gray-900/80 to-blue-900/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center border-b border-white/5 pb-6 bg-gradient-to-r from-blue-800/30 to-purple-800/20">
          <CardTitle className="text-white/90">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-400 to-indigo-500">
              <Avatar className="h-[120px] w-[120px] border-4 border-gray-900">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600/80 to-indigo-600/80 text-white">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <label
              htmlFor="profile-upload"
              className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full p-3 cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 border-4 border-gray-900 shadow-lg"
            >
              <Camera className="h-5 w-5" />
              <input
                type="file"
                id="profile-upload"
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                disabled={isUploadingImage}
              />
            </label>
          </div>

          <div className="text-center">
            <p className="font-semibold text-xl text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-blue-300/80 mt-1 flex items-center justify-center gap-1">
              <AtSign className="h-3.5 w-3.5" />
              {user.username}
            </p>
            <Badge className="mt-3 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-600/80 hover:to-indigo-600/80 border-0 text-white">
              {user.role}
            </Badge>
          </div>

          {isUploadingImage && (
            <div className="text-sm text-blue-300 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2"></div>
              Uploading image...
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
