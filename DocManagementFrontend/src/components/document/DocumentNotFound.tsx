
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentNotFoundProps {
  onNavigateBack: () => void;
}

const DocumentNotFound = ({ onNavigateBack }: DocumentNotFoundProps) => {
  return (
    <div className="min-h-screen bg-[#070b28] py-4">
      <div className="max-w-7xl mx-auto p-4">
        <div className="border-red-400/20 bg-gradient-to-br from-red-900/10 to-red-800/5 backdrop-blur-sm shadow-xl p-8 rounded-lg text-center">
          <div className="text-red-400 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Document Not Found</h3>
          <p className="text-lg text-gray-400 mb-6">
            Document not found or you don't have permission to view it.
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="mt-4 border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50" 
            onClick={onNavigateBack}
          >
            Return to Documents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentNotFound;
