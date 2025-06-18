
import { Card } from '@/components/ui/card';
import { Document } from '@/models/document';
import { FileText } from 'lucide-react';

interface DraggableDocumentCardProps {
  document: Document;
  onDragStart?: () => void;
}

export const DraggableDocumentCard = ({ document, onDragStart }: DraggableDocumentCardProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const documentData = { documentId: document.id };
    e.dataTransfer.setData('application/json', JSON.stringify(documentData));
    e.dataTransfer.effectAllowed = 'move';
    
    if (onDragStart) {
      onDragStart();
    }
  };

  return (
    <Card 
      draggable={true}
      onDragStart={handleDragStart}
      className="cursor-grab bg-[#0a1033] border border-blue-900/50 hover:border-blue-600/70 transition-all active:scale-95 transform shadow-md"
    >
      <div className="p-2 text-xs">
        <div className="flex items-center gap-1.5 text-blue-300 mb-1">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-semibold tracking-wide truncate">{document.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-blue-400/70 text-[10px]">{document.documentKey}</span>
        </div>
      </div>
    </Card>
  );
};
