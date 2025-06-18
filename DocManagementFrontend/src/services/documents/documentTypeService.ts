
import api from '../api';
import { DocumentType } from '../../models/document';
import { DocumentTypeUpdateRequest } from '../../models/documentType';

const documentTypeService = {
  getAllDocumentTypes: async (): Promise<DocumentType[]> => {
    try {
      const response = await api.get('/Documents/Types');
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
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

  deleteDocumentType: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Documents/Types/${id}`);
    } catch (error) {
      console.error(`Error deleting document type with ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteMultipleDocumentTypes: async (ids: number[]): Promise<void> => {
    try {
      // Since the API doesn't support bulk deletion, we'll delete one by one
      await Promise.all(ids.map(id => api.delete(`/Documents/Types/${id}`)));
    } catch (error) {
      console.error('Error deleting multiple document types:', error);
      throw error;
    }
  },
};

export default documentTypeService;
