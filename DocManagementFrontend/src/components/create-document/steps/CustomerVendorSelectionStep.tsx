import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Building2, Users, UserCheck, Package, Check, ChevronsUpDown, Search } from "lucide-react";
import { DocumentType, TierType } from "@/models/document";
import customerService from "@/services/customerService";
import vendorService from "@/services/vendorService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerVendorSelectionStepProps {
  selectedTypeId: number | null;
  documentTypes: DocumentType[];
  selectedCustomerVendor: any;
  customerVendorName: string;
  customerVendorAddress: string;
  customerVendorCity: string;
  customerVendorCountry: string;
  onCustomerVendorSelect: (customerVendor: any) => void;
  onNameChange: (name: string) => void;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
}

export const CustomerVendorSelectionStep = ({
  selectedTypeId,
  documentTypes,
  selectedCustomerVendor,
  customerVendorName,
  customerVendorAddress,
  customerVendorCity,
  customerVendorCountry,
  onCustomerVendorSelect,
  onNameChange,
  onAddressChange,
  onCityChange,
  onCountryChange,
}: CustomerVendorSelectionStepProps) => {
  const { t, tWithParams } = useTranslation();
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const lastSelectedRef = useRef<any>(null);

  const selectedType = documentTypes.find(t => t.id === selectedTypeId);
  const tierType = selectedType?.tierType;

  // Helper function to get string representation of TierType
  const getTierTypeString = (type: TierType): string => {
    switch (type) {
      case TierType.Customer:
        return "customer";
      case TierType.Vendor:
        return "vendor";
      default:
        return "none";
    }
  };

  // Helper function to get the code property based on tier type
  const getCodeProperty = (item: any, tierType: TierType): string => {
    return tierType === TierType.Customer ? item.code : item.vendorCode;
  };

  // Fetch customers or vendors based on tierType
  useEffect(() => {
    const fetchData = async () => {
      if (!tierType || tierType === TierType.None) return;

      setIsLoading(true);
      try {
        if (tierType === TierType.Customer) {
          const customerData = await customerService.getAll();
          setCustomers(customerData);
        } else if (tierType === TierType.Vendor) {
          const vendorData = await vendorService.getAll();
          setVendors(vendorData);
        }
      } catch (error) {
        const tierTypeString = getTierTypeString(tierType);
        console.error(`Failed to fetch ${tierTypeString}s:`, error);
        toast.error(`Failed to load ${tierTypeString}s`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tierType]);

  // Pre-fill form when a customer/vendor is selected (only on initial selection)
  useEffect(() => {
    if (selectedCustomerVendor && selectedCustomerVendor !== lastSelectedRef.current) {
      onNameChange(selectedCustomerVendor.name || "");
      onAddressChange(selectedCustomerVendor.address || "");
      onCityChange(selectedCustomerVendor.city || "");
      onCountryChange(selectedCustomerVendor.country || "");
      lastSelectedRef.current = selectedCustomerVendor;
    }
  }, [selectedCustomerVendor, onNameChange, onAddressChange, onCityChange, onCountryChange]);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    const dataSource = tierType === TierType.Customer ? customers : vendors;
    if (!searchQuery) return dataSource;
    
    return dataSource.filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCodeProperty(item, tierType!).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, vendors, searchQuery, tierType]);

  const handleSelection = (value: string) => {
    const dataSource = tierType === TierType.Customer ? customers : vendors;
    const selected = dataSource.find(item => getCodeProperty(item, tierType!) === value);
    onCustomerVendorSelect(selected);
    setSearchQuery("");
    setOpen(false);
  };

  const renderTierIcon = () => {
    switch (tierType) {
      case TierType.Customer:
        return <UserCheck className="h-6 w-6 text-green-400" />;
      case TierType.Vendor:
        return <Package className="h-6 w-6 text-orange-400" />;
      default:
        return <Users className="h-6 w-6 text-gray-400" />;
    }
  };

  // If tierType is None, skip this step
  if (!tierType || tierType === TierType.None) {
    return (
      <Card className="bg-[#1e2a4a] border-blue-900/40">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium text-blue-100 mb-2">
              {t("documents.noCustomerVendorRequired")}
            </h3>
            <p className="text-blue-300/70">
              {t("documents.noCustomerVendorDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e2a4a] border-blue-900/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          {renderTierIcon()}
          <div>
            <CardTitle className="text-blue-100">
              {tierType === TierType.Customer ? t("documents.selectCustomer") : t("documents.selectVendor")}
            </CardTitle>
            <p className="text-sm text-blue-300/70 mt-1">
              {tierType === TierType.Customer ? t("documents.chooseCustomerAndReview") : t("documents.chooseVendorAndReview")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Dropdown */}
        <div className="space-y-2">
          <Label className="text-blue-200">
            {tierType === TierType.Customer ? t("documents.customer") : t("documents.vendor")} *
          </Label>
                      <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={isLoading}
                  className={cn(
                    "w-full justify-between bg-[#111633] border-blue-900/40 text-white hover:bg-[#1a1f3a]",
                    !selectedCustomerVendor && "text-gray-400"
                  )}
                >
                  {selectedCustomerVendor 
                    ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue-300">
                            {getCodeProperty(selectedCustomerVendor, tierType!)}
                          </span>
                          <span>{selectedCustomerVendor.name}</span>
                        </div>
                      )
                    : isLoading 
                      ? tWithParams("documents.loadingItems", { type: getTierTypeString(tierType!) })
                      : tWithParams("documents.selectItem", { type: getTierTypeString(tierType!) })
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0 bg-[#111633] border-blue-900/40">
                <div className="flex flex-col">
                  {/* Search Input */}
                  <div className="p-3 border-b border-blue-900/40">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={tWithParams("documents.searchItems", { type: getTierTypeString(tierType!) })}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-[#1a1f3a] border-blue-900/40 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  
                  {/* Scrollable List */}
                  <div 
                    className="max-h-[200px] overflow-y-auto p-1"
                    style={{ 
                      WebkitOverflowScrolling: 'touch',
                      scrollBehavior: 'smooth'
                    }}
                    onWheel={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {filteredItems.length === 0 ? (
                      <div className="text-gray-400 py-4 px-3 text-center">
                        {tWithParams("documents.noItemsFound", { type: getTierTypeString(tierType!) })}
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const isSelected = selectedCustomerVendor && 
                          getCodeProperty(selectedCustomerVendor, tierType!) === getCodeProperty(item, tierType!);
                        
                        return (
                          <div
                            key={getCodeProperty(item, tierType!)}
                            onClick={() => handleSelection(getCodeProperty(item, tierType!))}
                            className={cn(
                              "flex items-center gap-2 p-2 m-1 rounded cursor-pointer transition-colors",
                              "hover:bg-blue-900/30 text-white",
                              isSelected && "bg-blue-900/40"
                            )}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={cn(
                                "font-mono text-xs",
                                tierType === TierType.Customer ? "text-blue-300" : "text-orange-300"
                              )}>
                                {getCodeProperty(item, tierType!)}
                              </span>
                              <span className="truncate">{item.name}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </PopoverContent>
          </Popover>
        </div>

        {/* Editable Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-blue-200">{t("common.name")} *</Label>
            <Input
              value={customerVendorName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("documents.enterName")}
              className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-200">{t("documents.city")}</Label>
            <Input
              value={customerVendorCity}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder={t("documents.enterCity")}
              className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-blue-200">{t("documents.address")}</Label>
          <Input
            value={customerVendorAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t("documents.enterAddress")}
            className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-blue-200">{t("documents.country")}</Label>
          <Input
            value={customerVendorCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder={t("documents.enterCountry")}
            className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
          />
        </div>

        {selectedCustomerVendor && (
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/40">
            <h4 className="text-sm font-medium text-blue-200 mb-2">
              {tierType === TierType.Customer ? t("documents.selectedCustomer") : t("documents.selectedVendor")}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-400">{t("documents.code")}:</span>
                <span className="text-white ml-2 font-mono">
                  {getCodeProperty(selectedCustomerVendor, tierType)}
                </span>
              </div>
              <div>
                <span className="text-blue-400">{t("documents.originalName")}:</span>
                <span className="text-white ml-2">
                  {selectedCustomerVendor.name}
                </span>
              </div>
            </div>
            <p className="text-xs text-blue-300/70 mt-2">
              {tWithParams("documents.modifyInformationNote", { type: getTierTypeString(tierType) })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 