import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Hash } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import UniteCodesManagement from "@/components/line-elements/UniteCodesManagement";
import { toast } from "sonner";
import lineElementsService from "@/services/lineElementsService";
import { LignesElementType } from "@/models/lineElements";

const UnitCodesPage = () => {
  const [elementType, setElementType] = useState<
    LignesElementType | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElementType = async () => {
      try {
        setIsLoading(true);
        const elementTypes = await lineElementsService.elementTypes.getAll();
        const unitCodeElementType = elementTypes.find(
          (et) => et.tableName.toLowerCase() === "unitecode"
        );
        setElementType(unitCodeElementType);
      } catch (error) {
        console.error("Failed to fetch element type:", error);
        toast.error("Failed to load element type information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElementType();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              Loading unit codes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400/80">
        <span>Line Elements</span>
        <span>/</span>
        <span className="text-blue-800 dark:text-blue-100">Unit Codes</span>
      </div>

      <PageHeader
        title="Unit Codes Management"
        description="Manage unit codes used in document lines"
        icon={<Hash className="h-6 w-6 text-amber-400" />}
        actions={
          <Link to="/line-elements-management?tab=unitecodes">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/20"
            >
              <Hash className="h-4 w-4 mr-2" />
              View in Tabbed Interface
            </Button>
          </Link>
        }
      />

      <div className="bg-white dark:bg-[#0f1642] border-blue-200 dark:border-blue-900/30 rounded-lg overflow-hidden">
        <div className="p-6">
          <UniteCodesManagement searchTerm="" elementType={elementType} />
        </div>
      </div>
    </div>
  );
};

export default UnitCodesPage;
