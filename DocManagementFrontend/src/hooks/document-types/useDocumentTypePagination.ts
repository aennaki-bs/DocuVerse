
import { useMemo, useState } from 'react';
import { DocumentType } from '@/models/document';

export const useDocumentTypePagination = (types: DocumentType[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedTypes = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return types.slice(indexOfFirstItem, indexOfLastItem);
  }, [types, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(types.length / itemsPerPage);

  return {
    currentPage,
    setCurrentPage,
    paginatedTypes,
    totalPages,
    itemsPerPage
  };
};
