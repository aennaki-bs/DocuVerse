import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserTable } from "@/components/admin/UserTable";
import { CreateUserMultiStep } from "@/components/admin/CreateUserMultiStep";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";

const UserManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "Admin") {
      toast.error(t("userManagement.noPermission"));
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate, t]);

  const pageActions = [
    {
      label: "Export Users",
      variant: "outline" as const,
      icon: Users,
      onClick: () => {
        // Export functionality
      },
    },
    {
      label: t("userManagement.createUser"),
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setIsCreateUserOpen(true),
    },
  ];

  return (
    <PageLayout
      title={t("userManagement.title")}
      subtitle={t("userManagement.subtitle")}
      icon={Users}
      actions={pageActions}
    >
      <UserTable />
      <CreateUserMultiStep
        open={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
      />
    </PageLayout>
  );
};

export default UserManagement;
