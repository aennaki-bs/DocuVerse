
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertCircle, Settings, Loader2 } from 'lucide-react';
import { DocumentStatus, DocumentWorkflowStatus } from '@/models/documentCircuit';
import { Button } from '@/components/ui/button';
import { EditStepStatusDialog } from './EditStepStatusDialog';
import { useState } from 'react';
import { useStepStatuses } from '@/hooks/useStepStatuses';
import { useWorkflowStepStatuses } from '@/hooks/useWorkflowStepStatuses';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StepRequirementsCardProps {
  workflowStatus?: DocumentWorkflowStatus;
}

export function StepRequirementsCard({ workflowStatus }: StepRequirementsCardProps) {
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(null);
  
  // Use the workflow API to get the current statuses for this document
  const { 
    workflowStatuses = [], 
    isLoading: isLoadingWorkflow 
  } = useWorkflowStepStatuses(workflowStatus?.documentId || 0);

  // Use the management API to get the status definitions for the current step
  const {
    statuses = [],
    isLoading: isLoadingManagement
  } = useStepStatuses(workflowStatus?.currentStepId || 0);

  const handleEditStatus = (status: DocumentStatus) => {
    setSelectedStatus(status);
  };

  const isLoading = isLoadingWorkflow || isLoadingManagement;

  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md hover:shadow-lg transition-shadow w-full">
      <CardHeader className="bg-blue-950/40 border-b border-blue-900/30 pb-2 px-3 py-2">
        <CardTitle className="text-base font-medium text-white flex items-center">
          <span>Step Statuses</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : workflowStatuses && workflowStatuses.length > 0 ? (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 text-sm">
            {workflowStatuses.map(status => (
              <div 
                key={status.statusId} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  status.isComplete 
                    ? 'bg-green-900/20 border border-green-900/30' 
                    : status.isRequired 
                      ? 'bg-red-900/10 border border-red-900/20' 
                      : 'bg-blue-900/20 border border-blue-900/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {status.isComplete ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                  ) : status.isRequired ? (
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-400" />
                    </div>
                  )}
                  <span className="text-xs font-medium">{status.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge 
                    variant={
                      status.isComplete 
                        ? "success" 
                        : status.isRequired 
                          ? "destructive" 
                          : "outline"
                    }
                    className={`text-xs px-1.5 py-0.5 ${
                      status.isComplete 
                        ? "bg-green-500/20 text-green-200 border-green-500/30" 
                        : status.isRequired 
                          ? "bg-red-500/20 text-red-200 border-red-500/30" 
                          : "bg-blue-500/20 text-blue-200 border-blue-500/30"
                    }`}
                  >
                    {status.isComplete ? "Complete" : status.isRequired ? "Required" : "Optional"}
                  </Badge>
                  
                  {status.isComplete && status.completedBy && (
                    <span className="text-xs text-green-300 hidden sm:inline">by {status.completedBy}</span>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-blue-900/20"
                    onClick={() => handleEditStatus(status)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
            No requirements for this step
          </div>
        )}
      </CardContent>

      {selectedStatus && (
        <EditStepStatusDialog
          open={!!selectedStatus}
          onOpenChange={(open) => !open && setSelectedStatus(null)}
          status={selectedStatus}
          documentId={workflowStatus?.documentId}
          onSuccess={() => setSelectedStatus(null)}
        />
      )}
    </Card>
  );
}
