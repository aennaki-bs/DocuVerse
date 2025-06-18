import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusTable } from '@/components/statuses/StatusTable';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StepStatusesTableContentProps {
  statuses: any[];
  onEdit: (status: any) => void;
  onDelete: (status: any) => void;
  isSimpleUser: boolean;
  apiError?: string;
  isCircuitActive?: boolean;
}

export function StepStatusesTableContent({
  statuses,
  onEdit,
  onDelete,
  isSimpleUser,
  apiError,
  isCircuitActive = false
}: StepStatusesTableContentProps) {
  return (
    <>
      {apiError && (
        <Alert variant="destructive" className="mb-4 border-red-800 bg-red-950/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {apiError}
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full shadow-md bg-[#111633]/70 border-blue-900/30">
        <CardHeader className="flex flex-row items-center justify-between border-b border-blue-900/30 bg-blue-900/20 p-3 sm:p-4">
          <CardTitle className="text-lg text-blue-100">Step Statuses</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <StatusTable 
            statuses={statuses}
            onEdit={onEdit}
            onDelete={onDelete}
            isCircuitActive={isCircuitActive}
          />
        </CardContent>
      </Card>
    </>
  )
}
