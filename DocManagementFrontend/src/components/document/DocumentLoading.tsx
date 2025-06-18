
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentLoading = () => {
  return (
    <div className="min-h-screen bg-[#070b28] py-4">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" disabled className="bg-blue-950/30 border-blue-400/20 text-blue-300/50">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Documents
          </Button>
        </div>
        
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-blue-900/30 rounded-md w-3/4"></div>
          <div className="flex space-x-4">
            <div className="h-28 w-28 bg-blue-900/30 rounded-lg"></div>
            <div className="flex-1 space-y-4 py-2">
              <div className="h-4 bg-blue-900/30 rounded w-3/4"></div>
              <div className="h-4 bg-blue-900/30 rounded w-1/2"></div>
              <div className="h-4 bg-blue-900/30 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-64 bg-blue-900/30 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLoading;
