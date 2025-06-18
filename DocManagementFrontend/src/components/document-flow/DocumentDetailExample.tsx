import { useState, useEffect } from "react";
import { WorkflowDialogButton } from "./WorkflowDialogButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Download,
  Share,
  Trash,
  FileText,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import documentService from "@/services/documentService";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

/**
 * This is an example component showing how to integrate the WorkflowDialogButton
 * into a document detail page. This is for demonstration purposes only.
 */
export function DocumentDetailExample({ documentId }: { documentId: number }) {
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const data = await documentService.getDocumentById(documentId);
        setDocument(data);
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setError("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-4 rounded bg-red-900/20 border border-red-900/30 text-red-400">
        {error || "Document not found"}
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{document.title}</h1>

        {/* Action buttons with WorkflowDialogButton */}
        <div className="flex items-center gap-2">
          <WorkflowDialogButton
            documentId={document.id}
            hasCircuit={!!document.circuitId}
          />

          <Button variant="outline" className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Download
          </Button>

          <Button variant="outline" className="gap-1">
            <Share className="h-4 w-4" />
            Share
          </Button>

          <Button variant="destructive" className="gap-1">
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Document info */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Document Type
                    </h3>
                    <p className="flex items-center">
                      <Tag className="mr-2 h-4 w-4 text-blue-500" />
                      {document.documentType?.typeName || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Created By
                    </h3>
                    <p className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-blue-500" />
                      {document.createdBy?.username || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Date Created
                    </h3>
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                      {document.createdAt
                        ? format(new Date(document.createdAt), "PPP")
                        : "Unknown"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </h3>
                    <div>
                      <Badge
                        variant={
                          document.isCircuitCompleted ? "default" : "outline"
                        }
                      >
                        {document.isCircuitCompleted
                          ? "Completed"
                          : document.currentStatusTitle || "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Content
                  </h3>
                  <div className="p-4 bg-muted rounded-md mt-2 min-h-[200px]">
                    {document.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              {document.circuitId ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Circuit:</strong> {document.circuit?.title || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Current Status:</strong>{" "}
                    {document.currentStatusTitle || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Current Step:</strong>{" "}
                    {document.currentStepTitle || "N/A"}
                  </p>

                  <WorkflowDialogButton
                    documentId={document.id}
                    hasCircuit={!!document.circuitId}
                    buttonClassName="w-full mt-4"
                    title="View Full Workflow"
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>No workflow assigned to this document</p>
                  <Button className="mt-4" variant="outline">
                    Assign Workflow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Document ID
                  </dt>
                  <dd>{document.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    External Document Number
                  </dt>
                  <dd>{document.documentExterne || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Document Date
                  </dt>
                  <dd>
                    {document.docDate
                      ? format(new Date(document.docDate), "PP")
                      : "N/A"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
