import { useState } from 'react';
import api from '@/services/api';
import { DocumentWorkflowStatus, MoveToStatusRequest } from '@/models/documentCircuit';

/**
 * Hook for managing circuit workflow operations
 */
export function useCircuitWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get the current workflow status for a document
   */
  const getWorkflowStatus = async (documentId: number): Promise<DocumentWorkflowStatus> => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching workflow status for document ${documentId}`);
      const response = await api.get(`/Workflow/document/${documentId}/workflow-status`);
      console.log('Workflow status response:', response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Failed to get workflow status';
      console.error('Error fetching workflow status:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get available transitions for a document
   */
  const getAvailableTransitions = async (documentId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching available transitions for document ${documentId}`);
      const response = await api.get(`/Workflow/document/${documentId}/available-transitions`);
      console.log('Available transitions response:', response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Failed to get available transitions';
      console.error('Error fetching available transitions:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Move a document to a new status
   */
  const moveToStatus = async (request: MoveToStatusRequest) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Moving document to status with request:', request);
      const response = await api.post('/Workflow/move-to-status', {
        documentId: request.documentId,
        targetStatusId: request.targetStatusId,
        comments: request.comments
      });
      
      console.log('Move to status response:', response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Failed to change document status';
      console.error('Error moving to status:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getWorkflowStatus,
    getAvailableTransitions,
    moveToStatus
  };
} 