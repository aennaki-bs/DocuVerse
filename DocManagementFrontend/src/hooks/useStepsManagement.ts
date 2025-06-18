
import { useState } from 'react';
import { toast } from 'sonner';
import { useSteps } from '@/hooks/useSteps';
import stepService from '@/services/stepService';
import { Step } from '@/models/step';

export function useStepsManagement() {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<Step | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const {
    steps,
    allSteps,
    circuits,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedSteps,
    handleSelectStep,
    handleSelectAll,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    filterOptions,
    setFilterOptions,
    resetFilters,
    refetch
  } = useSteps();

  const openDeleteDialog = (step: Step) => {
    setStepToDelete(step);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (stepToDelete) {
        await stepService.deleteStep(stepToDelete.id);
        toast.success('Step deleted successfully');
        refetch();
      }
    } catch (error) {
      console.error('Failed to delete step:', error);
      toast.error('Failed to delete step');
    } finally {
      setDeleteDialogOpen(false);
      setStepToDelete(null);
    }
  };

  const handleEditStep = (step: Step) => {
    setCurrentStep(step);
    setIsFormDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      await stepService.deleteMultipleSteps(selectedSteps);
      toast.success(`Successfully deleted ${selectedSteps.length} steps`);
      refetch();
    } catch (error) {
      console.error('Failed to delete steps in bulk:', error);
      toast.error('Failed to delete some or all steps');
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleAddStep = () => {
    setCurrentStep(null);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  return {
    steps,
    allSteps,
    circuits,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedSteps,
    handleSelectStep,
    handleSelectAll,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    filterOptions,
    setFilterOptions,
    resetFilters,
    isFormDialogOpen,
    setIsFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    stepToDelete,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    currentStep,
    viewMode,
    setViewMode,
    openDeleteDialog,
    handleDelete,
    handleEditStep,
    handleBulkDelete,
    handleAddStep,
    handleFormSuccess,
    refetch
  };
}
