import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Edit2, Trash2, ChevronRight, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentTypeGridProps {
  types: DocumentType[];
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DocumentTypeGrid = ({
  types,
  onDeleteType,
  onEditType,
  searchQuery,
  onSearchChange,
}: DocumentTypeGridProps) => {
  const navigate = useNavigate();

  // Handle card click to navigate to subtypes page
  const handleCardClick = (typeId: number | undefined) => {
    if (typeId) {
      navigate(`/document-types/${typeId}/subtypes`);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search bar has been moved to DocumentTypesHeader component */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {types.map((type) => (
          <Card
            key={type.id}
            className="bg-[#0f1642] border-blue-900/30 shadow-lg overflow-hidden hover:border-blue-700/50 transition-all cursor-pointer group relative"
            onClick={() => handleCardClick(type.id)}
          >
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-white">
                  {type.typeName || "Unnamed Type"}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditType(type);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit document type</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            type.documentCounter && type.documentCounter > 0
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            type.documentCounter === 0 &&
                              type.id &&
                              onDeleteType(type.id);
                          }}
                          disabled={
                            type.documentCounter !== undefined &&
                            type.documentCounter > 0
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {type.documentCounter && type.documentCounter > 0
                          ? "Cannot delete types with documents"
                          : "Delete document type"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-300">
                Key: <span className="text-white">{type.typeKey || "N/A"}</span>
              </p>
              {type.typeAttr && (
                <p className="text-sm text-blue-300 mt-1">
                  Description:{" "}
                  <span className="text-white">{type.typeAttr}</span>
                </p>
              )}
              <p className="text-sm text-blue-300 mt-2">
                Documents:{" "}
                <span className="text-white font-medium">
                  {type.documentCounter || 0}
                </span>
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center text-blue-400 text-sm">
                <Layers className="h-3.5 w-3.5 mr-1" />
                <span>View Series</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentTypeGrid;
