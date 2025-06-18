import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { StepFormDialog } from '@/components/transitions/StepFormDialog';
import { DeleteStepDialog } from '@/components/transitions/DeleteStepDialog';
import { StepsTable } from '@/components/transitions/StepsTable';
import { StepsFlow } from '@/components/transitions/StepsFlow';
import { DocumentStatus } from '@/models/documentCircuit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, List } from 'lucide-react';

// Define Step interface based on backend StepDto
interface Step {
  id: number;
  stepKey: string;
  circuitId: number;
  title: string;
  descriptif: string;
  currentStatusId: number;
  currentStatusTitle: string;
  nextStatusId: number;
  nextStatusTitle: string;
}

export default function CircuitStatusStepsPage() {
  const { circuitId = '' } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [statusOptions, setStatusOptions] = useState<DocumentStatus[]>([]);
  const [activeTab, setActiveTab] = useState('table');
  
  // Fetch the circuit details
  const { 
    data: circuit,
    isLoading: isCircuitLoading,
    error: circuitError
  } = useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: async () => {
      const response = await api.get(`/Circuit/${circuitId}`);
      return response.data;
    },
    enabled: !!circuitId
  });
  
  // Use React Query to fetch steps from the circuit data
  const {
    data: steps = [],
    isLoading: isStepsLoading,
    error: stepsError,
    refetch: refetchSteps
  } = useQuery({
    queryKey: ['circuit-steps', circuitId],
    queryFn: async () => {
      try {
        // The steps are already included in the circuit data
        const response = await api.get(`/Circuit/${circuitId}`);
        return response.data.steps || [];
      } catch (error) {
        console.error("Error fetching steps:", error);
        return [];
      }
    },
    enabled: !!circuitId
  });

  // Fetch available statuses for this circuit
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await api.get(`/Status/circuit/${circuitId}`);
        setStatusOptions(response.data);
      } catch (error) {
        console.error('Error fetching statuses:', error);
        toast.error('Failed to load statuses');
      }
    };

    if (circuitId) {
      fetchStatuses();
    }
  }, [circuitId]);

  const handleAddStep = () => {
    if (circuit?.isActive) {
      toast.error("Cannot add steps to an active circuit");
      return;
    }
    setSelectedStep(null);
    setFormDialogOpen(true);
  };

  const handleEditStep = (step: Step) => {
    if (circuit?.isActive) {
      toast.error("Cannot edit steps in an active circuit");
      return;
    }
    setSelectedStep(step);
    setFormDialogOpen(true);
  };

  const handleDeleteStep = (step: Step) => {
    if (circuit?.isActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }
    setSelectedStep(step);
    setDeleteDialogOpen(true);
  };

  const isLoading = isCircuitLoading || isStepsLoading;
  const error = circuitError || stepsError;

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !circuit) {
    return (
      <div className="container py-8">
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
          <p className="text-red-600">Failed to load circuit data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="container py-8">
        <div className="p-4 border border-amber-300 bg-amber-50 rounded-md">
          <h3 className="text-lg font-semibold text-amber-800">Circuit Not Found</h3>
          <p className="text-amber-600">The requested circuit could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid responsive-padding space-y-6">
      <PageHeader
        title={`Circuit Steps for Circuit: ${circuit.title}`}
        description="Configure the steps between different statuses in the circuit workflow."
        actions={
          !isSimpleUser && (
            <Button 
              onClick={handleAddStep}
              disabled={circuit.isActive}
            >
              Add Step
            </Button>
          )
        }
      />
      
      {/* Show warning if circuit is active */}
      {circuit.isActive && (
        <div className="p-4 border border-amber-300 bg-amber-50 rounded-md">
          <h3 className="text-amber-800 font-semibold">Note</h3>
          <p className="text-amber-700">This circuit is active. Steps cannot be modified.</p>
        </div>
      )}
      
      {/* Development Notice - Show only if API error occurs */}
      {stepsError && (
        <div className="p-4 border border-blue-300 bg-blue-50 rounded-md">
          <h3 className="text-blue-800 font-semibold">Development Notice</h3>
          <p className="text-blue-700">
            There was an error loading the steps. 
            This could be because the API is still being developed.
          </p>
        </div>
      )}
      
      <Tabs defaultValue="table" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Flow View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="mt-4">
          <StepsTable
            steps={steps || []}
            onEdit={handleEditStep}
            onDelete={handleDeleteStep}
            isSimpleUser={isSimpleUser}
            circuitIsActive={circuit.isActive}
          />
        </TabsContent>
        
        <TabsContent value="flow" className="mt-4">
          <StepsFlow 
            steps={steps || []} 
            statuses={statusOptions}
          />
        </TabsContent>
      </Tabs>
      
      {/* Step Form Dialog */}
      <StepFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={() => refetchSteps()}
        step={selectedStep}
        circuitId={parseInt(circuitId, 10)}
        statusOptions={statusOptions}
      />
      
      {/* Delete Step Dialog */}
      {selectedStep && (
        <DeleteStepDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          stepId={selectedStep.id}
          currentStatus={selectedStep.currentStatusTitle}
          nextStatus={selectedStep.nextStatusTitle}
          onSuccess={() => refetchSteps()}
        />
      )}
    </div>
  );
} 