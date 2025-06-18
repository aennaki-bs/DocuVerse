import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerification from "./components/register/EmailVerification";
import AdminPage from "./pages/Admin";
import DocumentsPageWrapper from "./pages/documents/DocumentsPageWrapper";
import DocumentTypes from "./pages/DocumentTypes";
import DocumentTypesManagement from "./pages/DocumentTypesManagement";
import SubTypeManagement from "./pages/SubTypeManagement";
import CreateDocument from "./pages/CreateDocument";
import ViewDocument from "./pages/ViewDocument";
import EditDocument from "./pages/EditDocument";
import DocumentLignesPage from "./pages/DocumentLignesPage";
import CircuitsPage from "./pages/Circuits";
import CircuitStepsPage from "./pages/CircuitStepsPage";
import CircuitStatusesPage from "./pages/CircuitStatusesPage";
import CircuitStatusStepsPage from "./pages/CircuitTransitionsPage";
import StepStatusesPage from "./pages/StepStatusesPage";
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
import UserManagement from "./pages/UserManagement";
import DocumentFlowPage from "./pages/DocumentFlowPage";
import { Layout } from "./components/layout/Layout";
import Settings from "./pages/Settings";
import { SettingsProvider } from "./context/SettingsContext";
import SubTypeManagementPage from "./pages/SubTypeManagementPage";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import DocumentTypeDetail from "./pages/DocumentTypeDetail";
import ApprovalGroupsManagement from "./pages/ApprovalGroupsManagement";
import ApproversManagement from "./pages/ApproversManagement";
import ButtonShowcasePage from "./pages/ButtonShowcase";
import ResponsibilityCentreManagement from "./pages/ResponsibilityCentreManagement";
import LineElementsManagement from "./pages/LineElementsManagement";
import ItemsPage from "./pages/ItemsPage";
import UnitCodesPage from "./pages/UnitCodesPage";
import GeneralAccountsPage from "./pages/GeneralAccountsPage";
import CustomerManagementPage from "./pages/CustomerManagement";
import VendorManagementPage from "./pages/VendorManagement";
import LocationsManagementPage from "./pages/LocationsManagement";
import ThemeDemo from "./pages/ThemeDemo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/registration-success"
                  element={<RegistrationSuccess />}
                />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/verify/:email" element={<EmailVerification />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/update-password/:email"
                  element={<UpdatePassword />}
                />
                <Route path="/ui-showcase" element={<ButtonShowcasePage />} />
                <Route path="/theme-demo" element={<ThemeDemo />} />

                {/* Protected routes with layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user-management"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Document Types Management routes */}
                  <Route
                    path="/document-types"
                    element={
                      <Navigate to="/document-types-management" replace />
                    }
                  />
                  <Route
                    path="/document-types-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <DocumentTypesManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Document Type Detail route */}
                  <Route
                    path="/document-types/:id"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <DocumentTypeDetail />
                      </ProtectedRoute>
                    }
                  />

                  {/* Line Elements Management route */}
                  <Route
                    path="/line-elements-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <LineElementsManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Individual Line Elements pages */}
                  <Route
                    path="/items-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ItemsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/unit-codes-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <UnitCodesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/general-accounts-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <GeneralAccountsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/locations-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <LocationsManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Document routes */}
                  <Route path="/documents" element={<DocumentsPageWrapper />} />
                  <Route path="/documents/:id" element={<ViewDocument />} />

                  <Route
                    path="/document-types/:id/subtypes"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <SubTypeManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Add the missing subtype-management route */}
                  <Route
                    path="/subtype-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <SubTypeManagement />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/documents/create"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <CreateDocument />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/documents/:id/edit"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <EditDocument />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents/:id/flow"
                    element={<DocumentFlowPage />}
                  />

                  {/* Document Lignes routes */}
                  <Route
                    path="/documents/:id/lignes"
                    element={
                      <ProtectedRoute requiresManagement>
                        <DocumentLignesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents/:id/lignes/:ligneId"
                    element={<ViewDocument />}
                  />

                  {/* Document SousLignes routes */}
                  <Route
                    path="/documents/:id/lignes/:ligneId/souslignes"
                    element={
                      <ProtectedRoute requiresManagement>
                        <ViewDocument />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents/:id/lignes/:ligneId/souslignes/:sousLigneId"
                    element={<ViewDocument />}
                  />

                  {/* Circuit Management routes */}
                  <Route path="/circuits" element={<CircuitsPage />} />
                  <Route
                    path="/circuits/:circuitId/steps"
                    element={<CircuitStepsPage />}
                  />
                  <Route
                    path="/circuits/:circuitId/statuses"
                    element={<CircuitStatusesPage />}
                  />
                  <Route
                    path="/circuit/:circuitId/steps"
                    element={<CircuitStepsPage />}
                  />
                  <Route
                    path="/circuit/:circuitId/transitions"
                    element={<CircuitStatusStepsPage />}
                  />
                  {/* <Route
                    path="/circuits/:circuitId/steps/:stepId/statuses"
                    element={<StepStatusesPage />}
                  /> */}
                  <Route
                    path="/pending-approvals"
                    element={
                      <ProtectedRoute requiredRole={["Admin", "FullUser"]}>
                        <PendingApprovalsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Approval Groups route */}
                  <Route
                    path="/approval-groups"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ApprovalGroupsManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Approvers Management route */}
                  <Route
                    path="/approvers-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <ApproversManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Responsibility Centre Management route */}
                  <Route
                    path="/responsibility-centres"
                    element={
                      <ProtectedRoute requiresManagement requiredRole="Admin">
                        <ResponsibilityCentreManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Customer Management route */}
                  <Route
                    path="/customer-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <CustomerManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Vendor Management route */}
                  <Route
                    path="/vendor-management"
                    element={
                      <ProtectedRoute
                        requiresManagement
                        requiredRole={["Admin", "FullUser"]}
                      >
                        <VendorManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings route */}
                  <Route path="/settings" element={<Settings />} />
                </Route>
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </SettingsProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
