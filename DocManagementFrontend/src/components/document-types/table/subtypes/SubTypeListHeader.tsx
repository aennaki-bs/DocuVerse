import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";

interface SubTypeListHeaderProps {
  documentTypeName: string;
  onCreateClick: () => void;
}

export default function SubTypeListHeader({
  documentTypeName,
  onCreateClick,
}: SubTypeListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0a1033]/60 border border-blue-900/30 rounded-lg p-4 mb-4">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Layers className="h-5 w-5 mr-2 text-blue-400" />
          Series
        </h2>
        <p className="text-sm text-blue-300/80 mt-1">
          Manage series for{" "}
          <span className="text-blue-300 font-medium">{documentTypeName}</span>
        </p>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Series
      </Button>
    </div>
  );
}
