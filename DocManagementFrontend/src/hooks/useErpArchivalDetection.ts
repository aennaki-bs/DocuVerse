import { useCallback } from 'react';
import { toast } from 'sonner';
import documentService from '@/services/documentService';

/**
 * Custom hook for detecting ERP archival completion
 * Polls the document to check if ERP archival has completed and triggers a callback when it does
 */
export function useErpArchivalDetection() {
  
  const checkErpArchivalStatus = useCallback(async (
    documentId: number,
    initialDocument: any,
    onArchivalComplete: () => void,
    options: {
      maxAttempts?: number;
      pollIntervalMs?: number;
      showSuccessToast?: boolean;
    } = {}
  ) => {
    const {
      maxAttempts = 12, // Default: Check for 1 minute (5 seconds × 12)
      pollIntervalMs = 5000, // Default: Check every 5 seconds
      showSuccessToast = true
    } = options;

    if (!initialDocument || initialDocument.erpDocumentCode) {
      // Document already archived or doesn't exist, no need to check
      return;
    }

    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const updatedDocument = await documentService.getDocumentById(documentId);
        
        if (updatedDocument.erpDocumentCode) {
          // ERP archival completed
          clearInterval(pollInterval);
          
          if (showSuccessToast) {
            toast.success(`Document archived to ERP with code: ${updatedDocument.erpDocumentCode}`);
          }
          
          // Trigger the callback to refresh UI
          onArchivalComplete();
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Stop polling after max attempts
          clearInterval(pollInterval);
          console.log(`ERP archival detection stopped after ${maxAttempts} attempts for document ${documentId}`);
        }
      } catch (error) {
        // If error occurs, stop polling but don't show error to user
        clearInterval(pollInterval);
        console.error('Error checking ERP archival status:', error);
      }
    }, pollIntervalMs);

    // Return a cleanup function to stop polling if needed
    return () => clearInterval(pollInterval);
  }, []);

  /**
   * Start monitoring for ERP archival with default settings
   */
  const startErpArchivalMonitoring = useCallback((
    documentId: number,
    initialDocument: any,
    onArchivalComplete: () => void
  ) => {
    return checkErpArchivalStatus(documentId, initialDocument, onArchivalComplete);
  }, [checkErpArchivalStatus]);

  /**
   * Start monitoring for ERP archival with custom options
   */
  const startErpArchivalMonitoringCustom = useCallback((
    documentId: number,
    initialDocument: any,
    onArchivalComplete: () => void,
    options: {
      maxAttempts?: number;
      pollIntervalMs?: number;
      showSuccessToast?: boolean;
    }
  ) => {
    return checkErpArchivalStatus(documentId, initialDocument, onArchivalComplete, options);
  }, [checkErpArchivalStatus]);

  return {
    startErpArchivalMonitoring,
    startErpArchivalMonitoringCustom,
    checkErpArchivalStatus
  };
} 