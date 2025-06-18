
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import circuitService from '@/services/circuitService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CircuitHistoryTimelineProps {
  documentId: number;
}

export default function CircuitHistoryTimeline({ documentId }: CircuitHistoryTimelineProps) {
  const { data: history, isLoading, isError, refetch } = useQuery({
    queryKey: ['document-circuit-history', documentId],
    queryFn: () => circuitService.getDocumentCircuitHistory(documentId),
  });

  useEffect(() => {
    // Refetch the history data when component mounts or documentId changes
    refetch();
  }, [documentId, refetch]);

  const getStatusIcon = (isApproved: boolean) => {
    return isApproved ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Failed to load circuit history
        <Button variant="outline" size="sm" className="ml-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No circuit history found for this document
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circuit History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[1.6rem] top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-8">
            {history.map((item) => (
              <div key={item.id} className="relative flex items-start">
                {/* Timeline Node */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-gray-200 z-10">
                  {getStatusIcon(item.isApproved)}
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <span>{item.stepTitle || (item.circuitDetail ? item.circuitDetail.title : 'Unknown Step')}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="flex items-center text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {format(new Date(item.processedAt), 'PPpp')}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-700">
                    Processed by: <span className="font-medium">{item.processedBy || item.userName || 'Unknown'}</span>
                  </div>
                  
                  <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                    {item.comments}
                  </div>
                  
                  <div className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isApproved ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
