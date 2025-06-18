import { useState } from 'react';
import { DocumentType } from '@/models/document';

export const useDocumentTypeSelection = (types: DocumentType[]) => {
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableTypeIds = types
        .filter(type => type.documentCounter === 0)
        .map(type => type.id!)
        .filter(id => id !== undefined);
      setSelectedTypes(selectableTypeIds);
    } else {
      setSelectedTypes([]);
    }
  };

  const handleSelectType = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedTypes(prev => [...prev, id]);
    } else {
      setSelectedTypes(prev => prev.filter(typeId => typeId !== id));
    }
  };

  return {
    selectedTypes,
    setSelectedTypes,
    handleSelectType,
    handleSelectAll
  };
};
