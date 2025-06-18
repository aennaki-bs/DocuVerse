import { DocumentType, TierType } from "@/models/document";
import { SubType } from "@/models/subtype";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  Tag,
  Layers,
  FileSignature,
  Edit,
  Check,
  Copy,
  Calculator,
  Share2,
  ExternalLink,
  CheckCircle,
  Building2,
  Info,
  UserCheck,
  Package,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface ReviewStepProps {
  selectedType: DocumentType | undefined;
  selectedSubType: SubType | undefined;
  documentAlias: string;
  title: string;
  docDate: string;
  comptableDate: string | null;
  content: string;
  circuitName: string;
  isExternal?: boolean;
  externalReference?: string;
  responsibilityCentreName?: string;
  userHasAssignedCentre?: boolean;
  // Customer/Vendor props
  selectedCustomerVendor?: any;
  customerVendorName?: string;
  customerVendorAddress?: string;
  customerVendorCity?: string;
  customerVendorCountry?: string;
  onEditTypeClick: () => void;
  onEditDetailsClick: () => void;
  onEditDateClick: () => void;
  onEditContentClick: () => void;
  onEditCircuitClick: () => void;
  onEditResponsibilityCentreClick?: () => void;
  onEditCustomerVendorClick?: () => void;
}

export const ReviewStep = ({
  selectedType,
  selectedSubType,
  documentAlias,
  title,
  docDate,
  comptableDate,
  content,
  circuitName,
  isExternal = false,
  externalReference = "",
  responsibilityCentreName,
  userHasAssignedCentre = false,
  selectedCustomerVendor,
  customerVendorName,
  customerVendorAddress,
  customerVendorCity,
  customerVendorCountry,
  onEditTypeClick,
  onEditDetailsClick,
  onEditDateClick,
  onEditContentClick,
  onEditCircuitClick,
  onEditResponsibilityCentreClick,
  onEditCustomerVendorClick,
}: ReviewStepProps) => {
  const { t } = useTranslation();
  
  // Helper function to determine if customer/vendor section should be shown
  const shouldShowCustomerVendor = () => {
    return selectedType?.tierType === TierType.Customer || selectedType?.tierType === TierType.Vendor;
  };

  // Helper function to get tier type string
  const getTierTypeString = (tierType?: TierType): string => {
    switch (tierType) {
      case TierType.Customer:
        return "Customer";
      case TierType.Vendor:
        return "Vendor";
      default:
        return "None";
    }
  };

  // Helper function to get tier type icon
  const getTierTypeIcon = (tierType?: TierType) => {
    switch (tierType) {
      case TierType.Customer:
        return <UserCheck className="h-4 w-4 text-green-400" />;
      case TierType.Vendor:
        return <Package className="h-4 w-4 text-orange-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  // Helper function to get the code property based on tier type
  const getCustomerVendorCode = (): string => {
    if (!selectedCustomerVendor) return "N/A";
    return selectedType?.tierType === TierType.Customer 
      ? selectedCustomerVendor.code 
      : selectedCustomerVendor.vendorCode;
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="text-center mb-3">
        <div className="inline-flex items-center justify-center p-2 bg-green-900/20 rounded-full mb-2">
          <Check className="h-5 w-5 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-white">{t("documents.reviewYourDocument")}</h3>
        <p className="text-sm text-gray-400">
          {t("documents.pleaseReviewDocumentDetails")}
        </p>
      </div>

      {/* Document Type & Subtype */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-400" />
              {t("documents.documentType")}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {t("documents.typeAndSeriesInformation")}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditTypeClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Type</p>
              <p className="text-sm text-white">
                {selectedType?.typeName || "N/A"}{" "}
                <span className="text-gray-400">
                  ({selectedType?.typeKey || "N/A"})
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Series</p>
              <p className="text-sm text-white">
                {selectedSubType?.name || "N/A"}
              </p>
            </div>
          </div>
          {selectedSubType && (
            <div className="pt-1">
              <p className="text-xs text-gray-400">Valid Period</p>
              <p className="text-sm text-white">
                {format(new Date(selectedSubType.startDate), "PP")} -{" "}
                {format(new Date(selectedSubType.endDate), "PP")}
              </p>
            </div>
          )}
          {selectedType?.tierType !== TierType.None && (
            <div className="pt-1 border-t border-gray-800/50">
              <p className="text-xs text-gray-400">Tier Type</p>
              <div className="flex items-center gap-2 mt-1">
                {getTierTypeIcon(selectedType?.tierType)}
                <span className="text-sm text-white">
                  {getTierTypeString(selectedType?.tierType)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer/Vendor Information */}
      {shouldShowCustomerVendor() && (
        <Card className="bg-[#0a1033]/80 border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-md text-white flex items-center gap-2">
                {getTierTypeIcon(selectedType?.tierType)}
                {getTierTypeString(selectedType?.tierType)} Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Selected {getTierTypeString(selectedType?.tierType).toLowerCase()} details
              </CardDescription>
            </div>
            {onEditCustomerVendorClick && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-900/20"
                onClick={onEditCustomerVendorClick}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Code</p>
                <p className="text-sm text-white font-mono">
                  {getCustomerVendorCode()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm text-white">
                  {customerVendorName || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="text-sm text-white">
                {customerVendorAddress || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">City</p>
                <p className="text-sm text-white">
                  {customerVendorCity || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Country</p>
                <p className="text-sm text-white">
                  {customerVendorCountry || "N/A"}
                </p>
              </div>
            </div>
            {selectedCustomerVendor && (
              <div className="pt-2 mt-2 border-t border-gray-800/50">
                <div className="flex items-start gap-2 bg-blue-900/20 p-2 rounded-md">
                  <Info className="h-4 w-4 mt-0.5 text-blue-400" />
                  <p className="text-xs text-gray-300">
                    The information above can be modified for this document without affecting the original {getTierTypeString(selectedType?.tierType).toLowerCase()} record.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Responsibility Centre */}
      {responsibilityCentreName && (
        <Card className="bg-[#0a1033]/80 border-gray-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-md text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                Responsibility Centre
              </CardTitle>
              <CardDescription className="text-gray-400">
                {userHasAssignedCentre
                  ? "Automatically assigned from your profile"
                  : "Selected for this document"}
              </CardDescription>
            </div>
            {!userHasAssignedCentre && onEditResponsibilityCentreClick && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-900/20"
                onClick={onEditResponsibilityCentreClick}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Centre:</span>
              <span className="font-medium">{responsibilityCentreName}</span>
            </div>
            {userHasAssignedCentre === true ? (
              <div className="flex items-center space-x-2 mt-2 bg-blue-900/20 p-2 rounded">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-blue-300">
                  This document is automatically assigned to your responsibility
                  centre.
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mt-2 bg-blue-900/20 p-2 rounded">
                <Info className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-blue-300">
                  You selected this responsibility centre during document
                  creation.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Details */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-md text-white flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-blue-400" />
              Document Details
            </CardTitle>
            {isExternal && (
              <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> External
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditDetailsClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Title</p>
            <p className="text-sm text-white">{title || "N/A"}</p>
          </div>

          {isExternal ? (
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <ExternalLink className="h-3 w-3 text-blue-400" /> External
                Reference
              </p>
              <p className="text-sm text-white">{externalReference || "N/A"}</p>
            </div>
          ) : (
            documentAlias && (
              <div>
                <p className="text-xs text-gray-400">Alias</p>
                <p className="text-sm text-white">{documentAlias}</p>
              </div>
            )
          )}

          {isExternal && (
            <div className="pt-2 mt-2 border-t border-gray-800/50">
              <div className="flex items-start gap-2 bg-blue-900/20 p-2 rounded-md">
                <ExternalLink className="h-4 w-4 mt-0.5 text-blue-400" />
                <p className="text-xs text-gray-300">
                  This document is marked as external. The external reference
                  will be sent as "documentExterne" and will completely replace
                  the alias field.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Date */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Document Dates
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditDateClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-400 mr-2" />
                <p className="text-xs text-gray-400">Document Date</p>
              </div>
              <p className="text-sm text-white">
                {docDate ? format(new Date(docDate), "PPP") : "N/A"}
              </p>
            </div>

            <div>
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-green-400 mr-2" />
                <p className="text-xs text-gray-400">Accounting Date</p>
              </div>
              <p className="text-sm text-white">
                {comptableDate
                  ? format(new Date(comptableDate), "PPP")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circuit Information */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-400" />
              Circuit Assignment
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditCircuitClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white">
            {circuitName || "No circuit assigned"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This document will be processed according to the {circuitName}{" "}
            workflow
          </p>
        </CardContent>
      </Card>

      {/* Document Content */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Document Content
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditContentClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-md p-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {content || "No content provided"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
