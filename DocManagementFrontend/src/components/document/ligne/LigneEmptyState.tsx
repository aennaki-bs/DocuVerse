
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LigneEmptyStateProps {
  canManageDocuments: boolean;
  onCreateClick: () => void;
}

const LigneEmptyState = ({ canManageDocuments, onCreateClick }: LigneEmptyStateProps) => {
  return (
    <div className="p-12 text-center bg-gradient-to-b from-blue-950/50 to-indigo-950/30">
      <div className="mx-auto w-20 h-20 bg-blue-900/30 text-blue-300 rounded-full flex items-center justify-center mb-5 border border-blue-400/30">
        <FileText className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-medium text-white mb-3">No Lines Found</h3>
      <p className="text-blue-300 max-w-md mx-auto mb-8">
        This document doesn't have any lines yet. Add your first line to get started.
      </p>
      {canManageDocuments && (
        <Button 
          onClick={onCreateClick} 
          variant="outline" 
          size="lg"
          className="border-dashed border-2 border-blue-500/30 text-blue-300 hover:border-blue-500/50 hover:text-blue-200 hover:bg-blue-900/30"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Your First Line
        </Button>
      )}
    </div>
  );
};

export default LigneEmptyState;
