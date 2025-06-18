
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const DocumentLoadingState = () => {
  return (
    <div className="space-y-6">
      <Card className="animate-pulse bg-gradient-to-br from-gray-900/90 to-blue-900/60 border-blue-500/20">
        <CardHeader className="h-12 bg-blue-900/30"></CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="h-6 bg-blue-900/40 rounded-md"></div>
            <div className="h-6 bg-blue-900/40 rounded-md w-3/4"></div>
            <div className="h-40 bg-blue-900/40 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentLoadingState;
