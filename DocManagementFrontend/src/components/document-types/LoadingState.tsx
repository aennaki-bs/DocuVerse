
import { Card, CardContent } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
