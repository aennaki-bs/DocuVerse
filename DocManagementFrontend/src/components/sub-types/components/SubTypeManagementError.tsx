
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubTypeManagementError() {
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <div className="text-center">
        <p className="text-blue-300">Document type not found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/document-types-management')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Document Types
        </Button>
      </div>
    </div>
  );
}
