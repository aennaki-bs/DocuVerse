import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, MoveRight, Loader2, AlertCircle } from 'lucide-react';
import circuitService from '@/services/circuitService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DocumentStatus } from '@/models/documentCircuit';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface MoveDocumentButtonProps {
  documentId: number;
  onStatusChange: (result?: {
    requiresApproval?: boolean;
    approvalId?: number;
    success?: boolean;
    message?: string;
  }) => void;
  disabled?: boolean;
  transitions?: any[];
  disabledReason?: string;
}

export function MoveDocumentButton({ 
  documentId,
  onStatusChange,
  disabled = false,
  transitions,
  disabledReason
}: MoveDocumentButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  const [nextStatuses, setNextStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Check if user is SimpleUser (read-only access)  
  const isSimpleUser = user?.role === "SimpleUser";

  // Fetch document status and valid transitions when dialog opens
  useEffect(() => {
    if (open) {
      fetchDocumentStatus();
    }
  }, [open, documentId]);

  // Helper function to check if a status is flexible
  const isStatusFlexible = (status: any) => {
    if (!status) return false;
    
    // Check explicit isFlexible property
    if (status.isFlexible === true) return true;
    
    // Check if the status key or title contains indicators of flexibility
    const flexibleKeywords = ['flexible', 'any', 'free', 'open', 'custom'];
    const statusKey = (status.statusKey || '').toLowerCase();
    const statusTitle = (status.title || '').toLowerCase();
    
    return flexibleKeywords.some(keyword => 
      statusKey.includes(keyword) || statusTitle.includes(keyword)
    );
  };

  // Fetch the current document status
  const fetchDocumentStatus = async () => {
    if (!documentId) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching document status for document ID:', documentId);
      
      // Get the document's current workflow status
      const workflowStatus = await circuitService.getDocumentCurrentStatus(documentId);
      console.log('Workflow status:', workflowStatus);
      
      // Check if current status is flexible
      let isFlexible = false;
      
      // Check in available transitions
      const currentStatusInTransitions = workflowStatus.availableStatusTransitions?.find(
        status => status.statusId === workflowStatus.currentStatusId
      );
      
      if (isStatusFlexible(currentStatusInTransitions)) {
        isFlexible = true;
      }
      
      // Check in statuses array
      const currentStatusInStatuses = workflowStatus.statuses?.find(
        status => status.statusId === workflowStatus.currentStatusId
      );
      
      if (isStatusFlexible(currentStatusInStatuses)) {
        isFlexible = true;
      }
      
      console.log('Is current status flexible:', isFlexible);
      
      setCurrentStatus({
        statusId: workflowStatus.currentStatusId,
        title: workflowStatus.currentStatusTitle,
        isFlexible: isFlexible
      });
      
      if (isFlexible) {
        // For flexible status, get all available transitions
        console.log('Current status is flexible, getting all available transitions');
        const availableTransitions = await circuitService.getAvailableTransitions(documentId);
        console.log('Available transitions for flexible status:', availableTransitions);
        
        // Filter out the current status
        const filteredTransitions = availableTransitions.filter(
          status => status.statusId !== workflowStatus.currentStatusId
        );
        
        setNextStatuses(filteredTransitions);
      } else {
        // For non-flexible status, get only valid next transitions
        console.log('Current status is not flexible, getting step statuses');
        const stepStatuses = await circuitService.getDocumentStepStatuses(documentId);
        console.log('Step statuses:', stepStatuses);
        
        // Find steps where currentStatus matches document's status
        const matchingSteps = stepStatuses.filter(step => 
          step.currentStatusId === workflowStatus.currentStatusId
        );
        console.log('Matching steps:', matchingSteps);
        
        // Extract only the next statuses from those steps
        const validNextStatuses = matchingSteps
          .filter(step => step.nextStatusId && step.nextStatusTitle)
          .map(step => ({
            statusId: step.nextStatusId,
            title: step.nextStatusTitle
          }));
        
        // Remove duplicates
        const uniqueStatuses = validNextStatuses.filter((status, index, self) =>
          index === self.findIndex((s) => s.statusId === status.statusId)
        );
        
        console.log('Valid next statuses for non-flexible status:', uniqueStatuses);
        setNextStatuses(uniqueStatuses);
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
      toast.error('Failed to load available transitions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (statusId: number) => {
    setSelectedStatusId(statusId);
  };

  const handleConfirm = async () => {
    if (selectedStatusId === null) return;
    
    setIsMoving(true);
    try {
      // Get the current workflow status to check if it's complete
      const workflowStatus = await circuitService.getDocumentCurrentStatus(documentId);
      
      // Check if the document status is complete
      if (!workflowStatus.isCircuitCompleted) {
        toast.error("You must mark the current status as complete before moving the document");
        setOpen(false);
        return;
      }
      
      // Find the selected status to get the title
      const selectedStatus = nextStatuses.find(status => status.statusId === selectedStatusId);
      if (!selectedStatus) {
        toast.error("Selected status not found");
        setIsMoving(false);
        return;
      }
      
      const statusTitle = selectedStatus ? selectedStatus.title : 'selected status';
      const requiresApproval = !!selectedStatus.requiresApproval;
      
      console.log("Selected status:", selectedStatus);
      console.log("Requires approval:", requiresApproval);
      
      const result = await circuitService.moveToStatus(
        documentId, 
        selectedStatusId, 
        `Changed status from ${currentStatus?.title} to ${statusTitle}`
      );
      
      // Close dialog first
      setOpen(false);
      setSelectedStatusId(null);
      
      // Trigger immediate refresh - let parent handle toast notifications
      onStatusChange(result);
      
      // Add a small delay then trigger another refresh to ensure backend changes are reflected
      setTimeout(() => {
        onStatusChange({
          success: true,
          message: "Auto-refresh after move operation"
        });
      }, 1000); // 1 second delay for backend processing
      
    } catch (error) {
      console.error('Error moving document:', error);
      toast.error('Failed to move document');
    } finally {
      setIsMoving(false);
    }
  };

  // Add tooltip message based on disabled state
  const getDisabledMessage = () => {
    if (disabled) {
      return disabledReason || "You must mark the current status as complete before moving the document";
    }
    return null;
  };

  return (
    <>
      {isSimpleUser ? (
        <Button
          disabled
          className="bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
          title="Read-only access: You can view the workflow but cannot move documents"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          View Only
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default" 
                    size="lg"
                    className="w-full"
                    disabled={disabled}
                  >
                    <MoveRight className="mr-2 h-4 w-4" /> Move Document
                  </Button>
                </TooltipTrigger>
                {disabled && (
                  <TooltipContent>
                    <p>{getDisabledMessage()}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Move Document</DialogTitle>
              <DialogDescription>
                {currentStatus && (
                  <>
                    Current status: <strong>{currentStatus.title}</strong>
                    {currentStatus.isFlexible && (
                      <span className="text-purple-400 ml-2">(Flexible)</span>
                    )}
                    . 
                  </>
                )}
                {currentStatus?.isFlexible 
                  ? "This is a flexible status. You can move to any status in the workflow." 
                  : "Select a status to move the document to."}
              </DialogDescription>
            </DialogHeader>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="max-h-[50vh] pr-4 my-4">
                {nextStatuses.length > 0 ? (
                  <div className="space-y-2">
                    {nextStatuses.map((status) => (
                      <div
                        key={status.statusId}
                        className={cn(
                          "flex items-start p-3 rounded-md cursor-pointer border transition-colors",
                          selectedStatusId === status.statusId 
                            ? "bg-blue-900/20 border-blue-600" 
                            : "border-gray-800 hover:border-gray-700 hover:bg-gray-900/50"
                        )}
                        onClick={() => handleSelect(status.statusId)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{status.title}</h4>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          {status.requiresApproval && (
                            <div className="mt-2 text-xs text-amber-400 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              This step will require approval
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-4">
                    No valid transitions available from the current status.
                  </p>
                )}
              </ScrollArea>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isMoving}
              >
                Cancel
              </Button>
              <Button 
                disabled={selectedStatusId === null || isMoving} 
                onClick={handleConfirm}
              >
                {isMoving ? (
                  <>
                    Moving... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 