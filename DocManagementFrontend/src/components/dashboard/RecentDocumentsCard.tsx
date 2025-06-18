import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock } from "lucide-react";
import { Document } from "@/models/document";
import { useTranslation } from "@/hooks/useTranslation";

interface RecentDocumentsCardProps {
  documents: Document[];
}

export function RecentDocumentsCard({ documents }: RecentDocumentsCardProps) {
  const navigate = useNavigate();
  const { t, formatDate } = useTranslation();
  
  if (!documents || documents.length === 0) return null;

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t("dashboard.approved");
      case 2:
        return t("dashboard.pending");
      default:
        return t("dashboard.draft");
    }
  };
  
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">{t("dashboard.recentDocuments")}</h3>
            <p className="text-sm text-blue-300/80">{t("dashboard.recentDocumentsSubtitle")}</p>
          </div>
          <Button 
            onClick={() => navigate('/documents')}
            variant="outline"
            className="border-blue-800/40 hover:bg-blue-800/20 text-blue-300"
          >
            {t("dashboard.viewAll")}
          </Button>
        </div>
        
        <div className="space-y-3">
          {documents.slice(0, 3).map(doc => (
            <div 
              key={doc.id} 
              className="p-3 rounded-md border border-blue-900/30 flex justify-between items-center hover:bg-blue-900/20 cursor-pointer transition-colors"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-900/30 p-2 rounded">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{doc.title}</p>
                  <div className="flex items-center gap-2 text-sm text-blue-300/80">
                    <span>{doc.documentType?.typeName || t("dashboard.noDocumentType")}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 
                      {formatDate(new Date(doc.updatedAt))}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                doc.status === 1 ? 'bg-green-900/30 text-green-400' : 
                doc.status === 2 ? 'bg-amber-900/30 text-amber-400' : 
                'bg-blue-900/30 text-blue-400'
              }`}>
                {getStatusText(doc.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
