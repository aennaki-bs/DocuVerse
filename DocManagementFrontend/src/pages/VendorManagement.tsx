import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import VendorTable from "@/components/reference-tables/VendorTable";
import CreateVendorWizard from "@/components/reference-tables/CreateVendorWizard";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const VendorManagementPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // You can add role-based access control here if needed
    // if (user?.role !== "Admin" && user?.role !== "FullUser") {
    //   toast.error("You do not have permission to access vendor management");
    //   navigate("/dashboard");
    // }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="space-y-6 p-6 h-full">
      <div className="bg-white dark:bg-[#0a1033] border border-blue-200 dark:border-blue-900/30 rounded-lg p-6 mb-6 transition-all h-1/12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-blue-900 dark:text-white flex items-center">
              <Truck className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />{" "}
              Vendor Management
            </h1>
            <p className="text-sm md:text-base text-blue-700 dark:text-gray-400">
              Manage your vendor database and supplier information
            </p>
          </div>
          <Button
            onClick={() => setIsCreateVendorOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a1033] border border-blue-200 dark:border-blue-900/30 rounded-lg p-6 transition-all h-11/12 overflow-y-auto">
        <VendorTable />
      </div>

      <CreateVendorWizard
        isOpen={isCreateVendorOpen}
        onClose={() => setIsCreateVendorOpen(false)}
      />
    </div>
  );
};

export default VendorManagementPage;
