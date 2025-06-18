
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Document } from '@/models/document';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 shadow-lg overflow-hidden">
      <CardHeader className="border-b border-blue-900/30 bg-[#060927]/50">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-300" />
          {document?.title || 'Document'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Document Code</h3>
            <p className="font-medium font-mono">{document?.documentKey}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Document Type</h3>
            <p className="font-medium">{document?.documentType?.typeName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Created By</h3>
            <p className="font-medium">{document?.createdBy?.firstName} {document?.createdBy?.lastName}</p>
          </div>
        </div>
        
        <div className="border-t border-blue-900/30 pt-4 mt-2">
          <h3 className="text-sm font-medium text-blue-300 mb-2">Document Content</h3>
          <div className="bg-[#111633]/50 p-3 rounded-md border border-blue-900/30 max-h-32 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">
              {document?.content || 'No content available'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
