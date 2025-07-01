import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useLineErpOperations } from '@/hooks/useLineErpOperations';
import { useDocumentErpOperations } from '@/hooks/useDocumentErpOperations';

interface ErpOperationsTestPanelProps {
  documentId: number;
  documentKey: string;
  ligneId?: number;
  ligneTitle?: string;
  isVisible?: boolean;
}

const ErpOperationsTestPanel: React.FC<ErpOperationsTestPanelProps> = ({
  documentId,
  documentKey,
  ligneId,
  ligneTitle,
  isVisible = false
}) => {
  const [operationResults, setOperationResults] = useState<Array<{
    operation: string;
    timestamp: string;
    success: boolean;
    message: string;
    errorType?: string;
  }>>([]);

  const { addLineToErp, isLoading: isLineLoading } = useLineErpOperations();
  const { archiveDocumentToErp, createDocumentLinesInErp, isLoading: isDocumentLoading } = useDocumentErpOperations();

  const isLoading = isLineLoading || isDocumentLoading;

  const addResult = (operation: string, success: boolean, message: string, errorType?: string) => {
    setOperationResults(prev => [{
      operation,
      timestamp: new Date().toLocaleTimeString(),
      success,
      message,
      errorType
    }, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const handleArchiveDocument = async () => {
    const result = await archiveDocumentToErp(documentId, documentKey);
    addResult('Archive Document', result.success, result.message || '', result.errorType);
  };

  const handleCreateDocumentLines = async () => {
    const result = await createDocumentLinesInErp(documentId, documentKey);
    addResult('Create Document Lines', result.success, result.message || '', result.errorType);
  };

  const handleAddLineToErp = async () => {
    if (!ligneId || !ligneTitle) return;
    const result = await addLineToErp(ligneId, ligneTitle);
    addResult('Add Line to ERP', result.success, result.message || '', result.errorType);
  };

  // Simulate different error scenarios for testing
  const simulateError = async (errorType: string) => {
    // This would normally call a test endpoint that returns specific error types
    const errorMessages = {
      'ValidationError': 'The specified item does not exist in Business Central. Please verify the item code.',
      'NetworkError': 'Unable to connect to Business Central ERP system. Please check network connectivity.',
      'AuthenticationError': 'Authentication failed with Business Central. Please check API credentials.',
      'TimeoutError': 'ERP operation timed out. The system may be busy, please try again later.',
      'NotFoundError': 'The specified location does not exist in Business Central. Please verify the location code.'
    };

    addResult(
      `Simulate ${errorType}`,
      false,
      errorMessages[errorType as keyof typeof errorMessages] || 'Unknown error',
      errorType
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          ERP Operations Test Panel
        </CardTitle>
        <CardDescription className="text-slate-300">
          Test ERP operations and error handling for document {documentKey}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-yellow-900/20 border-yellow-700/30 text-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This panel is for testing ERP error handling. Operations may fail intentionally to demonstrate error messages.
          </AlertDescription>
        </Alert>

        {/* Operation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleArchiveDocument}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Archive Document
          </Button>

          <Button
            onClick={handleCreateDocumentLines}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Document Lines
          </Button>

          {ligneId && ligneTitle && (
            <Button
              onClick={handleAddLineToErp}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Line to ERP
            </Button>
          )}
        </div>

        {/* Error Simulation Buttons */}
        <div className="border-t border-slate-600 pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Simulate Error Scenarios:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['ValidationError', 'NetworkError', 'AuthenticationError', 'TimeoutError', 'NotFoundError'].map(errorType => (
              <Button
                key={errorType}
                onClick={() => simulateError(errorType)}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {errorType.replace('Error', '')}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Display */}
        {operationResults.length > 0 && (
          <div className="border-t border-slate-600 pt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Operations:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {operationResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg text-sm"
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{result.operation}</span>
                      <span className="text-slate-400 text-xs">{result.timestamp}</span>
                      {result.errorType && (
                        <Badge variant="outline" className="text-xs border-red-500 text-red-400">
                          {result.errorType}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="text-xs text-slate-400 bg-slate-700/30 p-3 rounded">
          <p><strong>Document ID:</strong> {documentId}</p>
          <p><strong>Document Key:</strong> {documentKey}</p>
          {ligneId && <p><strong>Line ID:</strong> {ligneId}</p>}
          {ligneTitle && <p><strong>Line Title:</strong> {ligneTitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default ErpOperationsTestPanel; 