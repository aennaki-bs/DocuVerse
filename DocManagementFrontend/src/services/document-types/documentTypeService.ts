
import api from '../api';
import { DocumentType } from '@/models/document';

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
  
  getDocumentType: async (id: number): Promise<DocumentType> => {
    try {
      const response = await api.get(`/Documents/Types/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // More methods can be added as needed
};

export default documentTypeService;
