import { useState } from 'react';
import { Document, Ligne } from '@/models/document';
import LigneItem from './LigneItem';
import LigneEmptyState from './LigneEmptyState';
import LigneSummaryFooter from './LigneSummaryFooter';
import CreateLigneDialog from './dialogs/CreateLigneDialog';
import EditLigneDialog from './dialogs/EditLigneDialog';
import DeleteLigneDialog from './dialogs/DeleteLigneDialog';

interface LignesListWrapperProps {
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const LignesListWrapper = ({ 
  document, 
  lignes, 
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}: LignesListWrapperProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedLigneId, setExpandedLigneId] = useState<number | null>(null);
  const [currentLigne, setCurrentLigne] = useState<Ligne | null>(null);

  const toggleLigneExpansion = (ligneId: number) => {
    setExpandedLigneId(expandedLigneId === ligneId ? null : ligneId);
  };

  const handleEditDialogOpen = (ligne: Ligne) => {
    setCurrentLigne(ligne);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (ligne: Ligne) => {
    setCurrentLigne(ligne);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="relative">
      {lignes.length === 0 ? (
        <LigneEmptyState 
          canManageDocuments={canManageDocuments}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <>
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-3">
              {lignes.map((ligne) => (
                <LigneItem 
                  key={ligne.id}
                  ligne={ligne}
                  expandedLigneId={expandedLigneId}
                  toggleLigneExpansion={toggleLigneExpansion}
                  document={document}
                  canManageDocuments={canManageDocuments}
                  onEdit={handleEditDialogOpen}
                  onDelete={handleDeleteDialogOpen}
                />
              ))}
            </div>
          </div>
          
          {lignes.length > 0 && <LigneSummaryFooter lignes={lignes} />}
        </>
      )}

      <CreateLigneDialog 
        document={document}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditLigneDialog 
        document={document}
        ligne={currentLigne}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteLigneDialog 
        document={document}
        ligne={currentLigne}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default LignesListWrapper;
