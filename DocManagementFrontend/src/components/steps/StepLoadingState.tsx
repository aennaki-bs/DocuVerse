
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const StepLoadingState = () => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>

      <Skeleton className="h-12 w-full" />

      <div className="flex space-x-2">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="space-y-2">
        <div className="border rounded-md border-blue-900/30">
          <div className="bg-muted/10 p-4">
            <div className="grid grid-cols-8 gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-full col-span-1" />
              <Skeleton className="h-6 w-full col-span-2" />
              <Skeleton className="h-6 w-full col-span-2 hidden md:block" />
              <Skeleton className="h-6 w-full hidden lg:block" />
              <Skeleton className="h-6 w-20 hidden sm:block" />
            </div>
          </div>

          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-t border-blue-900/30 p-4">
              <div className="grid grid-cols-8 gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-full col-span-1" />
                <Skeleton className="h-5 w-full col-span-2" />
                <Skeleton className="h-5 w-full col-span-2 hidden md:block" />
                <Skeleton className="h-5 w-full hidden lg:block" />
                <Skeleton className="h-5 w-20 hidden sm:block" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
};
