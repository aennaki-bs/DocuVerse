import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircuitStepCard } from './CircuitStepCard';
import { DocumentCircuitHistory, DocumentWorkflowStatus } from '@/models/documentCircuit';
import { Document } from '@/models/document';
import { DraggableDocumentCard } from './DraggableDocumentCard';
import { useDocumentMovement } from '@/hooks/useDocumentMovement';
import { CircuitStepsSectionHeader } from './CircuitStepsSectionHeader';
import { DeleteStepDialog } from '../steps/dialogs/DeleteStepDialog';

interface CircuitStepsSectionProps {
  circuitDetails: any[];
  circuitHistory: DocumentCircuitHistory[];
  document: Document;
  workflowStatus: DocumentWorkflowStatus;
  isSimpleUser: boolean;
  onMoveClick: () => void;
  onProcessClick: () => void;
  onNextStepClick: () => void;
  onDocumentMoved: () => void;
}

export const CircuitStepsSection = ({
  circuitDetails,
  circuitHistory,
  document,
  workflowStatus,
  isSimpleUser,
  onMoveClick,
  onProcessClick,
  onNextStepClick,
  onDocumentMoved
}: CircuitStepsSectionProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const [draggedOverStepId, setDraggedOverStepId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<{ id: number, title: string } | null>(null);
  
  const currentStepId = workflowStatus?.currentStepId;
  
  const { isMoving, moveDocument } = useDocumentMovement({
    onMoveSuccess: onDocumentMoved
  });

  if (!circuitDetails || circuitDetails.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No steps defined for this circuit. The circuit may be improperly configured.
        </AlertDescription>
      </Alert>
    );
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stepId: number) => {
    e.preventDefault();
    if (stepId !== currentStepId && !isSimpleUser) {
      setDraggedOverStepId(stepId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverStepId(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, stepId: number) => {
    e.preventDefault();
    setDraggedOverStepId(null);
    
    // Prevent drops for simple users or if dropping onto current step
    if (isSimpleUser || stepId === currentStepId || !currentStepId) {
      return;
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.documentId && document?.id === data.documentId) {
        // Get current and target step information
        const currentStep = circuitDetails.find(step => step.id === currentStepId);
        const targetStep = circuitDetails.find(step => step.id === stepId);
        
        await moveDocument({
          documentId: document.id,
          currentStepId,
          targetStepId: stepId,
          currentStep,
          targetStep,
          comments: `Moved document from step ${currentStep?.title || currentStepId} to ${targetStep?.title || stepId}`
        });
      }
    } catch (error) {
      console.error('Error moving document:', error);
    }
  };

  const handleDeleteStep = (step: any) => {
    if (isSimpleUser) return;
    setStepToDelete({ id: step.id, title: step.title });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="flex gap-4 p-4 min-w-max">
          {circuitDetails.map((detail) => {
            const historyForStep = circuitHistory?.filter(h => h.circuitDetailId === detail.id) || [];
            const isOver = draggedOverStepId === detail.id;
            const isCurrentStep = detail.id === currentStepId;
            
            return (
              <div 
                key={detail.id} 
                className={`w-56 sm:w-60 flex-shrink-0 transition-all duration-300 ${isOver ? 'scale-105 transform' : ''}`}
                onDragOver={(e) => handleDragOver(e, detail.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, detail.id)}
              >
                <CircuitStepCard 
                  detail={detail}
                  currentStepId={currentStepId}
                  historyForStep={historyForStep}
                  isSimpleUser={isSimpleUser}
                  onMoveClick={onMoveClick}
                  onProcessClick={onProcessClick}
                  onDeleteStep={() => handleDeleteStep(detail)}
                  isDraggedOver={isOver}
                >
                  {isCurrentStep && document && (
                    <div className="mt-1.5 mb-1.5">
                      <DraggableDocumentCard 
                        document={document} 
                        onDragStart={() => console.log('Dragging document', document.id)} 
                      />
                    </div>
                  )}
                </CircuitStepCard>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Step Dialog */}
      {stepToDelete && (
        <DeleteStepDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          stepId={stepToDelete.id}
          stepTitle={stepToDelete.title}
          documentId={document.id}
          onSuccess={onDocumentMoved}
        />
      )}
    </div>
  );
}; 