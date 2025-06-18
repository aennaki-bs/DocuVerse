import { FileText, Layers, Plus, Search } from 'lucide-react';
import { Document, Ligne } from '@/models/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LignesList from '@/components/document/LignesList';
import { motion } from 'framer-motion';

interface DocumentLinesTabProps {
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const DocumentLinesTab = ({ 
  document, 
  lignes, 
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}: DocumentLinesTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-500/20 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-2.5 shadow-inner">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Document Lines</h2>
                <p className="text-blue-200/80">Manage and organize your document lines efficiently</p>
              </div>
            </div>
            <Badge 
              className="bg-blue-500/10 text-blue-300 border border-blue-500/30 py-2 px-4 text-sm font-medium"
            >
              <FileText className="h-4 w-4 mr-2" /> {lignes.length} Lines
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4 bg-blue-950/30 rounded-lg p-4 border border-blue-900/30">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search lines..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-blue-500/30"
          />
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        
        {canManageDocuments && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Line
          </Button>
        )}
      </div>

      {/* Lines List */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-b from-blue-950/30 to-indigo-950/30 border border-blue-900/30 shadow-xl">
        <LignesList
          document={document}
          lignes={lignes}
          canManageDocuments={canManageDocuments}
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
        />
      </div>
    </motion.div>
  );
};

export default DocumentLinesTab;
