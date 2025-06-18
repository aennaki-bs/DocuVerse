
import { Clock, Check, X } from 'lucide-react';
import { DocumentCircuitHistory } from '@/models/documentCircuit';

interface CircuitHistoryItemProps {
  history: DocumentCircuitHistory;
}

export const CircuitHistoryItem = ({ history }: CircuitHistoryItemProps) => {
  const formatDate = (date: string | Date) => {
    // Convert to Date object if string is provided
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <div 
      className={`text-xs p-1 rounded-md ${
        history.isApproved 
          ? 'bg-green-900/10 border border-green-900/30' 
          : 'bg-red-900/10 border border-red-900/30'
      }`}
    >
      <div className="flex items-start gap-1">
        <div className={`mt-0.5 rounded-full p-1 ${history.isApproved ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          {history.isApproved ? (
            <Check className="h-2 w-2 text-green-400" />
          ) : (
            <X className="h-2 w-2 text-red-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-medium text-xs truncate">
              {history.actionTitle || history.statusTitle || "Step Action"}
            </div>
            <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
              <Clock className="h-2 w-2 mr-1" />
              {formatDate(history.processedAt)}
            </div>
          </div>
          
          <div className="text-gray-400 text-xs mt-0.5">
            by {history.processedBy || "System"}
          </div>
          {history.comments && (
            <div className="mt-0.5 text-xs italic text-gray-300 line-clamp-1">
              "{history.comments}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
