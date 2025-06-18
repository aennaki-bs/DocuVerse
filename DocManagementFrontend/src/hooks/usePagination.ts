import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  initialPageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  
  // Paginated data
  paginatedData: T[];
  
  // Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  resetPagination: () => void;
  
  // Helper for pagination info
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination<T>({
  data,
  initialPageSize = 25,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Get paginated data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, startIndex, pageSize]);

  // Navigation helpers
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Action handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // Reset to first page when page size changes
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Auto-reset pagination when data changes significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return {
    // State
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    
    // Data
    paginatedData,
    
    // Actions
    setCurrentPage,
    setPageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    
    // Helpers
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
  };
} 