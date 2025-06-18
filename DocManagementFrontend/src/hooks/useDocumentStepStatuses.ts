import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';

export interface DocumentStepStatus {
  stepId: number;
  stepKey: string;
  title: string;
  description: string;
  currentStatusId: number;
  currentStatusTitle: string;
  nextStatusId: number;
  nextStatusTitle: string;
  isCurrentStep: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export function useDocumentStepStatuses(documentId: number) {
  const { 
    data: stepStatuses,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['document-step-statuses', documentId],
    queryFn: () => circuitService.getDocumentStepStatuses(documentId),
    enabled: !!documentId,
  });

  return {
    stepStatuses,
    isLoading,
    isError,
    error,
    refetch
  };
} 