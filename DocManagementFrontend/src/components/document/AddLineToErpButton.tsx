import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api/core';

interface AddLineToErpButtonProps {
  ligneId: number;
  ligneTitle: string;
  documentErpCode?: string;
  lineErpCode?: string;
  onSuccess?: (erpLineCode: string) => void;
  className?: string;
}

interface ErpStatus {
  canAddToErp: boolean;
  reason: string;
  message: string;
  documentErpCode?: string;
  lineErpCode?: string;
  hasElement: boolean;
}

const AddLineToErpButton: React.FC<AddLineToErpButtonProps> = ({
  ligneId,
  ligneTitle,
  documentErpCode,
  lineErpCode,
  onSuccess,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [erpStatus, setErpStatus] = useState<ErpStatus | null>(null);

  // Helper function to clean up raw JSON ERP codes
  const parseErpLineCode = (rawCode: string): string => {
    if (!rawCode) return '';
    
    // If it looks like JSON, try to parse it
    if (rawCode.includes('"@odata.context"') || rawCode.includes('"value"')) {
      try {
        const parsed = JSON.parse(rawCode);
        return parsed.value?.toString() || rawCode;
      } catch {
        // If parsing fails, return the raw code
        return rawCode;
      }
    }
    
    // If it's already clean, return as-is
    return rawCode;
  };

  // Check if line can be added to ERP
  const checkErpStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await api.get(`/Lignes/${ligneId}/can-add-to-erp`);
      setErpStatus(response.data);
    } catch (error) {
      console.error('Error checking ERP status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Add line to ERP
  const handleAddToErp = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/Lignes/${ligneId}/add-to-erp`);
      const result = response.data;

      if (result.success) {
        toast.success(`Line "${ligneTitle}" successfully added to ERP`, {
          description: `ERP Line Code: ${result.erpLineCode}`
        });
        
        // Update status to reflect the change
        setErpStatus(prev => prev ? {
          ...prev,
          canAddToErp: false,
          reason: 'line_already_in_erp',
          message: 'Line is already in ERP',
          lineErpCode: result.erpLineCode
        } : null);

        // Call success callback
        if (onSuccess) {
          onSuccess(result.erpLineCode);
        }
      } else {
        toast.error('Failed to add line to ERP', {
          description: result.message || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Error adding line to ERP:', error);
      toast.error('Failed to add line to ERP', {
        description: 'Network error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on component mount and when props change
  useEffect(() => {
    checkErpStatus();
  }, [ligneId, documentErpCode, lineErpCode]);

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <Button disabled size="sm" className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking...
      </Button>
    );
  }

  // No status available
  if (!erpStatus) {
    return (
      <Button disabled size="sm" variant="outline" className={className}>
        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
        Error
      </Button>
    );
  }

  // Line is already in ERP
  if (erpStatus.lineErpCode) {
    const cleanLineCode = parseErpLineCode(erpStatus.lineErpCode);
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="success" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          In ERP: {cleanLineCode}
        </Badge>
      </div>
    );
  }

  // Line cannot be added to ERP
  if (!erpStatus.canAddToErp) {
    let tooltipMessage = erpStatus.message;
    let variant: "outline" | "secondary" = "outline";
    let icon = <AlertCircle className="h-4 w-4 mr-2" />;

    switch (erpStatus.reason) {
      case 'document_not_archived':
        tooltipMessage = 'Document must be archived to ERP first';
        break;
      case 'missing_element':
        tooltipMessage = 'Line must have a valid Item or Account';
        break;
      default:
        break;
    }

    return (
      <Button 
        disabled 
        size="sm" 
        variant={variant} 
        className={className}
        title={tooltipMessage}
      >
        {icon}
        Add to ERP
      </Button>
    );
  }

  // Line can be added to ERP
  return (
    <Button 
      onClick={handleAddToErp}
      disabled={isLoading}
      size="sm"
      className={className}
      title="Add this line to Business Central ERP"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Upload className="h-4 w-4 mr-2" />
      )}
      Add to ERP
    </Button>
  );
};

export default AddLineToErpButton; 