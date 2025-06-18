import api from './core';

// Simple method to test if API is available
// Try to make a basic request to the server without causing infinite loops
export const checkApiConnection = async () => {
  try {
    // Use a simple HEAD request with a short timeout
    // This is much lighter than OPTIONS or GET
    await api.head('/', { 
      timeout: 2000,
      // Don't throw for 404 errors - we just want to check if the server responds at all
      validateStatus: (status) => status < 500
    });
    return true;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

// Add a simple cache to prevent repeated checks
let connectionCache = {
  isAvailable: null as boolean | null,
  lastChecked: 0,
  expiryTime: 30000 // 30 seconds
};

// Use this method to check connection with caching
export const getCachedConnectionStatus = async () => {
  const now = Date.now();
  
  // If we have a recent check result, use it
  if (connectionCache.lastChecked > 0 && 
      now - connectionCache.lastChecked < connectionCache.expiryTime) {
    return connectionCache.isAvailable;
  }
  
  // Otherwise do a fresh check
  try {
    const isAvailable = await checkApiConnection();
    connectionCache = {
      isAvailable,
      lastChecked: now,
      expiryTime: isAvailable ? 60000 : 30000 // Cache longer if available
    };
    return isAvailable;
  } catch (error) {
    connectionCache.isAvailable = false;
    connectionCache.lastChecked = now;
    return false;
  }
};
