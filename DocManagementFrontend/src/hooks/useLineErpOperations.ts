import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErpOperationResult {
  success: boolean;
  erpLineCode?: string;
  message?: string;
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
        toast.error('Failed to add line to ERP', {
          description: result.message || 'Unknown error occurred'
        });
        
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error adding line to ERP:', error);
      toast.error('Failed to add line to ERP', {
        description: 'Network error occurred'
      });
      
      return {
        success: false,
        message: 'Network error occurred'
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