import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, Activity } from "lucide-react";

const AdminPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "Admin") {
      toast.error("You do not have permission to access the admin panel");
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="space-y-4 md:space-y-6 p-6">
      <div className="bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-4 md:p-6 mb-4 md:mb-6 transition-all">
        <h1 className="text-2xl md:text-3xl font-semibold mb-1 md:mb-2 text-blue-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm md:text-base text-blue-600 dark:text-gray-400">
          Manage your application settings and users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* User Management Card */}
        <div
          className="bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-4 md:p-6 transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg cursor-pointer"
          onClick={() => navigate("/user-management")}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-white">
              User Management
            </h2>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-blue-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
              Users
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
              Roles
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
              Permissions
            </Badge>
          </div>
        </div>

        {/* System Settings Card */}
        <div className="bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-4 md:p-6 transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              System Settings
            </h2>
            <Settings className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-gray-400">Configure application settings</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-purple-500/10 text-purple-400"
            >
              Configuration
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-500/10 text-purple-400"
            >
              Preferences
            </Badge>
          </div>
        </div>

        {/* Activity Logs Card */}
        <div className="bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-4 md:p-6 transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-gray-400">View system and user activity logs</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-400"
            >
              System Logs
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-400"
            >
              User Activity
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
