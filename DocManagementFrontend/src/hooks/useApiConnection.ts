import { useState, useEffect, useCallback } from 'react';
import { getCachedConnectionStatus } from '@/services/api/connectionCheck';

interface UseApiConnectionOptions {
  checkOnMount?: boolean;
  retryInterval?: number;
  maxRetries?: number;
}

export function useApiConnection(options: UseApiConnectionOptions = {}) {
  const { 
    checkOnMount = true, 
    retryInterval = 60000, // 60 seconds (increased from 30s)
    maxRetries = 2  // Reduced from 3
  } = options;
  
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  const checkConnection = useCallback(async () => {
    if (isChecking) return;
    
    try {
      setIsChecking(true);
      setError(null);
      
      // Use the cached connection status to prevent excessive checks
      const connectionAvailable = await getCachedConnectionStatus();
      setIsAvailable(connectionAvailable);
      
      if (connectionAvailable) {
        // Reset retry count on success
        setRetryCount(0);
      } else {
        setError(new Error('API is currently unavailable'));
      }
    } catch (err) {
      console.error('Error checking API connection:', err);
      setIsAvailable(false);
      setError(err instanceof Error ? err : new Error('Unknown error checking API connection'));
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);
  
  // Function to retry connection check
  const retryConnectionCheck = useCallback(async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      await checkConnection();
    }
  }, [checkConnection, maxRetries, retryCount]);
  
  // Check connection on mount if specified, but only once
  useEffect(() => {
    let isMounted = true;
    
    if (checkOnMount) {
      // Add a small delay to prevent immediate check on mount
      const timer = setTimeout(() => {
        if (isMounted) {
          checkConnection();
        }
      }, 1000);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [checkOnMount, checkConnection]);
  
  // Set up automatic retries if connection fails, but with exponential backoff
  useEffect(() => {
    let retryTimer: number | undefined;
    
    if (isAvailable === false && retryCount < maxRetries) {
      // Use exponential backoff for retries (retryInterval * 2^retryCount)
      const backoffTime = retryInterval * Math.pow(2, retryCount);
      
      retryTimer = window.setTimeout(() => {
        retryConnectionCheck();
      }, backoffTime);
    }
    
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [isAvailable, retryCount, maxRetries, retryInterval, retryConnectionCheck]);
  
  return {
    isAvailable,
    isChecking,
    error,
    checkConnection,
    retryConnectionCheck,
    retryCount
  };
}

export default useApiConnection; 