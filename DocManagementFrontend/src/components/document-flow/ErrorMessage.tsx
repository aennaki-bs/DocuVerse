
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="p-4 rounded bg-red-900/20 border border-red-900/30 text-red-400 mb-4">
      {error}
      <Button 
        variant="link" 
        className="text-red-400 underline ml-2 p-0 h-auto" 
        onClick={() => window.location.reload()}
      >
        Reload page
      </Button>
    </div>
  );
}
