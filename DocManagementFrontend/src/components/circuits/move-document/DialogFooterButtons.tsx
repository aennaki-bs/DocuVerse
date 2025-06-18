
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ArrowRightFromLine, Loader2 } from "lucide-react";

interface DialogFooterButtonsProps {
  isMoving: boolean;
  onCancel: () => void;
}

export function DialogFooterButtons({ isMoving, onCancel }: DialogFooterButtonsProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isMoving}
        className="border-blue-900/30 text-white hover:bg-blue-900/20"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isMoving}
        className="bg-green-600 hover:bg-green-700"
      >
        {isMoving ? (
          <>Moving... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
        ) : (
          <>Move Document <ArrowRightFromLine className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </DialogFooter>
  );
}
