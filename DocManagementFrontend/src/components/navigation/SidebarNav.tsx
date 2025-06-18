import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Layers,
  Users,
  CalendarRange,
  Settings,
  PlayCircle,
  UserCheck,
  ChevronDown,
  ChevronRight,
  UserCog,
  UsersRound,
  ClipboardCheck,
  Bell,
  Building2,
  Box,
  Tag,
  Package,
  Hash,
  Calculator,
  Truck,
  MapPin,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserProfileSection } from "./UserProfileSection";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";
import { useTranslation } from "@/hooks/useTranslation";

export function SidebarNav() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = user?.role === "Admin";
  const isSimpleUser = user?.role === "SimpleUser";

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Check if any line elements-related route is active
  const isLineElementsActive = () => {
    return (
      isActive("/line-elements-management") ||
      isActive("/items-management") ||
      isActive("/unit-codes-management") ||
      isActive("/general-accounts-management") ||
      isActive("/customer-management") ||
      isActive("/vendor-management") ||
      isActive("/locations-management")
    );
  };

  // Check if any approval-related route is active
  const isApprovalActive = () => {
    return (
      isActive("/approval-groups") ||
      isActive("/approvers-management") ||
      isActive("/pending-approvals")
    );
  };

  // State for the approval submenu
  const [approvalMenuOpen, setApprovalMenuOpen] = useState(isApprovalActive());
  // State for the line elements submenu - open by default if on a line elements page
  const [lineElementsMenuOpen, setLineElementsMenuOpen] = useState(
    isLineElementsActive()
  );

  // Update submenu states when location changes
  useEffect(() => {
    setApprovalMenuOpen(isApprovalActive());
    setLineElementsMenuOpen(isLineElementsActive());
  }, [location.pathname]);

  // Fetch pending approvals count
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: () => approvalService.getPendingApprovals(),
    enabled: !!user?.userId && !isSimpleUser,
  });

  // Professional navigation item classes with semantic theming
  const getNavItemClasses = (isActiveItem: boolean) => {
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActiveItem
        ? "bg-accent text-accent-foreground shadow-sm border border-border"
        : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
    }`;
  };

  const getSubmenuItemClasses = (isActiveItem: boolean) => {
    return `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActiveItem
        ? "bg-accent text-accent-foreground shadow-sm"
        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
    }`;
  };

  return (
    <div className="h-full w-full bg-card/95 border-border backdrop-blur-lg border-r overflow-y-auto">
      {/* User Profile Section */}
      <UserProfileSection />

      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-muted-foreground px-2 py-3 uppercase tracking-wide">
          MAIN NAVIGATION
        </p>
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={getNavItemClasses(isActive("/dashboard"))}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>{t("nav.dashboard")}</span>
            </Link>
          </li>

          {/* Pending Approvals - Not visible to SimpleUser */}
          {!isSimpleUser && (
            <li>
              <Link
                to="/pending-approvals"
                className={`${getNavItemClasses(
                  isActive("/pending-approvals")
                )} justify-between`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-5 w-5" />
                  <span>{t("nav.myApprovals")}</span>
                </div>
                {pendingApprovals.length > 0 && (
                  <div className="flex items-center justify-center h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full font-medium">
                    {pendingApprovals.length}
                  </div>
                )}
              </Link>
            </li>
          )}

          {/* User Management - Only for Admin */}
          {isAdmin && (
            <li>
              <Link
                to="/user-management"
                className={getNavItemClasses(isActive("/user-management"))}
              >
                <Users className="h-5 w-5" />
                <span>{t("nav.userManagement")}</span>
              </Link>
            </li>
          )}

          {/* Documents */}
          <li>
            <Link
              to="/documents"
              className={getNavItemClasses(isActive("/documents"))}
            >
              <FileText className="h-5 w-5" />
              <span>{t("nav.documents")}</span>
            </Link>
          </li>

          {/* Document Types - Only for non-simple users */}
          {!isSimpleUser && (
            <>
              <li>
                <Link
                  to="/document-types-management"
                  className={getNavItemClasses(
                    isActive("/document-types-management")
                  )}
                >
                  <Layers className="h-5 w-5" />
                  <span>{t("nav.documentTypes")}</span>
                </Link>
              </li>

              {/* Line Elements Section with submenu */}
              <li>
                <button
                  onClick={() => setLineElementsMenuOpen(!lineElementsMenuOpen)}
                  className={`w-full ${getNavItemClasses(
                    isLineElementsActive()
                  )} justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5" />
                    <span>{t("nav.lineElements")}</span>
                  </div>
                  {lineElementsMenuOpen ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                  )}
                </button>

                {/* Professional submenu for Line Elements */}
                {lineElementsMenuOpen && (
                  <ul className="ml-6 mt-2 space-y-1 border-l-2 border-border pl-3">
                    <li>
                      <Link
                        to="/line-elements-management?tab=elementtypes"
                        className={getSubmenuItemClasses(
                          isActive("/line-elements-management") &&
                            new URLSearchParams(location.search).get("tab") ===
                              "elementtypes"
                        )}
                      >
                        <Tag className="h-4 w-4" />
                        <span>Element Types</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/items-management"
                        className={getSubmenuItemClasses(
                          isActive("/items-management")
                        )}
                      >
                        <Package className="h-4 w-4" />
                        <span>Items</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/unit-codes-management"
                        className={getSubmenuItemClasses(
                          isActive("/unit-codes-management")
                        )}
                      >
                        <Hash className="h-4 w-4" />
                        <span>Unit Codes</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/general-accounts-management"
                        className={getSubmenuItemClasses(
                          isActive("/general-accounts-management")
                        )}
                      >
                        <Calculator className="h-4 w-4" />
                        <span>General Accounts</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/locations-management"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/locations-management")
                            ? "bg-blue-700/40 text-blue-200"
                            : "text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Locations</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/customer-management"
                        className={getSubmenuItemClasses(
                          isActive("/customer-management")
                        )}
                      >
                        <Users className="h-4 w-4" />
                        <span>Customers</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vendor-management"
                        className={getSubmenuItemClasses(
                          isActive("/vendor-management")
                        )}
                      >
                        <Truck className="h-4 w-4" />
                        <span>Vendors</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Circuits */}
              <li>
                <Link
                  to="/circuits"
                  className={getNavItemClasses(isActive("/circuits"))}
                >
                  <GitBranch className="h-5 w-5" />
                  <span>{t("nav.circuits")}</span>
                </Link>
              </li>

              {/* Approval Section with submenu */}
              <li>
                <button
                  onClick={() => setApprovalMenuOpen(!approvalMenuOpen)}
                  className={`w-full ${getNavItemClasses(
                    isApprovalActive()
                  )} justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5" />
                    <span>{t("nav.approval")}</span>
                  </div>
                  {approvalMenuOpen ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                  )}
                </button>

                {/* Professional submenu for Approval */}
                {approvalMenuOpen && (
                  <ul className="ml-6 mt-2 space-y-1 border-l-2 border-border pl-3">
                    <li>
                      <Link
                        to="/approval-groups"
                        className={getSubmenuItemClasses(
                          isActive("/approval-groups")
                        )}
                      >
                        <UsersRound className="h-4 w-4" />
                        <span>Groups</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/approvers-management"
                        className={getSubmenuItemClasses(
                          isActive("/approvers-management")
                        )}
                      >
                        <UserCog className="h-4 w-4" />
                        <span>Approvers</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Responsibility Centres */}
              {isAdmin && (
                <li>
                  <Link
                    to="/responsibility-centres"
                    className={getNavItemClasses(
                      isActive("/responsibility-centres")
                    )}
                  >
                    <Building2 className="h-5 w-5" />
                    <span>{t("nav.responsibilityCentres")}</span>
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
