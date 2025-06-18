
import { DocumentCircuitHistory } from '@/models/documentCircuit';
import { CircuitHistoryItem } from './CircuitHistoryItem';

interface CircuitStepHistoryProps {
  historyForStep: DocumentCircuitHistory[];
}

export const CircuitStepHistory = ({ historyForStep }: CircuitStepHistoryProps) => {
  return (
    <div className="space-y-3">
      {historyForStep.length > 0 ? (
        historyForStep.map(history => (
          <CircuitHistoryItem key={history.id} history={history} />
        ))
      ) : (
        <div className="text-center text-gray-500 text-sm p-2">
          No history for this step yet
        </div>
      )}
    </div>
  );
};
