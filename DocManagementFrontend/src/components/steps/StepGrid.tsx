
import { useNavigate } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash, CircleCheck } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StepGridProps {
  steps: Step[];
  circuits: Circuit[];
  onDeleteStep: (step: Step) => void;
  onEditStep: (step: Step) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StepGrid = ({
  steps,
  circuits,
  onDeleteStep,
  onEditStep,
  searchQuery,
  onSearchChange,
}: StepGridProps) => {
  const navigate = useNavigate();
  // Get circuit names map
  const circuitNamesMap = circuits.reduce((map, circuit) => {
    map[circuit.id] = circuit.title;
    return map;
  }, {} as Record<number, string>);

  const handleManageStatuses = (step: Step) => {
    navigate(`/circuits/${step.circuitId}/steps/${step.id}/statuses`);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => (
          <Card key={step.id} className="bg-card border-blue-900/30">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg truncate">{step.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border-blue-900/30">
                    <DropdownMenuItem onClick={() => onEditStep(step)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageStatuses(step)}>
                      <CircleCheck className="mr-2 h-4 w-4" />
                      Manage Statuses
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteStep(step)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{step.stepKey}</div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="text-sm line-clamp-2">{step.descriptif || 'No description'}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-900/20">
                    {circuitNamesMap[step.circuitId] || `Circuit #${step.circuitId}`}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-900/20">
                    Order: {step.orderIndex}
                  </Badge>
                  {step.isFinalStep && (
                    <Badge className="bg-green-600">Final Step</Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onEditStep(step)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Step
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => handleManageStatuses(step)}
              >
                <CircleCheck className="mr-2 h-4 w-4" />
                Statuses
              </Button>
            </CardFooter>
          </Card>
        ))}

        {steps.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No steps found.
          </div>
        )}
      </div>
    </div>
  );
};
