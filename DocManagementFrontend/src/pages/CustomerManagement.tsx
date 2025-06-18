import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import CustomerTable from "@/components/reference-tables/CustomerTable";
import CreateCustomerWizard from "@/components/reference-tables/CreateCustomerWizard";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const CustomerManagementPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // You can add role-based access control here if needed
    // if (user?.role !== "Admin" && user?.role !== "FullUser") {
    //   toast.error("You do not have permission to access customer management");
    //   navigate("/dashboard");
    // }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="space-y-6 p-6 h-full">
      <div className="bg-white dark:bg-[#0a1033] border border-blue-200 dark:border-blue-900/30 rounded-lg p-6 mb-6 transition-all h-1/12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-blue-900 dark:text-white flex items-center">
              <Users className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />{" "}
              Customer Management
            </h1>
            <p className="text-sm md:text-base text-blue-700 dark:text-gray-400">
              Manage customer information and relationships
            </p>
          </div>
          <Button
            onClick={() => setIsCreateCustomerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a1033] border border-blue-200 dark:border-blue-900/30 rounded-lg p-6 transition-all h-11/12 overflow-y-auto">
        <CustomerTable />
      </div>

      <CreateCustomerWizard
        isOpen={isCreateCustomerOpen}
        onClose={() => setIsCreateCustomerOpen(false)}
      />
    </div>
  );
};

export default CustomerManagementPage;
