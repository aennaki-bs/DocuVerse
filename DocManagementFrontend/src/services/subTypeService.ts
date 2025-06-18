import api from './api/index';
import { SubType } from '../models/subtype';
import { toast } from 'sonner';

// Fallback subtypes for testing when API fails
const FALLBACK_SUBTYPES: Record<number, SubType[]> = {
  1: [ // For document type ID 1 (Invoice)
    { 
      id: 101, 
      name: "Standard Invoice", 
      subTypeKey: "SI",
      description: "Standard invoice for regular billing",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 1,
      isActive: true
    },
    { 
      id: 102, 
      name: "Tax Invoice", 
      subTypeKey: "TI",
      description: "Invoice with tax details included",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 1,
      isActive: true
    }
  ],
  2: [ // For document type ID 2 (Contract)
    { 
      id: 201, 
      name: "Employment Contract", 
      subTypeKey: "EC",
      description: "Contract for employment purposes",
      startDate: "2023-01-01", 
      endDate: "2024-12-31",
      documentTypeId: 2,
      isActive: true
    },
    { 
      id: 202, 
      name: "Service Agreement", 
      subTypeKey: "SA",
      description: "Agreement for service provision",
      startDate: "2023-01-01", 
      endDate: "2024-12-31",
      documentTypeId: 2,
      isActive: true
    }
  ],
  3: [ // For document type ID 3 (Report)
    { 
      id: 301, 
      name: "Monthly Report", 
      subTypeKey: "MR",
      description: "Regular monthly reporting document",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 3,
      isActive: true
    },
    { 
      id: 302, 
      name: "Annual Report", 
      subTypeKey: "AR",
      description: "Yearly comprehensive report",
      startDate: "2023-01-01", 
      endDate: "2023-12-31",
      documentTypeId: 3,
      isActive: true
    }
  ]
};

// Helper function to filter subtypes by date - moved outside of the subTypeService object
const filterSubtypesByDate = async (
  docTypeId: number, 
  date: Date, 
  getSubTypesByDocTypeFunc: (id: number) => Promise<SubType[]>
): Promise<SubType[]> => {
  try {
    // Get all subtypes for this document type
    const allSubtypes = await getSubTypesByDocTypeFunc(docTypeId);
    
    // Filter by date range
    return allSubtypes.filter(subtype => {
      const startDate = subtype.startDate ? new Date(subtype.startDate) : null;
      const endDate = subtype.endDate ? new Date(subtype.endDate) : null;
      
      if (!startDate || !endDate) return false;
      
      return date >= startDate && date <= endDate;
    });
  } catch (error) {
    console.error(`Error filtering subtypes locally for type ${docTypeId}:`, error);
    
    // Use fallback data as last resort
    const fallbackSubtypes = FALLBACK_SUBTYPES[docTypeId] || [];
    
    return fallbackSubtypes.filter(subtype => {
      const startDate = subtype.startDate ? new Date(subtype.startDate) : null;
      const endDate = subtype.endDate ? new Date(subtype.endDate) : null;
      
      if (!startDate || !endDate) return false;
      
      return date >= startDate && date <= endDate;
    });
  }
};

const subTypeService = {
  getAllSubTypes: async (): Promise<SubType[]> => {
    try {
      const response = await api.get('/Series');
      console.log('All subtypes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all subtypes:', error);
      
      // Create a flat array of all fallback subtypes
      const allFallbackSubtypes = Object.values(FALLBACK_SUBTYPES).flat();
      console.log('Using fallback subtypes:', allFallbackSubtypes);
      
      toast.error('Failed to fetch subtypes. Using test data.');
      return allFallbackSubtypes;
    }
  },

  getSubTypesByDocType: async (docTypeId: number): Promise<SubType[]> => {
    try {
      console.log(`Fetching subtypes for document type ID: ${docTypeId}`);
      const response = await api.get(`/Series/by-document-type/${docTypeId}`);
      console.log(`Subtypes for document type ${docTypeId}:`, response.data);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Invalid subtypes response format:', response.data);
        
        // Use fallback subtypes for this document type
        const fallbackForType = FALLBACK_SUBTYPES[docTypeId] || [];
        console.log(`Using fallback subtypes for type ${docTypeId}:`, fallbackForType);
        
        toast.warning('Invalid subtypes response. Using test data.');
        return fallbackForType;
      }
    } catch (error) {
      console.error(`Error fetching subtypes for document type ${docTypeId}:`, error);
      
      // Use fallback subtypes for this document type
      const fallbackForType = FALLBACK_SUBTYPES[docTypeId] || [];
      console.log(`Using fallback subtypes for type ${docTypeId} after error:`, fallbackForType);
      
      toast.error('Failed to fetch subtypes. Using test data.');
      return fallbackForType;
    }
  },

  getSubType: async (id: number): Promise<SubType> => {
    try {
      const response = await api.get(`/Series/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subtype with ID ${id}:`, error);
      throw error;
    }
  },

  getSubTypesForDate: async (docTypeId: number, date: Date | string): Promise<SubType[]> => {
    let formattedDate: string;
    if (date instanceof Date) {
      formattedDate = date.toISOString().split('T')[0]; // Ensure we just use the date part
    } else {
      // If it's already a string, make sure it's just the date part
      const dateObj = new Date(date);
      formattedDate = dateObj.toISOString().split('T')[0];
    }
    
    console.log(`SubTypeService: Fetching subtypes for docType ${docTypeId} and date ${formattedDate}`);
    
    try {
      const response = await api.get(`/Series/for-date/${docTypeId}/${formattedDate}`);
      
      if (response.data && Array.isArray(response.data)) {
        const activeSubTypes = response.data.filter(st => st.isActive);
        console.log(`SubTypeService: Found ${response.data.length} subtypes, ${activeSubTypes.length} active`);
        return activeSubTypes; // Only return active subtypes
      } else {
        console.error('Invalid subtypes for date response format:', response.data);
        
        // Fall back to filtering locally - only return active subtypes
        const allSubTypes = await filterSubtypesByDate(docTypeId, new Date(formattedDate), subTypeService.getSubTypesByDocType);
        const activeSubTypes = allSubTypes.filter(st => st.isActive);
        console.log(`SubTypeService (fallback): Found ${allSubTypes.length} subtypes, ${activeSubTypes.length} active`);
        return activeSubTypes;
      }
    } catch (error) {
      console.error(`Error fetching subtypes for document type ${docTypeId} and date ${formattedDate}:`, error);
      
      // Fall back to filtering locally - only return active subtypes
      const allSubTypes = await filterSubtypesByDate(docTypeId, new Date(formattedDate), subTypeService.getSubTypesByDocType);
      const activeSubTypes = allSubTypes.filter(st => st.isActive);
      console.log(`SubTypeService (error fallback): Found ${allSubTypes.length} subtypes, ${activeSubTypes.length} active`);
      return activeSubTypes;
    }
  },

  createSubType: async (subType: Partial<SubType>): Promise<void> => {
    try {
      await api.post('/Series', subType);
    } catch (error) {
      console.error('Error creating subtype:', error);
      throw error;
    }
  },

  updateSubType: async (id: number, subType: Partial<SubType>): Promise<void> => {
    try {
      await api.put(`/Series/${id}`, subType);
    } catch (error) {
      console.error(`Error updating subtype with ID ${id}:`, error);
      throw error;
    }
  },

  deleteSubType: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Series/${id}`);
    } catch (error) {
      console.error(`Error deleting subtype with ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteMultipleSubTypes: async (ids: number[]): Promise<void> => {
    try {
      // Since the API doesn't support bulk deletion, we'll delete one by one
      await Promise.all(ids.map(id => api.delete(`/Series/${id}`)));
    } catch (error) {
      console.error('Error deleting multiple subtypes:', error);
      throw error;
    }
  },

  checkOverlappingDateIntervals: async (docTypeId: number, startDate: string | Date, endDate: string | Date, currentSubTypeId?: number): Promise<{ overlapping: boolean; overlappingWith?: SubType }> => {
    try {
      // Convert dates to consistent format
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Get all subtypes for this document type
      const allSubtypes = await subTypeService.getSubTypesByDocType(docTypeId);
      
      // Find if any subtype date range overlaps with the given date range
      const overlappingSubType = allSubtypes.find(subtype => {
        // Skip the current subtype if we're editing (using its ID)
        if (currentSubTypeId && subtype.id === currentSubTypeId) {
          return false;
        }
        
        const subtypeStart = new Date(subtype.startDate);
        const subtypeEnd = new Date(subtype.endDate);
        
        // Check for overlap: 
        // (start1 <= end2) && (end1 >= start2)
        return (start <= subtypeEnd && end >= subtypeStart);
      });
      
      return {
        overlapping: !!overlappingSubType,
        overlappingWith: overlappingSubType
      };
    } catch (error) {
      console.error(`Error checking overlapping intervals for type ${docTypeId}:`, error);
      // Return no overlap in case of error to avoid blocking user flow
      // UI will show a warning that verification couldn't be completed
      return { overlapping: false };
    }
  },

  validatePrefix: async (prefix: string, documentTypeId: number, excludeId?: number): Promise<boolean> => {
    try {
      // If prefix is empty or null, it's valid (will be auto-generated)
      if (!prefix || prefix.trim().length === 0) {
        return true;
      }
      
      // If prefix is too short, it's invalid
      if (prefix.trim().length < 2) {
        return false;
      }
      
      const cleanPrefix = prefix.trim();
      const queryParams = new URLSearchParams({
        documentTypeId: documentTypeId.toString(),
        ...(excludeId && { excludeId: excludeId.toString() })
      });
      
      const response = await api.get(`/Series/validate-prefix/${encodeURIComponent(cleanPrefix)}?${queryParams}`);
      return response.data; // Returns true if unique (valid), false if already exists
    } catch (error) {
      console.error(`Error validating prefix "${prefix}" for document type ${documentTypeId}:`, error);
      // Return false to be safe - don't allow proceeding if validation fails
      return false;
    }
  }
};

export default subTypeService;
