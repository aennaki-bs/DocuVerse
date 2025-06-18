
import { toast } from "sonner";
import { DocumentTypeUpdateRequest } from "@/models/documentType";
import documentService from "@/services/documentService";

export const handleEdit = async (id: string, data: DocumentTypeUpdateRequest) => {
  let loading = true;
  try {
    await documentService.updateDocumentType(parseInt(id), data);
    toast.success('Document type updated successfully');
    return true;
  } catch (error: any) {
    console.error('Failed to update document type:', error);
    
    // Extract specific error message if available
    let errorMessage = 'Failed to update document type';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.errors) {
        // Handle validation errors array
        if (Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join('. ');
        } else if (typeof error.response.data.errors === 'object') {
          // Handle validation errors object
          errorMessage = Object.values(error.response.data.errors).flat().join('. ');
        }
      }
    } else if (error.message) {
      // If no response data but there's an error message
      errorMessage = error.message;
    }
    
    toast.error(`Update failed: ${errorMessage}`);
    return false;
  } finally {
    loading = false;
  }
};
