import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { StepFormDialog } from '@/components/steps/dialogs/StepFormDialog';
import { DeleteStepDialog } from '@/components/steps/dialogs/DeleteStepDialog';
import { BulkActionBar } from '@/components/steps/BulkActionBar';
import { StepLoadingState } from '@/components/steps/StepLoadingState';
import { useAuth } from '@/context/AuthContext';
import { useCircuitSteps } from '@/hooks/useCircuitSteps';
import { CircuitStepsHeader } from '@/components/circuit-steps/CircuitStepsHeader';
import { CircuitStepsSearchBar } from '@/components/circuit-steps/CircuitStepsSearchBar';
import { CircuitStepsContent } from '@/components/circuit-steps/CircuitStepsContent';
import { CircuitStepsError } from '@/components/circuit-steps/CircuitStepsError';
import { toast } from 'sonner';
import stepService from '@/services/stepService';

export default function CircuitStepsPage() {
  const { circuitId = '' } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    circuit,
    steps,
    searchQuery,
    selectedSteps,
    apiError,
    viewMode,
    isLoading,
    isError,
    setSearchQuery,
    handleStepSelection,
    handleSelectAll,
    setViewMode,
    setSelectedSteps,
    refetchSteps
  } = useCircuitSteps(circuitId);

  const isCircuitActive = circuit?.isActive || false;

  const handleAddStep = () => {
    if (isCircuitActive) {
      toast.error("Cannot add steps to an active circuit");
      return;
    }
    setSelectedStep(null);
    setFormDialogOpen(true);
  };

  const handleEditStep = (step: Step) => {
    if (isCircuitActive) {
      toast.error("Cannot edit steps in an active circuit");
      return;
    }
    setSelectedStep(step);
    setFormDialogOpen(true);
  };

  const handleDeleteStep = (step: Step) => {
    if (isCircuitActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }
    setSelectedStep(step);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (isCircuitActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }
    
    if (selectedSteps.length === 0) {
      toast.error("No steps selected for deletion");
      return;
    }

    // Show confirmation dialog
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsDeleting(true);
      setBulkDeleteDialogOpen(false);
      await stepService.deleteMultipleSteps(selectedSteps);
      setSelectedSteps([]);
      refetchSteps();
    } catch (error) {
      console.error('Failed to delete steps:', error);
      toast.error('Failed to delete selected steps');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <StepLoadingState />;
  }

  if (isError) {
    return (
      <CircuitStepsError errorMessage={apiError} type="error" />
    );
  }

  // If circuit not found
  if (!circuit) {
    return (
      <CircuitStepsError type="notFound" />
    );
  }

  return (
    <div className="container-fluid responsive-padding space-y-6 mb-8">
      <CircuitStepsHeader 
        circuit={circuit} 
        onAddStep={handleAddStep} 
        isSimpleUser={isSimpleUser} 
      />
      
      {apiError && (
        <CircuitStepsError errorMessage={apiError} type="error" />
      )}
      
      <CircuitStepsSearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <CircuitStepsContent
        steps={steps}
        selectedSteps={selectedSteps}
        onSelectStep={handleStepSelection}
        onSelectAll={handleSelectAll}
        onEdit={handleEditStep}
        onDelete={handleDeleteStep}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddStep={handleAddStep}
        isSimpleUser={isSimpleUser}
        circuitId={circuitId}
        circuit={circuit}
      />
      
      <BulkActionBar
        selectedCount={selectedSteps.length}
        onBulkDelete={handleBulkDelete}
        disabled={isCircuitActive || isSimpleUser || isDeleting}
        isDeleting={isDeleting}
        isCircuitActive={isCircuitActive}
        isSimpleUser={isSimpleUser}
      />
      
      {/* Step Form Dialog - Now passing the circuit ID */}
      <StepFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={refetchSteps}
        editStep={selectedStep ?? undefined}
        circuitId={parseInt(circuitId, 10)}
      />
      
      {/* Delete Step Dialog */}
      {selectedStep && (
        <DeleteStepDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          stepId={selectedStep.id}
          stepTitle={selectedStep.title}
          onSuccess={refetchSteps}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteStepDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        stepId={0} // Not used for bulk delete
        stepTitle={`${selectedSteps.length} selected steps`}
        onSuccess={refetchSteps}
        onConfirm={confirmBulkDelete}
        isBulk={true}
        count={selectedSteps.length}
      />
    </div>
  );
}
