import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { showErpError, extractErpError, showNetworkError } from '@/utils/erpErrorHandling';

interface ErpOperationResult {
  success: boolean;
  erpLineCode?: string;
  message?: string;
  errorDetails?: string;
  errorType?: string;
  statusCode?: number;
}

interface ErpStatus {
  canAddToErp: boolean;
  reason: string;
  message: string;
  documentErpCode?: string;
  lineErpCode?: string;
  hasElement: boolean;
}

export const useLineErpOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addLineToErp = useCallback(async (ligneId: number, ligneTitle: string): Promise<ErpOperationResult> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/Lignes/${ligneId}/add-to-erp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Line "${ligneTitle}" successfully added to ERP`, {
          description: `ERP Line Code: ${result.erpLineCode}`
        });
        
        return {
          success: true,
          erpLineCode: result.erpLineCode,
          message: result.message
        };
      } else {
        // Enhanced error handling using shared utility
        showErpError(result, 'line creation', { showActions: true });
        
        return {
          success: false,
          message: result.message || 'Failed to add line to ERP',
          errorDetails: result.errorDetails,
          errorType: result.errorType,
          statusCode: result.statusCode
        };
      }
    } catch (error) {
      console.error('Error adding line to ERP:', error);
      
      const erpError = extractErpError(error, 'line creation');
      showErpError(erpError, 'line creation');
      
      return {
        success: false,
        message: erpError.message || 'Failed to add line to ERP',
        errorType: erpError.errorType
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkErpStatus = useCallback(async (ligneId: number): Promise<ErpStatus | null> => {
    try {
      const response = await fetch(`/api/Lignes/${ligneId}/can-add-to-erp`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to check ERP status');
        return null;
      }
    } catch (error) {
      console.error('Error checking ERP status:', error);
      return null;
    }
  }, []);

  return {
    addLineToErp,
    checkErpStatus,
    isLoading
  };
}; 