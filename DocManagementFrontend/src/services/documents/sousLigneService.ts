
import api from '../api';
import { SousLigne, CreateSousLigneRequest, UpdateSousLigneRequest } from '../../models/document';

const sousLigneService = {
  getAllSousLignes: async (): Promise<SousLigne[]> => {
    try {
      const response = await api.get('/SousLignes');
      return response.data;
    } catch (error) {
      console.error('Error fetching sousLignes:', error);
      throw error;
    }
  },

  getSousLigneById: async (id: number): Promise<SousLigne> => {
    try {
      const response = await api.get(`/SousLignes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sousLigne with ID ${id}:`, error);
      throw error;
    }
  },

  getSousLignesByLigneId: async (ligneId: number): Promise<SousLigne[]> => {
    try {
      const response = await api.get(`/SousLignes/by_ligne/${ligneId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sousLignes for ligne ${ligneId}:`, error);
      throw error;
    }
  },

  getSousLignesByDocumentId: async (documentId: number): Promise<SousLigne[]> => {
    try {
      const response = await api.get(`/SousLignes/by_document/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sousLignes for document ${documentId}:`, error);
      throw error;
    }
  },

  createSousLigne: async (sousLigne: CreateSousLigneRequest): Promise<SousLigne> => {
    try {
      const response = await api.post('/SousLignes', sousLigne);
      return response.data;
    } catch (error) {
      console.error('Error creating sousLigne:', error);
      throw error;
    }
  },

  updateSousLigne: async (id: number, sousLigne: UpdateSousLigneRequest): Promise<void> => {
    try {
      await api.put(`/SousLignes/${id}`, sousLigne);
    } catch (error) {
      console.error(`Error updating sousLigne with ID ${id}:`, error);
      throw error;
    }
  },

  deleteSousLigne: async (id: number): Promise<void> => {
    try {
      await api.delete(`/SousLignes/${id}`);
    } catch (error) {
      console.error(`Error deleting sousLigne with ID ${id}:`, error);
      throw error;
    }
  },
};

export default sousLigneService;
