import { Link } from "react-router-dom";
import { Settings, Building2, ChevronRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function UserProfileSection() {
  const { user, refreshUserInfo } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

  if (!user) return null;

  const handleRefreshUserInfo = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserInfo();
      toast.success("User information refreshed!");
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      toast.error("Failed to refresh user information");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get responsibility center from either property name (API uses responsibilityCenter, our old code used responsibilityCentre)
  const responsibilityCenter =
    user.responsibilityCenter || user.responsibilityCentre;

  return (
    <motion.div
      className="mx-3 my-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Professional profile card with semantic theming */}
      <div className="bg-gradient-to-br from-card to-muted/50 rounded-xl border border-border shadow-lg overflow-hidden backdrop-blur-sm">
        {/* User avatar and basic info */}
        <div className="p-4 pb-3">
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-primary ring-2 ring-primary/40 shadow-md">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary-foreground text-lg font-bold">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 bg-green-500 h-3 w-3 rounded-full border-2 border-card shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.2, type: "spring" }}
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-semibold text-sm truncate">
                {user.username || "User"}
              </h3>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary text-primary-foreground border border-primary/50 shadow-sm">
                  {user.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional responsibility centre section */}
        <div className="px-4 py-3 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/40">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {t("navigation.responsibilityCenter")}
                  </p>
                  <button
                    onClick={handleRefreshUserInfo}
                    disabled={isRefreshing}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                    title="Refresh user information"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-foreground font-medium truncate">
                  {responsibilityCenter ? (
                    responsibilityCenter.descr || responsibilityCenter.code
                  ) : (
                    <span className="text-muted-foreground font-normal">
                      {t("navigation.notAssigned")}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {responsibilityCenter && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div>
              </div>
            )}
          </div>
        </div>

        {/* Professional manage account link */}
        <div className="p-2">
          <Link
            to="/profile"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-accent rounded-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-3.5 w-3.5" />
              <span>{t("navigation.manageAccount")}</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div>
      </div>

      {/* Professional center info card */}
      {responsibilityCenter && (
        <motion.div
          className="mt-3 p-3 bg-gradient-to-r from-muted/50 to-accent/30 rounded-lg border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {t("navigation.centerCode")}
              </p>
              <p className="text-sm text-foreground font-mono">
                {responsibilityCenter.code}
              </p>
            </div>
            <div className="text-right">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                <Building2 className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
