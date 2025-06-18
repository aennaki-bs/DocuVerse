import { FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NoCircuitAssignedCardProps {
  documentId: string | number;
  navigateToDocument: () => void;
}

export const NoCircuitAssignedCard = ({
  documentId,
  navigateToDocument,
}: NoCircuitAssignedCardProps) => {
  return (
    <Card className="bg-[#0a1033] border-orange-500/30 shadow-lg">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="bg-orange-500/10 p-4 rounded-full mb-4">
          <AlertTriangle className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Circuit Assigned</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          This document doesn't have a circuit assigned yet. A circuit must be
          assigned to view and process workflow steps.
        </p>
        <div className="flex gap-4">
          <Button
            variant="default"
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() =>
              window.open(`/documents/${documentId}/edit`, "_self")
            }
          >
            Edit Document
          </Button>
          <Button
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-900/20"
            onClick={navigateToDocument}
          >
            Back to Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
