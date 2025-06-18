import { useState } from 'react';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';

interface UseDocumentMovementProps {
  onMoveSuccess?: () => void;
}

export function useDocumentMovement({ onMoveSuccess }: UseDocumentMovementProps = {}) {
  const [isMoving, setIsMoving] = useState(false);
  
  const moveDocument = async (params: {
    documentId: number;
    currentStepId: number | null | undefined;
    targetStepId: number;
    currentStep: any;
    targetStep: any;
    comments?: string;
  }) => {
    const { documentId, currentStepId, targetStepId, currentStep, targetStep, comments = '' } = params;
    
    if (!currentStep || !targetStep || !currentStepId) {
      toast.error("Missing step information");
      return false;
    }
    
    setIsMoving(true);
    
    try {
      // Determine direction based on step order index
      const isMovingForward = targetStep.orderIndex > currentStep.orderIndex;
      const isMovingBackward = targetStep.orderIndex < currentStep.orderIndex;
      
      console.log("Moving document:", {
        documentId,
        currentStepId,
        targetStepId,
        direction: isMovingForward ? "forward" : (isMovingBackward ? "backward" : "same")
      });
      
      if (isMovingForward) {
        // Moving forward - use move-next endpoint
        await circuitService.moveDocumentToNextStep({
          documentId,
          comments: comments || `Moving document to next step`
        });
        toast.success('Document moved to next step successfully');
      } else if (isMovingBackward) {
        // Moving backward - use return-to-previous endpoint
        await circuitService.returnToPreviousStep({
          documentId,
          comments: comments || `Returning document to previous step`
        });
        toast.success('Document returned to previous step successfully');
      } else {
        // Moving to same level - use move-next endpoint
        await circuitService.moveDocumentToNextStep({
          documentId,
          comments: comments || `Moving document to step #${targetStepId}`
        });
        toast.success('Document moved successfully');
      }
      
      if (onMoveSuccess) {
        onMoveSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error moving document:', error);
      const errorMessage = error?.response?.data || error.message || 'Failed to move document';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsMoving(false);
    }
  };
  
  return {
    isMoving,
    moveDocument
  };
}
