import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import circuitService from '@/services/circuitService';
import { useAuth } from '@/context/AuthContext';
import { DocumentStatus } from '@/models/documentCircuit';
import { useStepStatuses } from '@/hooks/useStepStatuses';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { StepStatusesHeader } from './step-statuses/StepStatusesHeader';
import { StepStatusesTableContent } from './step-statuses/StepStatusesTableContent';
import { StepStatusesModals } from './step-statuses/StepStatusesModals';
import { StepStatusesNotFound } from './step-statuses/StepStatusesNotFound';

export default function StepStatusesPage() {
  const { circuitId, stepId } = useParams<{ circuitId: string; stepId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  const queryClient = useQueryClient();
  
  const [apiError, setApiError] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(null);

  // Fetch circuit details
  const { 
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    refetch: refetchCircuit
  } = useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId
  });

  // Fetch steps for the circuit
  const {
    data: steps = [],
    isLoading: isStepsLoading,
    isError: isStepsError,
    refetch: refetchSteps
  } = useQuery({
    queryKey: ['circuit-steps', circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(Number(circuitId)),
    enabled: !!circuitId
  });

  // Find the current step
  const currentStep = steps.find(s => s.id === Number(stepId));

  // Fetch statuses for the step
  const {
    statuses = [],
    isLoading: isStatusesLoading,
    isError: isStatusesError,
    refetch: refetchStatuses
  } = useStepStatuses(Number(stepId));

  // Handler to refresh all data after changes
  const handleRefreshData = async () => {
    try {
      // Invalidate all related queries to force a refresh
      await queryClient.invalidateQueries({ queryKey: ['circuit', circuitId] });
      await queryClient.invalidateQueries({ queryKey: ['circuit-steps', circuitId] });
      await queryClient.invalidateQueries({ queryKey: ['step-statuses', stepId] });
      
      // Refetch the data
      await refetchCircuit();
      await refetchSteps();
      await refetchStatuses();
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  // Handle successful operations
  const handleOperationSuccess = () => {
    handleRefreshData();
  };

  // Handler logic for add/edit/delete
  const handleAddStatus = () => {
    if (circuit?.isActive) return; // Don't allow adding statuses if circuit is active
    setSelectedStatus(null);
    setFormDialogOpen(true);
  };

  const handleEditStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return; // Don't allow editing statuses if circuit is active
    setSelectedStatus(status);
    setFormDialogOpen(true);
  };

  const handleDeleteStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return; // Don't allow deleting statuses if circuit is active
    setSelectedStatus(status);
    setDeleteDialogOpen(true);
  };

  const isLoading = isCircuitLoading || isStepsLoading || isStatusesLoading;
  const isError = isCircuitError || isStepsError || isStatusesError;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-900/30 rounded w-1/3"></div>
          <div className="h-4 bg-blue-900/30 rounded w-1/4"></div>
          <div className="h-64 bg-blue-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <StepStatusesNotFound circuitId={circuitId} type="error" apiError={apiError} />
    );
  }

  if (!circuit || !currentStep) {
    return (
      <StepStatusesNotFound circuitId={circuitId} type="notFound" />
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 overflow-x-hidden">
      <div className="flex justify-between items-start">
        <StepStatusesHeader
          circuitId={circuitId!}
          circuitTitle={circuit.title}
          stepTitle={currentStep.title}
          circuitDetailKey={currentStep.circuitDetailKey}
          isCircuitActive={circuit.isActive}
        />
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            className="border-blue-700/50 hover:bg-blue-900/20"
          >
            Refresh
          </Button>
          
          {!isSimpleUser && (
            circuit.isActive ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="bg-blue-500/50 text-blue-200 cursor-not-allowed"
                      disabled>
                      <Plus className="mr-2 h-4 w-4" /> Add Status
                      <AlertCircle className="ml-2 h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cannot add statuses to active circuit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      onClick={handleAddStatus}>
                <Plus className="mr-2 h-4 w-4" /> Add Status
              </Button>
            )
          )}
        </div>
      </div>
      <StepStatusesTableContent
        statuses={statuses}
        onEdit={handleEditStatus}
        onDelete={handleDeleteStatus}
        isSimpleUser={isSimpleUser}
        apiError={apiError}
        isCircuitActive={circuit.isActive}
      />
      <StepStatusesModals
        isSimpleUser={isSimpleUser}
        formDialogOpen={formDialogOpen}
        setFormDialogOpen={setFormDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        selectedStatus={selectedStatus}
        onSuccess={handleOperationSuccess}
        stepId={Number(stepId)}
      />
    </div>
  );
}
