import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightCircle,
  CheckCircle,
  CircleDot,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { DocumentStepStatus } from '@/hooks/useDocumentStepStatuses';
import { useCircuitWorkflow } from '@/hooks/useCircuitWorkflow';
import { toast } from 'sonner';

interface StepStatusTransitionCardProps {
  documentId: number;
  stepStatuses: DocumentStepStatus[] | undefined;
  isLoading: boolean;
  onStatusChange: () => void;
}

export function StepStatusTransitionCard({ 
  documentId, 
  stepStatuses, 
  isLoading,
  onStatusChange 
}: StepStatusTransitionCardProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [targetStatusId, setTargetStatusId] = useState<number | null>(null);
  const { moveToStatus } = useCircuitWorkflow();

  if (isLoading) {
    return (
      <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md hover:shadow-lg transition-shadow w-full">
        <CardHeader className="bg-blue-950/40 border-b border-blue-900/30 pb-2 px-3 py-2">
          <CardTitle className="text-base font-medium text-white flex items-center">
            <span>Step Statuses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-sm flex justify-center py-6">
          <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!stepStatuses || stepStatuses.length === 0) {
    return (
      <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md hover:shadow-lg transition-shadow w-full">
        <CardHeader className="bg-blue-950/40 border-b border-blue-900/30 pb-2 px-3 py-2">
          <CardTitle className="text-base font-medium text-white flex items-center">
            <span>Step Statuses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-sm">
          <p className="text-gray-400">No step statuses available for this document.</p>
        </CardContent>
      </Card>
    );
  }

  const handleMoveToStatus = async (statusId: number, statusTitle: string) => {
    if (isMoving) return;
    
    setIsMoving(true);
    setTargetStatusId(statusId);
    
    try {
      await moveToStatus({
        documentId,
        targetStatusId: statusId,
        comments: `Changed status to ${statusTitle}`
      });
      toast.success(`Document moved to ${statusTitle}`);
      onStatusChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to move document');
    } finally {
      setIsMoving(false);
      setTargetStatusId(null);
    }
  };

  // Find current step
  const currentStep = stepStatuses.find(step => step.isCurrentStep);
  
  // Group steps by completion status
  const completedSteps = stepStatuses.filter(step => step.isCompleted);
  const pendingSteps = stepStatuses.filter(step => !step.isCompleted);

  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md hover:shadow-lg transition-shadow w-full">
      <CardHeader className="bg-blue-950/40 border-b border-blue-900/30 pb-2 px-3 py-2">
        <CardTitle className="text-base font-medium text-white flex items-center">
          <span>Step Statuses & Transitions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-sm">
        {currentStep && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-900/40 rounded-md">
            <p className="font-medium text-blue-300 mb-1">Current Step</p>
            <p className="text-white">{currentStep.title}</p>
            <p className="text-sm text-gray-400 mt-1">
              Current Status: <span className="text-blue-300">{currentStep.currentStatusTitle}</span>
            </p>
            {currentStep.nextStatusTitle && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-gray-400">Next Status:</span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleMoveToStatus(currentStep.nextStatusId, currentStep.nextStatusTitle)}
                  disabled={isMoving}
                  className="ml-2"
                >
                  {isMoving && targetStatusId === currentStep.nextStatusId ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <ArrowRightCircle className="h-3 w-3 mr-1" />
                  )}
                  Move to {currentStep.nextStatusTitle}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Available Steps</h3>
            <div className="space-y-2">
              {pendingSteps.map((step) => (
                <div 
                  key={step.stepId}
                  className="p-2 border border-gray-800 rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {step.isCurrentStep ? (
                      <CircleDot className="h-4 w-4 text-blue-400 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    )}
                    <span>{step.title}</span>
                  </div>
                  
                  {!step.isCurrentStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveToStatus(step.currentStatusId, step.currentStatusTitle)}
                      disabled={isMoving}
                    >
                      {isMoving && targetStatusId === step.currentStatusId ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <ArrowRightCircle className="h-3 w-3 mr-1" />
                      )}
                      Move
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {completedSteps.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-400 mb-2">Completed Steps</h3>
              <div className="space-y-2">
                {completedSteps.map((step) => (
                  <div 
                    key={step.stepId}
                    className="p-2 border border-green-900/30 bg-green-900/10 rounded-md flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>{step.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {step.completedBy && `by ${step.completedBy}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 