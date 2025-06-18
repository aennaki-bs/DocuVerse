import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DocumentStatus, DocumentWorkflowStatus } from '@/models/documentCircuit';
import { ArrowRightCircle } from 'lucide-react';
import { SimpleStatusDialog } from './SimpleStatusDialog';

interface StatusTransitionCardProps {
  workflowStatus: DocumentWorkflowStatus | null;
  onSuccess: () => void;
}

export function StatusTransitionCard({ workflowStatus, onSuccess }: StatusTransitionCardProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const hasTransitions = workflowStatus && 
                        workflowStatus.availableStatusTransitions && 
                        workflowStatus.availableStatusTransitions.length > 0;
  
  if (!hasTransitions) {
    return (
      <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md hover:shadow-lg transition-shadow w-full">
        <CardHeader className="bg-blue-950/40 border-b border-blue-900/30 pb-2 px-3 py-2">
          <CardTitle className="text-base font-medium text-white flex items-center">
            <span>Available Transitions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-sm">
          <p className="text-gray-400">No available transitions for this document in its current status.</p>
          <p className="text-xs text-gray-600 mt-2">
            {workflowStatus ? 
              `Current status: ${workflowStatus.currentStatusTitle || 'Unknown'}` : 
              'Workflow status data unavailable'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleTransitionClick = () => {
    if (selectedStatus) {
      setIsDialogOpen(true);
    }
  };

  const getSelectedStatusDetails = (): DocumentStatus | undefined => {
    const statusId = parseInt(selectedStatus);
    return workflowStatus?.availableStatusTransitions?.find(s => s.statusId === statusId);
  };

  const renderStatusBadge = (status: DocumentStatus) => {
    if (status.isInitial) return <span className="text-xs text-blue-400 ml-1">(Initial)</span>;
    if (status.isFinal) return <span className="text-xs text-green-400 ml-1">(Final)</span>;
    if (status.isFlexible) return <span className="text-xs text-purple-400 ml-1">(Flexible)</span>;
    return null;
  };

  return (
    <>
      <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md hover:shadow-lg transition-shadow w-full">
        <CardHeader className="bg-blue-950/40 border-b border-blue-900/30 pb-2 px-3 py-2">
          <CardTitle className="text-base font-medium text-white flex items-center">
            <span>Available Transitions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-sm space-y-3">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-blue-300">
              Select Next Status:
            </label>
            <Select onValueChange={handleStatusChange} value={selectedStatus}>
              <SelectTrigger className="bg-[#152057] border-blue-900/50 focus:ring-blue-600">
                <SelectValue placeholder="Choose a status" />
              </SelectTrigger>
              <SelectContent className="bg-[#152057] border-blue-900/50">
                {workflowStatus?.availableStatusTransitions?.map((status) => (
                  <SelectItem 
                    key={status.statusId} 
                    value={status.statusId.toString()}
                    className="focus:bg-blue-900/30"
                  >
                    <div className="flex items-center">
                      <span>{status.title}</span>
                      {renderStatusBadge(status)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus && (
            <div className="text-xs text-gray-400 mt-1">
              <p>
                {getSelectedStatusDetails()?.transitionInfo || 
                  `Move to ${getSelectedStatusDetails()?.title}`}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleTransitionClick}
              disabled={!selectedStatus}
              className="mt-2"
            >
              <ArrowRightCircle className="h-4 w-4 mr-1" />
              Change Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedStatus && (
        <SimpleStatusDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          documentId={workflowStatus?.documentId || 0}
          targetStatus={getSelectedStatusDetails()}
          currentStatusTitle={workflowStatus?.currentStatusTitle || ''}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
} 