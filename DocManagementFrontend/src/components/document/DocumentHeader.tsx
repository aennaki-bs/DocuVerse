
import { Link } from 'react-router-dom';
import { FileText, Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document } from '@/models/document';

interface DocumentHeaderProps {
  document: Document;
  onBack: () => void;
}

const DocumentHeader = ({ document, onBack }: DocumentHeaderProps) => {
  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0:
        return <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border-amber-500/30">Draft</Badge>;
      case 1:
        return <Badge className="bg-green-500/20 text-green-200 hover:bg-green-500/30 border-green-500/30">Active</Badge>;
      case 2:
        return <Badge className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border-purple-500/30">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="border-b border-blue-900/50 bg-gradient-to-r from-blue-950 to-indigo-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack} 
            className="mr-4 border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Documents
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              <div>
                <span className="text-blue-300 text-sm font-medium">{document.documentKey}</span>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  {document.title}
                  {getStatusBadge(document.status)}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3 text-blue-300/80 mt-1">
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                <span>{document.documentType.typeName}</span>
              </div>
              <span className="text-blue-400/50">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(document.docDate).toLocaleDateString()}</span>
              </div>
              <span className="text-blue-400/50">•</span>
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{document.createdBy.firstName} {document.createdBy.lastName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
