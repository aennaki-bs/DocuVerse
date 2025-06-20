import { useMemo, useState } from 'react';
import { DocumentType } from '@/models/document';

export const useDocumentTypeSorting = (types: DocumentType[]) => {
  const [sortField, setSortField] = useState<string | null>('typeNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTypes = useMemo(() => {
    if (!sortField) return [...types];
    
    return [...types].sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch(sortField) {
        case 'typeKey':
          valueA = a.typeKey || '';
          valueB = b.typeKey || '';
          break;
        case 'typeName':
          valueA = a.typeName || '';
          valueB = b.typeName || '';
          break;
        case 'typeAttr':
          valueA = a.typeAttr || '';
          valueB = b.typeAttr || '';
          break;
        case 'typeNumber':
          valueA = a.typeNumber ?? 0;
          valueB = b.typeNumber ?? 0;
          break;
        case 'tierType':
          valueA = a.tierType || '';
          valueB = b.tierType || '';
          break;
        case 'documentCounter':
          valueA = a.documentCounter || 0;
          valueB = b.documentCounter || 0;
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [types, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedTypes
  };
};
