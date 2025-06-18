import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Step {
  id: number;
  stepKey: string;
  circuitId: number;
  title: string;
  descriptif: string;
  currentStatusId: number;
  currentStatusTitle: string;
  nextStatusId: number;
  nextStatusTitle: string;
}

interface StepsTableProps {
  steps: Step[];
  onEdit: (step: Step) => void;
  onDelete: (step: Step) => void;
  isSimpleUser: boolean;
  circuitIsActive: boolean;
}

export function StepsTable({
  steps,
  onEdit,
  onDelete,
  isSimpleUser,
  circuitIsActive
}: StepsTableProps) {
  // If there are no steps, show an empty state
  if (steps.length === 0) {
    return (
      <EmptyState
        title="No Circuit Steps"
        description="No Circuit Steps have been configured for this circuit yet."
        icon="diagram"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circuit Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="w-[60px] text-center">→</TableHead>
              <TableHead>Next Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>
                  <div className="font-medium">{step.title}</div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-[200px] truncate">
                          {step.descriptif || 'No description'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm">
                        {step.descriptif || 'No description'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{step.currentStatusTitle}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-blue-500">→</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{step.nextStatusTitle}</div>
                </TableCell>
                <TableCell className="text-right">
                  {!isSimpleUser && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(step)}
                        disabled={circuitIsActive}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(step)}
                        disabled={circuitIsActive}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 