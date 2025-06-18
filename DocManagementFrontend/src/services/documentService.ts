import { Document, DocumentType, CreateDocumentRequest, UpdateDocumentRequest } from "@/models/document";
import { documentService, ligneService, sousLigneService } from './documents';
import { DocumentTypeUpdateRequest } from '@/models/documentType';
import documentTypeService from './documentTypeService';

// Re-export all services as properties of a single object for backward compatibility
const combinedDocumentService = {
  // Document methods
  getAllDocuments: documentService.getAllDocuments,
  getMyDocuments: documentService.getMyDocuments,
  getDocumentById: documentService.getDocumentById,
  getRecentDocuments: documentService.getRecentDocuments,
  createDocument: documentService.createDocument,
  updateDocument: documentService.updateDocument,
  deleteDocument: documentService.deleteDocument,
  deleteMultipleDocuments: documentService.deleteMultipleDocuments,

  // Document Types methods
  getAllDocumentTypes: documentTypeService.getAllDocumentTypes,
  getDocumentType: documentTypeService.getDocumentType,
  createDocumentType: documentTypeService.createDocumentType,
  updateDocumentType: async (id: number, documentType: DocumentTypeUpdateRequest): Promise<void> => {
    try {
      await documentTypeService.updateDocumentType(id, documentType);
    } catch (error) {
      console.error(`Error updating document type with ID ${id}:`, error);
      throw error;
    }
  },
  validateTypeName: documentTypeService.validateTypeName,
  deleteDocumentType: documentTypeService.deleteDocumentType,
  deleteMultipleDocumentTypes: documentTypeService.deleteMultipleDocumentTypes,
  validateTypeCode: documentTypeService.validateTypeCode,
  generateTypeCode: documentTypeService.generateTypeCode,

  // Ligne methods
  getAllLignes: ligneService.getAllLignes,
  getLigneById: ligneService.getLigneById,
  getLignesByDocumentId: ligneService.getLignesByDocumentId,
  createLigne: ligneService.createLigne,
  updateLigne: ligneService.updateLigne,
  deleteLigne: ligneService.deleteLigne,

  // SousLigne methods
  getAllSousLignes: sousLigneService.getAllSousLignes,
  getSousLigneById: sousLigneService.getSousLigneById,
  getSousLignesByLigneId: sousLigneService.getSousLignesByLigneId,
  getSousLignesByDocumentId: sousLigneService.getSousLignesByDocumentId,
  createSousLigne: sousLigneService.createSousLigne,
  updateSousLigne: sousLigneService.updateSousLigne,
  deleteSousLigne: sousLigneService.deleteSousLigne,
};

export default combinedDocumentService;
