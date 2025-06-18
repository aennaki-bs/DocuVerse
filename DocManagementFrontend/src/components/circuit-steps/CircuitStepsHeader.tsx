import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Network, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CircuitStepsHeaderProps {
  circuit: Circuit;
  onAddStep: () => void;
  isSimpleUser: boolean;
}

export const CircuitStepsHeader = ({
  circuit,
  onAddStep,
  isSimpleUser
}: CircuitStepsHeaderProps) => {
  const isCircuitActive = circuit.isActive || false;
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/circuits">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">
            {circuit.title} - Steps
          </h1>
          {isCircuitActive && (
            <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-700/30">
              Active
            </Badge>
          )}
        </div>
        <p className="text-gray-400 mt-1">
          Circuit Code: <span className="font-mono text-blue-300">{circuit.circuitKey}</span>
          {isCircuitActive && (
            <span className="ml-2 text-green-400 font-semibold">(Active Circuit)</span>
          )}
        </p>
      </div>
      
      <div className="flex gap-2">
        {/* Steps Button */}
        {!isSimpleUser && (
          <Button 
            variant="outline" 
            className="border-blue-500/30 text-blue-300 hover:text-blue-200"
            asChild
          >
            <Link to={`/circuit/${circuit.id}/steps`}>
              <Network className="mr-2 h-4 w-4" /> Circuit Steps
            </Link>
          </Button>
        )}
        
        {/* Add Step Button */}
        {!isSimpleUser && (
          isCircuitActive ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className="bg-blue-500/50 text-blue-200 cursor-not-allowed"
                    disabled
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Step
                    <AlertCircle className="ml-2 h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cannot add steps to an active circuit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              onClick={onAddStep}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          )
        )}
      </div>
    </div>
  );
};
