import { motion } from "framer-motion";
import { UserInfo } from "@/services/authService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PasswordForm } from "./PasswordForm";

interface ProfileTabsProps {
  user: UserInfo;
  refreshUserInfo: () => Promise<void>;
  logout: (navigate: any) => void;
}

export function ProfileTabs({
  user,
  refreshUserInfo,
  logout,
}: ProfileTabsProps) {
  return (
    <motion.div
      className="md:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 w-full grid grid-cols-2 p-1 h-auto">
          <TabsTrigger
            value="profile"
            className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-indigo-600/80 data-[state=active]:text-white"
          >
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <PersonalInfoForm
            user={user}
            refreshUserInfo={refreshUserInfo}
            logout={logout}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <PasswordForm user={user} refreshUserInfo={refreshUserInfo} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
