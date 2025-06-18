import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { SubType } from "@/models/subtype";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import { useAuth } from "@/context/AuthContext";

const SubTypeManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);

  useEffect(() => {
    const fetchSubTypes = async () => {
      try {
        setIsLoading(true);
        const data = await subTypeService.getAllSubTypes();
        setSubTypes(data);
      } catch (error) {
        console.error("Failed to load series:", error);
        toast.error("Failed to load series");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubTypes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center">
              <Layers className="mr-3 h-6 w-6 text-blue-400" /> Series
              Management
            </h1>
            <p className="text-blue-300/70 mt-1">
              Manage document series across all document types
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#0a1033]/80 border border-blue-900/30 rounded-lg p-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-300 mt-4">Loading series...</p>
          </div>
        ) : subTypes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-blue-300">No series found</p>
            <p className="text-sm text-blue-300/70 mt-2">
              Start by creating series in specific document types
            </p>
            <button
              onClick={() => navigate("/document-types-management")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Go to Document Types
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-blue-300">
              This is a placeholder for the Series Management page.
            </p>
            <p className="text-blue-400/70 mt-2">
              Please manage series directly from the Document Types detail
              pages.
            </p>
            <button
              onClick={() => navigate("/document-types-management")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Go to Document Types
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubTypeManagement;
