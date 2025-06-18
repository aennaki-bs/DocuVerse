import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";

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

interface DocumentStatus {
  statusId: number;
  statusKey: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isInitial?: boolean;
  isFinal?: boolean;
  isFlexible?: boolean;
  circuitId?: number;
}

interface StepsFlowProps {
  steps: Step[];
  statuses: DocumentStatus[];
}

export function StepsFlow({ steps, statuses }: StepsFlowProps) {
  const { theme } = useTheme();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    if (!steps.length || !statuses.length) return;

    // Create a map of status IDs to their properties
    const statusMap = new Map();
    statuses.forEach((status) => {
      statusMap.set(status.statusId, status);
    });

    // Create nodes from unique statuses involved in steps
    const uniqueStatusIds = new Set<number>();
    steps.forEach((t) => {
      uniqueStatusIds.add(t.currentStatusId);
      uniqueStatusIds.add(t.nextStatusId);
    });

    const nodesList = Array.from(uniqueStatusIds).map((id) => {
      const status = statusMap.get(id);
      return {
        id: id.toString(),
        label: status?.title || `Status ${id}`,
        type: status?.isInitial
          ? "initial"
          : status?.isFinal
          ? "final"
          : status?.isFlexible
          ? "flexible"
          : "normal",
      };
    });

    // Create edges from steps
    const edgesList = steps.map((t) => ({
      id: `e${t.id}`,
      source: t.currentStatusId.toString(),
      target: t.nextStatusId.toString(),
      label: "",
    }));

    setNodes(nodesList);
    setEdges(edgesList);
  }, [steps, statuses]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Status Flow Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No steps to visualize</p>
          </div>
        ) : (
          <div className="flex flex-col items-center p-4">
            <div className="w-full flex flex-wrap justify-center gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Initial Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Final Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Normal Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <span>Flexible Status</span>
              </div>
            </div>

            <div className="w-full p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div className="flow-diagram h-[400px] overflow-auto">
                {/* Render a simple visualization */}
                <div className="flex flex-col items-center">
                  {nodes.map((node) => {
                    const nodeConnections = edges.filter(
                      (edge) =>
                        edge.source === node.id || edge.target === node.id
                    );

                    let bgColor = "bg-blue-500";
                    if (node.type === "initial") bgColor = "bg-green-500";
                    else if (node.type === "final") bgColor = "bg-red-500";
                    else if (node.type === "flexible")
                      bgColor = "bg-purple-500";

                    return (
                      <div key={node.id} className="relative mb-10">
                        <div
                          className={`${bgColor} text-white px-4 py-2 rounded-lg min-w-[120px] text-center`}
                        >
                          {node.label}
                        </div>

                        {/* Show outgoing connections */}
                        {nodeConnections
                          .filter((edge) => edge.source === node.id)
                          .map((edge) => {
                            const targetNode = nodes.find(
                              (n) => n.id === edge.target
                            );
                            return (
                              <div
                                key={edge.id}
                                className="flex flex-col items-center mt-2"
                              >
                                <div className="h-8 border-l-2 border-gray-400"></div>
                                <div className="text-gray-500">↓</div>
                                <div className="text-xs text-gray-500 mb-2">
                                  {targetNode?.label}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Note: This is a simplified visualization. For complex flows, refer
              to the steps table.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
