
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, FileStack, Settings, Ban, AlertCircle } from 'lucide-react';
import { SousLigne, Ligne, Document, CreateSousLigneRequest } from '@/models/document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

interface SousLignesListProps {
  document: Document;
  ligne: Ligne;
  canManageDocuments: boolean;
}

const SousLignesList = ({ document, ligne, canManageDocuments }: SousLignesListProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSousLigne, setCurrentSousLigne] = useState<SousLigne | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [attribute, setAttribute] = useState('');

  const queryClient = useQueryClient();

  // Fetch sous-lignes for this ligne
  const { 
    data: sousLignes = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['sousLignes', ligne.id],
    queryFn: () => documentService.getSousLignesByLigneId(ligne.id),
  });

  // Handle error with useEffect if needed
  useEffect(() => {
    if (error) {
      console.error(`Failed to fetch sousLignes for ligne ${ligne.id}:`, error);
      toast.error('Failed to load sous-lignes');
    }
  }, [error, ligne.id]);

  const resetForm = () => {
    setTitle('');
    setAttribute('');
    setCurrentSousLigne(null);
  };

  const handleCreateDialogOpen = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEditDialogOpen = (sousLigne: SousLigne) => {
    setCurrentSousLigne(sousLigne);
    setTitle(sousLigne.title);
    setAttribute(sousLigne.attribute);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (sousLigne: SousLigne) => {
    setCurrentSousLigne(sousLigne);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSousLigne = async () => {
    if (!title || !attribute) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const newSousLigne: CreateSousLigneRequest = {
        ligneId: ligne.id,
        title,
        attribute
      };

      await documentService.createSousLigne(newSousLigne);
      toast.success('Sub-line created successfully');
      resetForm();
      setIsCreateDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({queryKey: ['document', document.id]});
      queryClient.invalidateQueries({queryKey: ['documentLignes', document.id]});
      queryClient.invalidateQueries({queryKey: ['sousLignes', ligne.id]});
    } catch (error) {
      console.error('Failed to create sous-ligne:', error);
      toast.error('Failed to create sous-ligne');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSousLigne = async () => {
    if (!currentSousLigne) return;
    
    try {
      setIsSubmitting(true);
      await documentService.updateSousLigne(currentSousLigne.id, {
        title,
        attribute
      });
      toast.success('Sub-line updated successfully');
      resetForm();
      setIsEditDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({queryKey: ['document', document.id]});
      queryClient.invalidateQueries({queryKey: ['documentLignes', document.id]});
      queryClient.invalidateQueries({queryKey: ['sousLignes', ligne.id]});
    } catch (error) {
      console.error('Failed to update sous-ligne:', error);
      toast.error('Failed to update sous-ligne');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSousLigne = async () => {
    if (!currentSousLigne) return;
    
    try {
      setIsSubmitting(true);
      await documentService.deleteSousLigne(currentSousLigne.id);
      toast.success('Sub-line deleted successfully');
      resetForm();
      setIsDeleteDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({queryKey: ['document', document.id]});
      queryClient.invalidateQueries({queryKey: ['documentLignes', document.id]});
      queryClient.invalidateQueries({queryKey: ['sousLignes', ligne.id]});
    } catch (error) {
      console.error('Failed to delete sous-ligne:', error);
      toast.error('Failed to delete sous-ligne');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <p className="mt-3 text-sm text-blue-300">Loading sub-lines...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <FileStack className="h-4 w-4 mr-2 text-blue-400" />
          <h4 className="font-medium text-blue-200">
            Sub-Lines <span className="text-blue-400/70 text-sm font-normal ml-1">({sousLignes.length})</span>
          </h4>
        </div>
        {canManageDocuments && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            size="sm" 
            variant="outline" 
            className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50 flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Sub-Line
          </Button>
        )}
      </div>

      <AnimatePresence>
        {sousLignes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-blue-300/70 italic p-6 text-center bg-blue-950/30 rounded-md border border-blue-500/10"
          >
            No sub-lines available for this line yet.
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sousLignes.map((sousLigne, index) => (
              <motion.div
                key={sousLigne.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-500/20 hover:border-blue-500/30 transition-colors duration-200 group overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h5 className="text-sm font-medium text-white truncate">{sousLigne.title}</h5>
                          {sousLigne.sousLigneKey && (
                            <Badge variant="outline" className="font-mono text-[10px] border-blue-500/20 bg-blue-900/20 text-blue-300">
                              {sousLigne.sousLigneKey}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-blue-200 overflow-hidden line-clamp-3">{sousLigne.attribute}</p>
                      </div>
                      {canManageDocuments && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleEditDialogOpen(sousLigne)}
                          >
                            <Edit className="h-3 w-3 text-blue-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleDeleteDialogOpen(sousLigne)}
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Create SousLigne Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900/95 to-blue-900/90 border-white/10 text-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-300">
              <Plus className="h-5 w-5 mr-2" /> Add Sub-Line
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sl-title" className="text-blue-200">Title<span className="text-red-400">*</span></Label>
              <Input 
                id="sl-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter sub-line title"
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sl-attribute" className="text-blue-200">Attribute<span className="text-red-400">*</span></Label>
              <Textarea 
                id="sl-attribute" 
                value={attribute} 
                onChange={(e) => setAttribute(e.target.value)} 
                placeholder="Enter attribute value"
                rows={3}
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
            >
              <Ban className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleCreateSousLigne} 
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit SousLigne Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900/95 to-blue-900/90 border-white/10 text-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-300">
              <Settings className="h-5 w-5 mr-2" /> Edit Sub-Line
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sl-title" className="text-blue-200">Title<span className="text-red-400">*</span></Label>
              <Input 
                id="edit-sl-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter sub-line title"
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sl-attribute" className="text-blue-200">Attribute<span className="text-red-400">*</span></Label>
              <Textarea 
                id="edit-sl-attribute" 
                value={attribute} 
                onChange={(e) => setAttribute(e.target.value)} 
                placeholder="Enter attribute value"
                rows={3}
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
            >
              <Ban className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleUpdateSousLigne} 
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete SousLigne Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900/95 to-red-900/80 border-white/10 text-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-300">
              <AlertCircle className="h-5 w-5 mr-2" /> Delete Sub-Line
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 mb-4">Are you sure you want to delete this sub-line?</p>
            {currentSousLigne && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                <h4 className="font-medium text-white">{currentSousLigne.title}</h4>
                {currentSousLigne.sousLigneKey && (
                  <Badge variant="outline" className="mt-2 font-mono text-xs border-red-500/30 bg-red-900/30 text-red-300">
                    {currentSousLigne.sousLigneKey}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-400/30 text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <Ban className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSousLigne} 
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SousLignesList;
