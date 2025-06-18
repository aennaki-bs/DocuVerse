
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center w-full h-32 rounded-lg bg-[#111633]/50 border border-blue-900/30">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      </div>
      
      <div className="grid gap-6">
        <Skeleton className="h-[200px] w-full rounded-lg bg-[#111633]/50" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-[200px] bg-[#111633]/50" />
            <Skeleton className="h-10 w-[150px] bg-[#111633]/50" />
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] w-[320px] flex-shrink-0 rounded-lg bg-[#111633]/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
