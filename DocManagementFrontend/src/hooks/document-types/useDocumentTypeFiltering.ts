
import { useState, useMemo } from 'react';
import { DocumentType } from '@/models/document';

export const useDocumentTypeFiltering = (documentTypes: DocumentType[]) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterConfig, setFilterConfig] = useState<{
    field: string | null;
    value: string | null;
    dateRange?: { from?: Date; to?: Date };
  }>({
    field: null,
    value: null,
  });

  const filteredTypes = useMemo(() => {
    if (!documentTypes) return [];
    
    return documentTypes.filter(type => {
      // Text search filtering
      const matchesSearch = !searchQuery || 
        (type.typeName && type.typeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (type.typeKey && type.typeKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (type.typeAttr && type.typeAttr.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      // Advanced filtering
      if (filterConfig.field && filterConfig.value) {
        switch (filterConfig.field) {
          case 'typeName':
            return type.typeName?.toLowerCase().includes(filterConfig.value.toLowerCase());
          case 'typeKey':
            return type.typeKey?.toLowerCase().includes(filterConfig.value.toLowerCase());
          case 'documentCounter':
            return type.documentCounter?.toString() === filterConfig.value;
          case 'createdAt':
          case 'updatedAt':
            if (!filterConfig.dateRange) return true;
            
            const date = new Date(type[filterConfig.field]);
            const from = filterConfig.dateRange.from;
            const to = filterConfig.dateRange.to;
            
            if (from && to) {
              return date >= from && date <= to;
            } else if (from) {
              return date >= from;
            } else if (to) {
              return date <= to;
            }
            return true;
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [documentTypes, searchQuery, filterConfig]);

  const applyFilter = (config: {
    field: string | null;
    value: string | null;
    dateRange?: { from?: Date; to?: Date };
  }) => {
    setFilterConfig(config);
  };

  return {
    searchQuery,
    setSearchQuery,
    filterConfig,
    applyFilter,
    filteredTypes,
  };
};
