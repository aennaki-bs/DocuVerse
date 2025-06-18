import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, UsersRound, UserCheck, ListOrdered } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalRuleType } from "@/models/approval";

interface RuleSelectionStepProps {
  selectedRule: ApprovalRuleType;
  onRuleChange: (value: string) => void;
}

const ruleDefinitions = [
  {
    id: "Any",
    title: "Any Can Approve",
    description: "Any single user in the group can approve the document",
    icon: <UserCheck className="h-4 w-4 text-green-500" />,
  },
  {
    id: "All",
    title: "All Must Approve",
    description:
      "All users in the group must approve for the document to proceed",
    icon: <UsersRound className="h-4 w-4 text-blue-500" />,
  },
  {
    id: "Sequential",
    title: "Sequential Approval",
    description: "Users must approve in a specific order",
    icon: <ListOrdered className="h-4 w-4 text-purple-500" />,
  },
];

export function RuleSelectionStep({
  selectedRule,
  onRuleChange,
}: RuleSelectionStepProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Approval Rules</h3>
        <p className="text-xs text-muted-foreground">
          Select how approvals will be processed for this group
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Settings className="h-3 w-3 text-blue-500" />
          Approval Method
        </Label>

        <RadioGroup
          value={selectedRule}
          onValueChange={onRuleChange}
          className="space-y-2"
        >
          {ruleDefinitions.map((rule) => (
            <div key={rule.id} className="flex">
              <RadioGroupItem
                value={rule.id}
                id={rule.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={rule.id}
                className="flex flex-1 cursor-pointer items-start space-x-2 rounded-md border border-gray-200 dark:border-gray-800 py-2 px-2.5 transition-all hover:bg-muted peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/20"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {rule.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">{rule.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Card className="mt-2 overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Settings className="h-3 w-3" />
            </div>
            <div>
              <h4 className="text-xs font-semibold">About approval methods</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                This setting determines how approvals are processed when a
                document requires approval from this group. Choose the method
                that best fits your workflow requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
