
import { useState } from 'react';
import { Edit, Trash2, Info, Lock } from 'lucide-react';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import EditCircuitDetailDialog from './EditCircuitDetailDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CircuitDetailsListProps {
  circuitDetails: CircuitDetail[];
  onUpdate: () => void;
}

export default function CircuitDetailsList({
  circuitDetails,
  onUpdate,
}: CircuitDetailsListProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CircuitDetail | null>(null);
  const { user } = useAuth();
  const isSimpleUser = user?.role === 'SimpleUser';

  const handleEdit = (detail: CircuitDetail) => {
    if (isSimpleUser) {
      toast.error('You do not have permission to edit circuit steps');
      return;
    }
    setSelectedDetail(detail);
    setEditDialogOpen(true);
  };

  const handleDelete = (detail: CircuitDetail) => {
    if (isSimpleUser) {
      toast.error('You do not have permission to delete circuit steps');
      return;
    }
    setSelectedDetail(detail);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDetail) return;
    
    try {
      await circuitService.deleteCircuitDetail(selectedDetail.id);
      toast.success("Circuit step deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete circuit step");
      console.error(error);
    }
  };

  // Sort circuit details by order index
  const sortedDetails = [...circuitDetails].sort((a, b) => a.orderIndex - b.orderIndex);

  if (sortedDetails.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No steps defined for this circuit yet. {!isSimpleUser && 'Add a step to get started.'}
      </div>
    );
  }
  
  const headerContent = isSimpleUser ? (
    <div className="flex items-center text-sm px-4 py-2 text-gray-500">
      <Lock className="h-4 w-4 mr-2" /> View-only access
    </div>
  ) : null;

  return (
    <div className="rounded-md border">
      {headerContent}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Step</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Responsible Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDetails.map((detail) => (
            <TableRow key={detail.id}>
              <TableCell className="font-medium text-center">
                <Badge variant="outline">{detail.orderIndex + 1}</Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {detail.circuitDetailKey}
              </TableCell>
              <TableCell>{detail.title}</TableCell>
              <TableCell className="max-w-xs truncate">
                {detail.descriptif || 'No description'}
              </TableCell>
              <TableCell>
                {detail.responsibleRole ? (
                  <Badge>{detail.responsibleRole.name}</Badge>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {isSimpleUser ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View details only</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(detail)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(detail)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit & Delete Dialogs - Only render if user has permissions */}
      {selectedDetail && !isSimpleUser && (
        <>
          <EditCircuitDetailDialog
            circuitDetail={selectedDetail}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={onUpdate}
          />
          
          <DeleteConfirmDialog
            title="Delete Circuit Step"
            description={`Are you sure you want to delete the step "${selectedDetail.title}"? This action cannot be undone.`}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
}
