import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: "Admin" | "FullUser" | "SimpleUser" | string[];
  requiresManagement?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiresManagement = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // UI development mode - allow navigation to all routes regardless of authentication
  const allowAllAccess = false; // Changed to false to enforce proper authentication

  useEffect(() => {
    console.log("ProtectedRoute - Auth state:", {
      isAuthenticated,
      isLoading,
      userId: user?.userId,
      role: user?.role,
      currentPath: location.pathname,
      bypassingAuth: allowAllAccess,
    });
  }, [isAuthenticated, isLoading, user, location, allowAllAccess]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-docuBlue"></div>
      </div>
    );
  }

  // If in development mode, bypass all authentication checks
  if (allowAllAccess) {
    console.log("Development mode: Bypassing authentication checks");
    return children ? <>{children}</> : <Outlet />;
  }

  // Regular authentication check (will only run if allowAllAccess is false)
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role || "SimpleUser";

  // Check if SimpleUser is trying to access management features
  if (requiresManagement && userRole === "SimpleUser") {
    // For document-types route, SimpleUsers should have view-only access
    if (location.pathname === "/document-types") {
      // Allow SimpleUsers to view document types
      return children ? <>{children}</> : <Outlet />;
    }

    // For circuits page, allow viewing but apply restrictions in the component
    if (location.pathname === "/circuits") {
      return children ? <>{children}</> : <Outlet />;
    }

    toast.error("Simple users cannot make management changes", {
      description: "You can view information but cannot modify content",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Role-based access control
  if (requiredRole) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasRequiredRole) {
      toast.error("You do not have permission to access this page", {
        description: `Required role: ${
          Array.isArray(requiredRole) ? requiredRole.join(" or ") : requiredRole
        }`,
      });
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log("User is authenticated, rendering protected content");
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
