
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';
import stepService from '@/services/stepService';

export function useCircuitSteps(circuitId: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [apiError, setApiError] = useState('');
  
  // Fetch the circuit
  const {
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    error: circuitError
  } = useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to load circuit';
          setApiError(errorMessage);
        }
      }
    }
  });
  
  // Fetch the steps for this circuit
  const {
    data: circuitSteps = [],
    isLoading: isStepsLoading,
    isError: isStepsError,
    error: stepsError,
    refetch: refetchSteps
  } = useQuery({
    queryKey: ['circuit-steps', circuitId],
    queryFn: () => {
      if (circuitId) {
        return stepService.getStepsByCircuitId(Number(circuitId));
      }
      return Promise.resolve([]);
    },
    enabled: !!circuitId && !isCircuitError,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to load steps';
          setApiError(errorMessage);
        }
      }
    }
  });
  
  // Filter steps based on search query
  const steps = circuitSteps?.filter(step => {
    if (!searchQuery) return true;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      step.title.toLowerCase().includes(lowerCaseQuery) ||
      step.descriptif?.toLowerCase().includes(lowerCaseQuery) ||
      step.stepKey.toLowerCase().includes(lowerCaseQuery)
    );
  }) || [];
  
  // Reset selections when changing circuits
  useEffect(() => {
    setSelectedSteps([]);
  }, [circuitId]);
  
  // Handle step selection
  const handleStepSelection = (id: number, checked: boolean) => {
    setSelectedSteps(prev => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter(stepId => stepId !== id);
      }
    });
  };
  
  // Handle select all steps
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allStepIds = steps.map(step => step.id);
      setSelectedSteps(allStepIds);
    } else {
      setSelectedSteps([]);
    }
  };
  
  const isLoading = isCircuitLoading || isStepsLoading;
  const isError = isCircuitError || isStepsError;
  
  return {
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
  };
}
