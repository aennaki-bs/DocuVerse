
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import { Document, DocumentType, UpdateDocumentRequest } from '@/models/document';
import DocumentEditHeader from '@/components/document/edit/DocumentEditHeader';
import DocumentEditForm from '@/components/document/edit/DocumentEditForm';

const EditDocument = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error('Invalid document ID');
      navigate('/documents');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [documentData, typesData] = await Promise.all([
          documentService.getDocumentById(Number(id)),
          documentService.getAllDocumentTypes()
        ]);
        
        setDocument(documentData);
        setDocumentTypes(typesData);
      } catch (error) {
        console.error(`Failed to fetch document data:`, error);
        toast.error('Failed to load document data');
        navigate('/documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (documentData: UpdateDocumentRequest) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      console.log('Updating document with data:', documentData);
      
      await documentService.updateDocument(Number(id), documentData);
      toast.success('Document updated successfully');
      navigate(`/documents/${id}`);
    } catch (error) {
      console.error('Failed to update document:', error);
      toast.error('Failed to update document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/documents/${id}`);
  };

  const handleDocumentFlow = () => {
    if (id) {
      navigate(`/documents/${id}/flow`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <DocumentEditHeader 
        document={document}
        documentId={id || ''}
        onBack={handleBack}
        onDocumentFlow={handleDocumentFlow}
      />

      <DocumentEditForm
        document={document}
        documentTypes={documentTypes}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={handleBack}
      />
    </div>
  );
};

export default EditDocument;
