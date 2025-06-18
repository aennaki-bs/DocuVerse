import api from './api/index';
import { DocumentType } from '../models/document';
import { DocumentTypeUpdateRequest } from '../models/documentType';
import { toast } from 'sonner';

const documentTypeService = {
  getAllDocumentTypes: async (): Promise<DocumentType[]> => {
    try {
      console.log('Calling API to get document types');
      const response = await api.get('/Documents/Types');
      console.log('API response for document types:', response);
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Ensure all document types have an id property and valid data
          const types = response.data.map(type => ({
            ...type,
            id: type.id || null,
            typeName: type.typeName || 'Unnamed Type',
            typeKey: type.typeKey || ''
          }));
          
          console.log('Processed document types:', types);
          return types;
        } else if (typeof response.data === 'object') {
          // Handle case where response might be wrapped in another object
          console.log('Response is an object, trying to extract array');
          
          // Try to find an array property in the response
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            const types = possibleArrays[0].map(type => ({
              ...type,
              id: type.id || null,
              typeName: type.typeName || 'Unnamed Type',
              typeKey: type.typeKey || ''
            }));

            console.log('Extracted document types from object:', types);
            return types;
          }
        }
        
        // If we get here, the response format is unexpected
        console.error('Invalid document types response format:', response.data);
        toast.error('Invalid response format from server');
        return [];
      } else {
        console.error('Empty response data for document types');
        return [];
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
      // Check if it's a network error
      if (error.message === 'Network Error') {
        toast.error('Network error: Cannot connect to the server');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else {
        toast.error('Failed to fetch document types');
      }
      throw error;
    }
  },

  getDocumentType: async (id: number): Promise<DocumentType> => {
    try {
      const response = await api.get(`/Documents/Types/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document type with ID ${id}:`, error);
      throw error;
    }
  },

  createDocumentType: async (documentType: Partial<DocumentType>): Promise<void> => {
    try {
      await api.post('/Documents/Types', documentType);
    } catch (error) {
      console.error('Error creating document type:', error);
      throw error;
    }
  },

  updateDocumentType: async (id: number, documentType: DocumentTypeUpdateRequest): Promise<void> => {
    try {
      await api.put(`/Documents/Types/${id}`, documentType);
    } catch (error) {
      console.error(`Error updating document type with ID ${id}:`, error);
      throw error;
    }
  },

  validateTypeName: async (typeName: string): Promise<boolean> => {
    try {
      const response = await api.post('/Documents/valide-type', { typeName });
      return response.data === "True";
    } catch (error) {
      console.error('Error validating type name:', error);
      throw error;
    }
  },

  validateTypeCode: async (typeKey: string): Promise<boolean> => {
    try {
      // If API endpoint exists, use it
      // const response = await api.post('/Documents/valide-typekey', { typeKey });
      // return response.data === "True";
      
      // For now, we're implementing client-side validation
      // First check if code is 2-3 characters
      if (typeKey.length < 2 || typeKey.length > 3) {
        return false;
      }
      
      // Then check if code already exists
      const types = await documentTypeService.getAllDocumentTypes();
      return !types.some(type => type.typeKey === typeKey);
    } catch (error) {
      console.error('Error validating type code:', error);
      throw error;
    }
  },

  deleteDocumentType: async (id: number): Promise<void> => {
    try {
      const response = await api.delete(`/Documents/Types/${id}`);
      
      // Show appropriate success message based on response
      if (response.data && typeof response.data === 'string') {
        if (response.data.includes('associated series')) {
          toast.success(response.data);
        } else {
          toast.success('Document type deleted successfully');
        }
      } else {
        toast.success('Document type deleted successfully');
      }
    } catch (error) {
      console.error(`Error deleting document type with ID ${id}:`, error);
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          toast.error(error.response.data);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to delete document type');
        }
      } else {
        toast.error('Failed to delete document type');
      }
      
      throw error;
    }
  },
  
  deleteMultipleDocumentTypes: async (ids: number[]): Promise<void> => {
    try {
      // Use the new bulk delete endpoint that handles cascade deletion
      const response = await api.post('/Documents/Types/bulk-delete', ids);
      
      // Handle the response and show appropriate messages
      if (response.data.successful?.length > 0) {
        const successfulDeletes = response.data.successful;
        const totalSeries = successfulDeletes.reduce((sum, item) => sum + (item.deletedSeries || 0), 0);
        
        if (totalSeries > 0) {
          toast.success(`Successfully deleted ${successfulDeletes.length} document types and ${totalSeries} associated series`);
        } else {
          toast.success(`Successfully deleted ${successfulDeletes.length} document types`);
        }
      }
      
      // Handle partial failures
      if (response.data.failed?.length > 0) {
        const failures = response.data.failed;
        console.warn('Some deletions failed:', failures);
        
        // Show specific error messages
        failures.forEach(failure => {
          toast.error(`Failed to delete ${failure.name || `ID ${failure.id}`}: ${failure.error}`);
        });
      }
      
    } catch (error) {
      console.error('Error deleting multiple document types:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete document types');
      }
      
      throw error;
    }
  },

  // Generate a unique type code
  generateTypeCode: async (typeName: string): Promise<string> => {
    try {
      // Extract initials from type name (first 2-3 characters)
      let code = '';
      if (typeName) {
        const words = typeName.split(' ');
        if (words.length > 1) {
          // If multiple words, use first letters of first 2-3 words
          code = words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
        } else {
          // If single word, use first 2-3 letters
          code = typeName.substring(0, 3).toUpperCase();
        }
      }
      
      // Ensure code is 2-3 characters
      if (code.length < 2) {
        // Pad with 'X' if too short
        code = code.padEnd(2, 'X');
      } else if (code.length > 3) {
        // Truncate if too long
        code = code.substring(0, 3);
      }
      
      // Ensure code is unique
      const types = await documentTypeService.getAllDocumentTypes();
      if (types.some(type => type.typeKey === code)) {
        // If code already exists, append a number
        let counter = 1;
        let newCode = code;
        while (types.some(type => type.typeKey === newCode) && counter < 100) {
          newCode = code.substring(0, 2) + counter;
          counter++;
        }
        code = newCode;
      }
      
      return code;
    } catch (error) {
      console.error('Error generating type code:', error);
      throw error;
    }
  }
};

export default documentTypeService;
