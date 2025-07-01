import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { showErpError, extractErpError } from '@/utils/erpErrorHandling';

interface ErpOperationResult {
  success: boolean;
  value?: string;
  message?: string;
  errorDetails?: string;
  errorType?: string;
  statusCode?: number;
}

interface DocumentErpStatus {
  isArchived: boolean;
  erpDocumentCode?: string;
  hasLines: boolean;
  linesInErp: number;
  totalLines: number;
}

export const useDocumentErpOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const archiveDocumentToErp = useCallback(async (documentId: number, documentKey: string): Promise<ErpOperationResult> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/Documents/${documentId}/archive-to-erp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Document ${documentKey} successfully archived to ERP`, {
          description: `ERP Document Code: ${result.erpDocumentCode}`
        });
        
        return {
          success: true,
          value: result.erpDocumentCode,
          message: result.message
        };
      } else {
        // Enhanced error handling using shared utility
        showErpError(result, 'document archival', { showActions: true });
        
        return {
          success: false,
          message: result.message || 'Failed to archive document to ERP',
          errorDetails: result.errorDetails,
          errorType: result.errorType,
          statusCode: result.statusCode
        };
      }
    } catch (error) {
      console.error('Error archiving document to ERP:', error);
      
      const erpError = extractErpError(error, 'document archival');
      showErpError(erpError, 'document archival');
      
      return {
        success: false,
        message: erpError.message || 'Failed to archive document to ERP',
        errorType: erpError.errorType
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDocumentLinesInErp = useCallback(async (documentId: number, documentKey: string): Promise<ErpOperationResult> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/Documents/${documentId}/create-lines-in-erp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        const { totalLines, createdLines, lines } = result;
        
        toast.success(`Document ${documentKey} lines processed in ERP`, {
          description: `${createdLines}/${totalLines} lines successfully created`
        });
        
        return {
          success: true,
          value: `${createdLines}/${totalLines}`,
          message: result.message
        };
      } else {
        // Enhanced error handling using shared utility
        showErpError(result, 'document line creation', { showActions: true });
        
        return {
          success: false,
          message: result.message || 'Failed to create document lines in ERP',
          errorDetails: result.errorDetails,
          errorType: result.errorType,
          statusCode: result.statusCode
        };
      }
    } catch (error) {
      console.error('Error creating document lines in ERP:', error);
      
      const erpError = extractErpError(error, 'document line creation');
      showErpError(erpError, 'document line creation');
      
      return {
        success: false,
        message: erpError.message || 'Failed to create document lines in ERP',
        errorType: erpError.errorType
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkDocumentErpStatus = useCallback(async (documentId: number): Promise<DocumentErpStatus | null> => {
    try {
      const response = await fetch(`/api/Documents/check-erp-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([documentId])
      });

      if (response.ok) {
        const result = await response.json();
        const document = result.documents?.[0];
        
        if (document) {
          return {
            isArchived: document.isErpArchived,
            erpDocumentCode: document.erpDocumentCode,
            hasLines: false, // This would need additional endpoint to check lines
            linesInErp: 0,
            totalLines: 0
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking document ERP status:', error);
      return null;
    }
  }, []);

  return {
    archiveDocumentToErp,
    createDocumentLinesInErp,
    checkDocumentErpStatus,
    isLoading
  };
}; 