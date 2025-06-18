import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import circuitService from '@/services/circuitService';

interface UseCircuitListProps {
  onApiError?: (errorMessage: string) => void;
  searchQuery: string;
  statusFilter?: string;
}

export function useCircuitList({ onApiError, searchQuery, statusFilter = 'any' }: UseCircuitListProps) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [selectedCircuits, setSelectedCircuits] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "circuitKey",
    direction: "asc",
  });

  const { 
    data: circuits, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['circuits'],
    queryFn: circuitService.getAllCircuits,
    refetchOnWindowFocus: true,
    staleTime: 5000, // Consider data stale after 5 seconds
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to load circuits. Please try again later.';
          console.error('Circuit list error:', err);
          if (onApiError) onApiError(errorMessage);
        }
      }
    }
  });

  // Sort circuits
  const sortedCircuits = useMemo(() => {
    if (!circuits) return [];
    
    let sortableItems = [...circuits];
    
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "circuitKey":
            aValue = a.circuitKey;
            bValue = b.circuitKey;
            break;
          case "title":
            aValue = a.title;
            bValue = b.title;
            break;
          case "descriptif":
            aValue = a.descriptif || '';
            bValue = b.descriptif || '';
            break;
          case "documentType.typeName":
            aValue = a.documentType?.typeName || '';
            bValue = b.documentType?.typeName || '';
            break;
          case "isActive":
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableItems;
  }, [circuits, sortConfig]);

  // Filter circuits based on search query and status filter
  const filteredCircuits = useMemo(() => {
    if (!sortedCircuits) return [];
    
    return sortedCircuits.filter(circuit => {
      // Search filter
      const matchesSearch = !searchQuery || 
        circuit.circuitKey?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        circuit.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (circuit.descriptif && circuit.descriptif.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (circuit.documentType?.typeName && circuit.documentType.typeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (circuit.documentType?.typeKey && circuit.documentType.typeKey.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'any' || 
        (statusFilter === 'active' && circuit.isActive) ||
        (statusFilter === 'inactive' && !circuit.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [sortedCircuits, searchQuery, statusFilter]);
    
  // Set a flag when search has results
  const hasSearchResults = (searchQuery !== '' || statusFilter !== 'any') && filteredCircuits && filteredCircuits.length > 0;
  
  // Set a flag when search has no results
  const hasNoSearchResults = (searchQuery !== '' || statusFilter !== 'any') && filteredCircuits && filteredCircuits.length === 0;

  // Sorting handler
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    
    setSortConfig({ key, direction });
  };

  // Selection handlers
  const handleSelectCircuit = (id: number) => {
    setSelectedCircuits((prev) => {
      if (prev.includes(id)) {
        return prev.filter((circuitId) => circuitId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCircuits.length === filteredCircuits.length) {
      setSelectedCircuits([]);
    } else {
      setSelectedCircuits(filteredCircuits.map((circuit) => circuit.id));
    }
  };

  // Bulk delete handlers
  const openBulkDeleteDialog = () => {
    if (selectedCircuits.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedCircuits.length === 0) return;
    
    try {
      // In a real implementation, you would call a bulk delete API
      // For now, we'll delete one by one
      for (const id of selectedCircuits) {
        await circuitService.deleteCircuit(id);
      }
      
      toast.success(`${selectedCircuits.length} circuits deleted successfully`);
      setSelectedCircuits([]);
      setBulkDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete circuits';
      toast.error(errorMessage);
      if (onApiError) onApiError(errorMessage);
      console.error(error);
    }
  };

  // Dialog handlers
  const handleEdit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setEditDialogOpen(true);
  };

  const handleDelete = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (circuit: Circuit) => {
    if (circuit && circuit.id) {
      navigate(`/circuits/${circuit.id}/statuses`);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCircuit) return;
    
    try {
      await circuitService.deleteCircuit(selectedCircuit.id);
      setDeleteDialogOpen(false);
      toast.success("Circuit deleted successfully");
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete circuit';
      toast.error(errorMessage);
      if (onApiError) onApiError(errorMessage);
      console.error(error);
    }
  };

  return {
    circuits: filteredCircuits,
    isLoading,
    isError,
    selectedCircuit,
    selectedCircuits,
    sortConfig,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    handleEdit,
    handleDelete,
    handleViewDetails,
    handleSelectCircuit,
    handleSelectAll,
    openBulkDeleteDialog,
    confirmBulkDelete,
    requestSort,
    confirmDelete,
    refetch,
    hasSearchResults,
    hasNoSearchResults,
    searchQuery,
    statusFilter
  };
}
