import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import {
  ProfileHeader,
  ProfilePicture,
  ProfileTabs,
} from "@/components/profile";

/**
 * Profile page component
 * Allows users to view and edit their profile information
 */
const Profile = () => {
  const { user, logout, refreshUserInfo } = useAuth();
  const navigate = useNavigate();

  // If user isn't authenticated, show login message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900/20 to-blue-950/30">
        <Card className="w-[350px] shadow-xl bg-gradient-to-b from-blue-900/10 to-indigo-900/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Not Authenticated</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <Lock className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-gray-400 mb-6">
              Please log in to view your profile
            </p>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              asChild
            >
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-950/30 px-4 py-6 sm:py-10">
      {/* Header Section */}
      {/* <ProfileHeader /> */}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {/* Profile Picture Section */}
          <ProfilePicture user={user} refreshUserInfo={refreshUserInfo} />

          {/* Profile Details Tabs */}
          <ProfileTabs
            user={user}
            refreshUserInfo={refreshUserInfo}
            logout={logout}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
