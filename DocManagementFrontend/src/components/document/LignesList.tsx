
import { Document, Ligne } from '@/models/document';
import LignesListWrapper from './ligne/LignesListWrapper';

interface LignesListProps {
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const LignesList = ({ 
  document, 
  lignes, 
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}: LignesListProps) => {
  return (
    <LignesListWrapper
      document={document}
      lignes={lignes}
      canManageDocuments={canManageDocuments}
      isCreateDialogOpen={isCreateDialogOpen}
      setIsCreateDialogOpen={setIsCreateDialogOpen}
    />
  );
};

export default LignesList;
