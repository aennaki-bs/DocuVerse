
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Lock, X, AlertTriangle } from 'lucide-react';
import circuitService from '@/services/circuitService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CircuitDetailsList from './CircuitDetailsList';
import CreateCircuitDetailDialog from './CreateCircuitDetailDialog';
import { useAuth } from '@/context/AuthContext';

interface CircuitDetailsDialogProps {
  circuit: Circuit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CircuitDetailsDialog({
  circuit,
  open,
  onOpenChange,
}: CircuitDetailsDialogProps) {
  const [createDetailDialogOpen, setCreateDetailDialogOpen] = useState(false);
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';
  
  const { 
    data: circuitDetails,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['circuit-details', circuit.id],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(circuit.id),
    enabled: open,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          console.error('Failed to load circuit details:', err);
          toast.error('Failed to load circuit details. Please try again.');
        }
      }
    }
  });

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Prevent SimpleUsers from accessing the create dialog
  const handleAddStep = () => {
    if (isSimpleUser) {
      toast.error('You do not have permission to add circuit steps');
      return;
    }
    setCreateDetailDialogOpen(true);
  };

  const handleRetryLoad = () => {
    refetch();
    toast.info('Retrying to load circuit details...');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-hideden">
        <div className='w-full flex justify-between items-center mb-4'>
      <br />
        </div>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Circuit Details: {circuit.title}</span>
            {!isSimpleUser ? (
              <Button onClick={handleAddStep} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Step
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-2" /> 
                  <span>View-only access</span>
                </div>

              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-4">
            <Alert variant="destructive" className="mb-4 border-red-800 bg-red-950/50 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex flex-col space-y-2">
                <span>Error loading circuit details</span>
                <span className="text-xs opacity-80">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full border-red-700 hover:bg-red-900/20"
                  onClick={handleRetryLoad}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <CircuitDetailsList 
            circuitDetails={circuitDetails || []} 
            onUpdate={refetch}
          />
        )}
        
        {/* Create Circuit Detail Dialog - Only render if not SimpleUser */}
        {!isSimpleUser && (
          <CreateCircuitDetailDialog
            circuitId={circuit.id}
            open={createDetailDialogOpen}
            onOpenChange={setCreateDetailDialogOpen}
            onSuccess={() => {
              refetch();
              toast.success("Circuit step added successfully");
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
