import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, MessageSquare } from "lucide-react";

interface GroupDetailsStepProps {
  name: string;
  comment?: string;
  onNameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
}

export function GroupDetailsStep({
  name,
  comment,
  onNameChange,
  onCommentChange,
}: GroupDetailsStepProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Group Details</h3>
        <p className="text-xs text-muted-foreground">
          Enter information about the approval group
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <FileText className="h-3 w-3 text-blue-500" />
            Group Name*
          </Label>
          <Input
            id="name"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full h-8 text-xs"
            required
          />
          <p className="text-[10px] text-muted-foreground">
            Choose a descriptive name for the approval group
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="comment"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <MessageSquare className="h-3 w-3 text-blue-500" />
            Description (Optional)
          </Label>
          <Textarea
            id="comment"
            placeholder="Add additional details about this group"
            value={comment || ""}
            onChange={(e) => onCommentChange(e.target.value)}
            className="min-h-[80px] w-full text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Provide any additional information about the purpose of this group
          </p>
        </div>
      </div>
    </div>
  );
}
