
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface CircuitStepsErrorProps {
  errorMessage?: string;
  type?: 'error' | 'notFound';
}

export const CircuitStepsError = ({ 
  errorMessage,
  type = 'error'
}: CircuitStepsErrorProps) => {
  return (
    <div className="container mx-auto p-6">
      <Alert 
        variant="destructive" 
        className={`mb-4 ${
          type === 'notFound' 
            ? 'border-amber-800 bg-amber-950/50 text-amber-300' 
            : 'border-red-800 bg-red-950/50 text-red-300'
        }`}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{type === 'notFound' ? 'Circuit Not Found' : 'Error'}</AlertTitle>
        <AlertDescription>
          {type === 'notFound' 
            ? 'The circuit you\'re looking for doesn\'t exist or has been removed.' 
            : errorMessage || 'Failed to load circuit steps. Please try again later.'}
        </AlertDescription>
      </Alert>
      <Button variant="outline" asChild>
        <Link to="/circuits">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Circuits
        </Link>
      </Button>
    </div>
  );
};
