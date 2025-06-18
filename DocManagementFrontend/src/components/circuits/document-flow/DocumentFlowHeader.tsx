import { Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';
import { Document } from '@/models/document';

interface DocumentFlowHeaderProps {
  documentId: string;
  document: Document | null;
  navigateBack: () => void;
}

export const DocumentFlowHeader = ({ documentId, document, navigateBack }: DocumentFlowHeaderProps) => {
  return (
    <div className='w-full py-4 px-6 bg-[#0a1033] border-b border-blue-900/30'>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1 text-xs text-blue-400/80">
            <Link to="/documents" className="hover:text-blue-300">Documents</Link>
            <span>/</span>
            <Link to={`/documents/${documentId}`} className="hover:text-blue-300">
              {document?.documentKey || documentId}
            </Link>
            <span>/</span>
            <span className="text-blue-100">Flow</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Document Circuit
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/documents/${documentId}/edit`}
            className="border-blue-900/30 text-white hover:bg-blue-900/20 h-8"
          >
            <Edit className="h-4 w-4 mr-1.5" /> Edit
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={navigateBack}
            className="border-blue-900/30 text-white hover:bg-blue-900/20 h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
        </div>
      </div>
      
      {/* Document metadata */}
      {document && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className="font-mono text-xs">
            {document.documentKey}
          </Badge>
          <Badge variant={document.circuitId ? "secondary" : "outline"} className="text-xs">
            <GitBranch className="mr-1 h-3 w-3" /> {document.circuitId ? document?.circuit?.title || 'Circuit' : 'No Circuit'}
          </Badge>
          <p className="text-xs text-gray-400">
            Last updated: {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
