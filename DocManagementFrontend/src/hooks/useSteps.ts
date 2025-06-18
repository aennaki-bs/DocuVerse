
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import stepService from '@/services/stepService';
import circuitService from '@/services/circuitService';

export function useSteps() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string | null>('orderIndex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<StepFilterOptions>({});
  const itemsPerPage = 10;

  // Fetch all steps
  const { data: steps = [], isLoading, refetch } = useQuery({
    queryKey: ['steps'],
    queryFn: stepService.getAllSteps,
  });

  // Fetch all circuits for the filter dropdown
  const { data: circuits = [] } = useQuery({
    queryKey: ['circuits'],
    queryFn: circuitService.getAllCircuits,
  });

  // Filter and sort steps
  const filteredAndSortedSteps = steps
    .filter((step) => {
      // Apply search filter
      const matchesSearch = 
        step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        step.descriptif.toLowerCase().includes(searchQuery.toLowerCase()) ||
        step.stepKey.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply other filters
      const matchesCircuit = filterOptions.circuit 
        ? step.circuitId === filterOptions.circuit 
        : true;
      
      const matchesRole = filterOptions.responsibleRole 
        ? step.responsibleRoleId === filterOptions.responsibleRole 
        : true;
        
      const matchesFinalStep = filterOptions.isFinalStep !== undefined 
        ? step.isFinalStep === filterOptions.isFinalStep 
        : true;

      return matchesSearch && matchesCircuit && matchesRole && matchesFinalStep;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let comparison = 0;
      
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'orderIndex') {
        comparison = a.orderIndex - b.orderIndex;
      } else if (sortField === 'circuitId') {
        comparison = a.circuitId - b.circuitId;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSteps.length / itemsPerPage);
  const paginatedSteps = filteredAndSortedSteps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle select step
  const handleSelectStep = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedSteps((prev) => [...prev, id]);
    } else {
      setSelectedSteps((prev) => prev.filter((stepId) => stepId !== id));
    }
  };

  // Handle select all steps
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableStepIds = filteredAndSortedSteps.map((step) => step.id);
      setSelectedSteps(selectableStepIds);
    } else {
      setSelectedSteps([]);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({});
    setSearchQuery('');
    setSortField('orderIndex');
    setSortDirection('asc');
  };

  // Update page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterOptions]);

  return {
    steps: paginatedSteps,
    allSteps: steps,
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
  };
}
