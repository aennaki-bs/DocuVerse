import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentCircuitHistory } from '@/models/documentCircuit';
import { Trash2, MoveRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CircuitStepCardProps {
  detail: any;
  currentStepId: number | null;
  historyForStep: DocumentCircuitHistory[];
  isSimpleUser: boolean;
  onMoveClick: () => void;
  onProcessClick: () => void;
  onDeleteStep: () => void;
  isDraggedOver?: boolean;
  children?: ReactNode;
}

export const CircuitStepCard = ({
  detail,
  currentStepId,
  historyForStep,
  isSimpleUser,
  onMoveClick,
  onProcessClick,
  onDeleteStep,
  isDraggedOver = false,
  children
}: CircuitStepCardProps) => {
  const isCurrentStep = detail.id === currentStepId;
  const hasHistory = historyForStep.length > 0;

  return (
    <Card 
      className={cn(
        'relative border-2',
        isCurrentStep ? 'border-primary' : 'border-muted',
        isDraggedOver ? 'border-dashed border-primary' : '',
        'transition-all duration-300'
      )}
    >
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">
            {detail.title}
          </CardTitle>
          {!isSimpleUser && (
            <div className="flex gap-2">
              {isCurrentStep && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMoveClick}
                    title="Move to another step"
                  >
                    <MoveRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onProcessClick}
                    title="Process step"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeleteStep}
                className="text-destructive hover:text-destructive/90"
                title="Delete step"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
        {hasHistory && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Last updated: {new Date(historyForStep[0].createdAt).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 