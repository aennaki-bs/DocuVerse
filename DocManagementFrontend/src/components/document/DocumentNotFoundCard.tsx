
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const DocumentNotFoundCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-red-400/20 bg-gradient-to-br from-red-900/10 to-red-800/5 backdrop-blur-sm shadow-xl">
      <CardContent className="p-8 text-center">
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
          onClick={() => navigate('/documents')}
        >
          Return to Documents
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentNotFoundCard;
