
import { useState } from 'react';
import { AlertCircle, ArrowRightCircle, Check, MoveHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ActionDto } from '@/models/documentCircuit';

interface CircuitStepsSectionHeaderProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  isSimpleUser: boolean;
  availableActions: ActionDto[];
  canAdvanceToNextStep: boolean;
  canReturnToPreviousStep: boolean;
  isMoving: boolean;
  onProcessClick: () => void;
  onNextStepClick: () => void;
  onMoveClick: () => void;
}

export const CircuitStepsSectionHeader = ({
  showHelp,
  setShowHelp,
  isSimpleUser,
  availableActions,
  canAdvanceToNextStep,
  canReturnToPreviousStep,
  isMoving,
  onProcessClick,
  onNextStepClick,
  onMoveClick
}: CircuitStepsSectionHeaderProps) => {
  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 shadow-md p-3 mb-3 w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-base font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
            <path d="m7 18 10-12"></path>
            <path d="M17 18V6"></path>
            <path d="M7 6v12"></path>
          </svg> Circuit Flow
        </h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {showHelp && (
            <div className="text-xs text-gray-400 bg-blue-900/20 p-1.5 rounded border border-blue-900/30 max-w-xs">
              {isSimpleUser ? 
                "You can view the document flow, but only admins can move documents between steps." : 
                "Drag the document card to a step or use the buttons to process or move the document."
              }
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => setShowHelp(!showHelp)}
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
          
          {!isSimpleUser && availableActions?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={onProcessClick}
                variant="outline"
                size="sm"
                className="border-green-900/30 text-white hover:bg-green-900/20 h-8 text-xs"
                disabled={isMoving}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" /> Process Step
              </Button>
              
              {canAdvanceToNextStep && (
                <Button 
                  onClick={onNextStepClick}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                  disabled={isMoving}
                >
                  <ArrowRightCircle className="mr-1.5 h-3.5 w-3.5" /> Next Step
                </Button>
              )}
              
              {canReturnToPreviousStep && (
                <Button 
                  onClick={onMoveClick}
                  variant="outline"
                  size="sm"
                  className="border-blue-900/30 text-white hover:bg-blue-900/20 h-8 text-xs"
                  disabled={isMoving}
                >
                  <MoveHorizontal className="mr-1.5 h-3.5 w-3.5" /> Move
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
