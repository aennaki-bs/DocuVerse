import { useState, useEffect } from "react";
import { Edit, CheckCircle2, Ban, Calculator, Package, Archive, Loader2 } from "lucide-react";
import { Document, Ligne, UpdateLigneRequest } from "@/models/document";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import lineElementsService from "@/services/lineElementsService";
import locationService from "@/services/locationService";
import {
  LignesElementTypeSimple,
  ItemSimple,
  GeneralAccountsSimple,
  ItemUnitOfMeasure,
  Item,
} from "@/models/lineElements";
import { LocationSimpleDto } from "@/models/location";
import { calculateLigneAmounts } from "@/utils/ligneCalculations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditLigneDialogProps {
  document: Document;
  ligne: Ligne | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  ligneKey: string;
  title: string;
  article: string;
  lignesElementTypeId?: number;
  selectedElementCode?: string;
  locationCode?: string;
  unitCode?: string;
  quantity: number;
  priceHT: number;
  discountPercentage: number;
  discountAmount?: number;
  vatPercentage: number;
  useFixedDiscount: boolean;
}

const EditLigneDialog = ({
  document,
  ligne,
  isOpen,
  onOpenChange,
}: EditLigneDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    ligneKey: "",
    title: "",
    article: "",
    quantity: 1,
    priceHT: 0,
    discountPercentage: 0,
    vatPercentage: 0.2,
    useFixedDiscount: false,
  });

  // Dropdown data
  const [elementTypes, setElementTypes] = useState<LignesElementTypeSimple[]>([]);
  const [items, setItems] = useState<ItemSimple[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccountsSimple[]>([]);
  const [availableElements, setAvailableElements] = useState<(ItemSimple | GeneralAccountsSimple)[]>([]);
  const [loadingElements, setLoadingElements] = useState(false);
  const [locations, setLocations] = useState<LocationSimpleDto[]>([]);
  const [itemUnits, setItemUnits] = useState<ItemUnitOfMeasure[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<Item | null>(null);

  const queryClient = useQueryClient();

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [typesData, locationsData] = await Promise.all([
          lineElementsService.elementTypes.getSimple(),
          locationService.getSimple(),
        ]);
        
        setElementTypes(typesData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
        toast.error("Failed to load form data");
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  // Load elements dynamically based on selected element type
  useEffect(() => {
    const loadElements = async () => {
      if (!formValues.lignesElementTypeId) {
        setAvailableElements([]);
        return;
      }

      const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
      if (!selectedType) return;

      setLoadingElements(true);
      try {
        if (selectedType.typeElement === 'Item') {
          const itemsData = await lineElementsService.items.getSimple();
          setItems(itemsData);
          setAvailableElements(itemsData);
        } else if (selectedType.typeElement === 'GeneralAccounts') {
          const accountsData = await lineElementsService.generalAccounts.getSimple();
          setGeneralAccounts(accountsData);
          setAvailableElements(accountsData);
        }
      } catch (error) {
        console.error("Failed to load elements:", error);
        toast.error("Failed to load available elements");
      } finally {
        setLoadingElements(false);
      }
    };

    loadElements();
  }, [formValues.lignesElementTypeId, elementTypes]);

  // Fetch item units when item is selected
  useEffect(() => {
    const fetchItemUnits = async () => {
      if (!formValues.selectedElementCode) {
        setItemUnits([]);
        setSelectedItemDetails(null);
        setFormValues(prev => ({ ...prev, unitCode: undefined }));
        return;
      }

      const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
      if (selectedType?.typeElement !== 'Item') {
        setItemUnits([]);
        setSelectedItemDetails(null);
        setFormValues(prev => ({ ...prev, unitCode: undefined }));
        return;
      }

      setLoadingUnits(true);
      try {
        // First get the item details to find the default unit
        const [units, itemDetails] = await Promise.all([
          lineElementsService.items.getItemUnits(formValues.selectedElementCode),
          lineElementsService.items.getByCode(formValues.selectedElementCode)
        ]);
        
        setItemUnits(units);
        setSelectedItemDetails(itemDetails);
        
        // Only auto-select unit if it's not already set (preserve existing selection)
        if (!formValues.unitCode) {
          if (units.length === 1) {
            // Auto-select unit if only one exists
            setFormValues(prev => ({ ...prev, unitCode: units[0].unitOfMeasureCode }));
          } else if (units.length > 1) {
            // Multiple units - pre-select the default unit from Item table
            const defaultUnitCode = itemDetails.unite;
            const defaultUnit = defaultUnitCode 
              ? units.find(unit => unit.unitOfMeasureCode === defaultUnitCode)
              : units[0]; // Fallback to first unit if no default found
            
            setFormValues(prev => ({ ...prev, unitCode: defaultUnit?.unitOfMeasureCode || units[0].unitOfMeasureCode }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch item units:", error);
        setItemUnits([]);
        setSelectedItemDetails(null);
        setFormValues(prev => ({ ...prev, unitCode: undefined }));
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchItemUnits();
  }, [formValues.selectedElementCode, formValues.lignesElementTypeId, elementTypes]);

  // Populate form when ligne changes
  useEffect(() => {
    if (ligne) {
      // Determine selectedElementCode based on the element type
      let selectedElementCode: string | undefined;
      if (ligne.itemCode) {
        selectedElementCode = ligne.itemCode;
      } else if (ligne.generalAccountsCode) {
        selectedElementCode = ligne.generalAccountsCode;
      }

      setFormValues({
        ligneKey: ligne.ligneKey,
        title: ligne.title,
        article: ligne.article,
        lignesElementTypeId: ligne.lignesElementTypeId,
        selectedElementCode: selectedElementCode,
        locationCode: ligne.locationCode,
        unitCode: ligne.unitCode,
        quantity: ligne.quantity,
        priceHT: ligne.priceHT,
        discountPercentage: ligne.discountPercentage,
        discountAmount: ligne.discountAmount,
        vatPercentage: ligne.vatPercentage,
        useFixedDiscount: !!ligne.discountAmount,
      });
    }
  }, [ligne]);

  // Calculate amounts using centralized utility
  const calculateAmounts = () => {
    return calculateLigneAmounts(
      formValues.quantity,
      formValues.priceHT,
      formValues.discountPercentage,
      formValues.discountAmount,
      formValues.vatPercentage,
      formValues.useFixedDiscount,
      formValues.unitCode,
      selectedItemDetails || undefined,
      itemUnits
    );
  };

  const handleFieldChange = (key: keyof FormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const getSelectedElementType = () => {
    return elementTypes.find(t => t.id === formValues.lignesElementTypeId);
  };

  const getSelectedElement = () => {
    return availableElements.find(el => el.code === formValues.selectedElementCode);
  };

  const handleUpdateLigne = async () => {
    if (!ligne) return;

    try {
      setIsSubmitting(true);
      
      // Calculate amounts to send to backend
      const calculatedAmounts = calculateAmounts();
      
      const updateRequest: UpdateLigneRequest = {
        ligneKey: formValues.ligneKey,
        title: formValues.title,
        article: formValues.article,
        lignesElementTypeId: formValues.lignesElementTypeId,
        selectedElementCode: formValues.selectedElementCode,
        locationCode: formValues.locationCode,
        unitCode: formValues.unitCode,
        quantity: formValues.quantity,
        priceHT: calculatedAmounts.adjustedPriceHT, // Send adjusted price (unit price * ratio)
        discountPercentage: formValues.discountPercentage,
        discountAmount: calculatedAmounts.discountAmount, // Send calculated discount amount
        vatPercentage: formValues.vatPercentage,
        originalPriceHT: formValues.priceHT, // Send original price for reference
      };

      await documentService.updateLigne(ligne.id, updateRequest);
      toast.success("Line updated successfully");
      onOpenChange(false);

      // Refresh document data
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({
        queryKey: ["documentLignes", document.id],
      });
    } catch (error) {
      console.error("Failed to update line:", error);
      toast.error("Failed to update line");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price with MAD currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const { amountHT, amountVAT, amountTTC, discountAmount } = calculateAmounts();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-blue-900/90 border-white/10 text-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-300">
            <Edit className="h-5 w-5 mr-2" /> Edit Line
          </DialogTitle>
        </DialogHeader>

        {/* ERP Protection Message */}
        {ligne?.erpLineCode && (
          <div className="flex items-center gap-3 p-4 bg-orange-900/20 rounded-md border border-orange-500/30 mb-4">
            <Archive className="h-8 w-8 text-orange-400 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-200 mb-1">
                Line Archived to ERP
              </h3>
              <p className="text-sm text-orange-300/80">
                This line has been archived to the ERP system and cannot be modified.
              </p>
              <p className="text-xs text-orange-300/60 mt-1">
                ERP Line Code: <span className="font-mono">{ligne.erpLineCode}</span>
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-950/40">
            <TabsTrigger value="basic" className="text-blue-200" disabled={!!ligne?.erpLineCode}>Basic Info</TabsTrigger>
            <TabsTrigger value="elements" className="text-blue-200" disabled={!!ligne?.erpLineCode}>Elements</TabsTrigger>
            <TabsTrigger value="pricing" className="text-blue-200" disabled={!!ligne?.erpLineCode}>Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ligneKey" className="text-blue-200">
                Line Key
              </Label>
              <Input
                id="edit-ligneKey"
                value={formValues.ligneKey}
                onChange={(e) => handleFieldChange("ligneKey", e.target.value)}
                placeholder="Line key"
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-blue-200">
                Title<span className="text-red-400">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formValues.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter line title"
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-article" className="text-blue-200">
                Article Description<span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="edit-article"
                value={formValues.article}
                onChange={(e) => handleFieldChange("article", e.target.value)}
                placeholder="Enter article description"
                rows={4}
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
          </TabsContent>

          <TabsContent value="elements" className="space-y-6">
            <div className="space-y-6">
              {/* Element Type Selection */}
              <div className="space-y-3">
                <Label htmlFor="typeId" className="text-blue-200 text-base font-medium">
                  Element Type<span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formValues.lignesElementTypeId?.toString()}
                  onValueChange={(value) => {
                    const lignesElementTypeId = value ? parseInt(value) : undefined;
                    handleFieldChange("lignesElementTypeId", lignesElementTypeId);
                    // Reset element selection when type changes
                    handleFieldChange("selectedElementCode", undefined);
                    handleFieldChange("locationCode", undefined);
                    handleFieldChange("unitCode", undefined);
                  }}
                >
                  <SelectTrigger className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base">
                    <SelectValue placeholder="Select element type" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950 border-blue-400/20">
                    {elementTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()} className="text-white hover:bg-blue-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            type.typeElement === 'Item' ? 'bg-green-400' :
                            type.typeElement === 'GeneralAccounts' ? 'bg-purple-400' :
                            'bg-purple-400'
                          }`}></div>
                          <div>
                            <div className="font-medium">{type.code} - {type.typeElement}</div>
                            <div className="text-sm text-gray-400">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Element Selection */}
              {formValues.lignesElementTypeId && (
                <div className="space-y-3">
                  <Label htmlFor="selectedElementCode" className="text-blue-200 text-base font-medium">
                    Select {getSelectedElementType()?.typeElement === 'Item' ? 'Item' : 'General Account'}<span className="text-red-400">*</span>
                  </Label>
                  
                  {loadingElements ? (
                    <div className="flex items-center justify-center p-8 bg-blue-950/30 rounded-lg border border-blue-400/20">
                      <Loader2 className="h-6 w-6 text-blue-400 animate-spin mr-2" />
                      <span className="text-blue-300">Loading available elements...</span>
                    </div>
                  ) : (
                    <Select
                      value={formValues.selectedElementCode || ""}
                      onValueChange={(value) => handleFieldChange("selectedElementCode", value || undefined)}
                    >
                      <SelectTrigger className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base">
                        <SelectValue placeholder={`Select ${getSelectedElementType()?.typeElement === 'Item' ? 'an item' : 'a general account'}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-950 border-blue-400/20 max-h-60">
                        {availableElements.map((element) => (
                          <SelectItem key={element.code} value={element.code} className="text-white hover:bg-blue-800">
                            <div className="flex flex-col">
                              <div className="font-medium">{element.code}</div>
                              <div className="text-sm text-gray-400">{element.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Unit of Measure Selection - Only for Item types */}
              {formValues.lignesElementTypeId && getSelectedElementType()?.typeElement === 'Item' && formValues.selectedElementCode && (
                <div className="space-y-3">
                  <Label htmlFor="unitCode" className="text-blue-200 text-base font-medium">
                    Unit of Measure<span className="text-red-400">*</span>
                  </Label>
                  
                  {loadingUnits ? (
                    <div className="flex items-center justify-center p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin mr-2" />
                      <span className="text-blue-300 text-sm">Loading available units...</span>
                    </div>
                  ) : itemUnits.length === 0 ? (
                    <div className="p-4 bg-yellow-950/30 rounded-lg border border-yellow-400/20">
                      <p className="text-yellow-300 text-sm">
                        No units of measure found for this item. Please contact an administrator.
                      </p>
                    </div>
                  ) : itemUnits.length === 1 ? (
                    <div className="p-4 bg-green-950/30 rounded-lg border border-green-400/20">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                          <Package className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-green-200 font-medium">
                            {itemUnits[0].unitOfMeasureCode} - {itemUnits[0].unitOfMeasureDescription}
                          </h4>
                          <p className="text-green-300/70 text-sm">
                            Auto-selected (only unit available) • Ratio: {itemUnits[0].qtyPerUnitOfMeasure}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Select
                      value={formValues.unitCode || ""}
                      onValueChange={(value) => handleFieldChange("unitCode", value || undefined)}
                    >
                      <SelectTrigger className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base">
                        <SelectValue placeholder="Select unit of measure" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-950 border-blue-400/20 max-h-60">
                        {itemUnits.map((unit) => (
                          <SelectItem key={unit.unitOfMeasureCode} value={unit.unitOfMeasureCode} className="text-white hover:bg-blue-800">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{unit.unitOfMeasureCode} - {unit.unitOfMeasureDescription}</span>
                                {selectedItemDetails?.unite === unit.unitOfMeasureCode && (
                                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">Default</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">Ratio: {unit.qtyPerUnitOfMeasure}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Show info about selected unit */}
                  {itemUnits.length > 1 && formValues.unitCode && (
                    <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-400/10">
                      <p className="text-blue-300 text-sm">
                        {selectedItemDetails?.unite === formValues.unitCode 
                          ? `✓ Selected default unit: ${formValues.unitCode}` 
                          : `✓ Selected unit: ${formValues.unitCode}`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Location Selection - Only for Item types */}
              {formValues.lignesElementTypeId && getSelectedElementType()?.typeElement === 'Item' && (
                <div className="space-y-3">
                  <Label htmlFor="locationCode" className="text-blue-200 text-base font-medium">
                    Location<span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formValues.locationCode || ""}
                    onValueChange={(value) => handleFieldChange("locationCode", value || undefined)}
                  >
                    <SelectTrigger className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-950 border-blue-400/20 max-h-60">
                      {locations.map((location) => (
                        <SelectItem key={location.locationCode} value={location.locationCode} className="text-white hover:bg-blue-800">
                          <div className="flex flex-col">
                            <div className="font-medium">{location.locationCode}</div>
                            <div className="text-sm text-gray-400">{location.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Information card about the selected element */}
              {formValues.selectedElementCode && getSelectedElement() && (
                <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-blue-200 font-medium mb-1">
                        {getSelectedElement()?.code} - {getSelectedElementType()?.typeElement}
                      </h4>
                      <p className="text-blue-300/70 text-sm">
                        {getSelectedElement()?.description}
                      </p>
                      <p className="text-blue-400/60 text-xs mt-2">
                        This element is linked to your line item.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Help text when no element type is selected */}
              {!formValues.lignesElementTypeId && (
                <div className="p-6 bg-gray-950/30 rounded-lg border border-gray-500/20 text-center">
                  <div className="bg-gray-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-300 font-medium mb-2">Choose an Element Type</h4>
                  <p className="text-gray-400 text-sm">
                    Start by selecting the type of element you want to edit for this line.
                  </p>
                </div>
              )}

              {formValues.lignesElementTypeId && !formValues.selectedElementCode && !loadingElements && (
                <div className="p-6 bg-gray-950/30 rounded-lg border border-gray-500/20 text-center">
                  <div className="bg-gray-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-300 font-medium mb-2">Select Specific Element</h4>
                  <p className="text-gray-400 text-sm">
                    Now choose the specific {getSelectedElementType()?.typeElement === 'Item' ? 'item' : 'general account'} you want to reference.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-blue-200">
                  Quantity<span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formValues.quantity || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleFieldChange("quantity", 0);
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        handleFieldChange("quantity", numValue);
                      }
                    }
                  }}
                  placeholder="1"
                  min="0"
                  step="any"
                  className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priceHT" className="text-blue-200">
                  Unit Price (HT)<span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="edit-priceHT"
                    type="number"
                    value={formValues.priceHT || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleFieldChange("priceHT", 0);
                      } else {
                        const numValue = Number(value);
                        if (!isNaN(numValue)) {
                          handleFieldChange("priceHT", numValue);
                        }
                      }
                    }}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400 pl-12"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-blue-900/30 border-r border-blue-400/20 text-blue-300 font-medium rounded-l-md">
                    MAD
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Section */}
            <div className="space-y-4 p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
              <div className="flex items-center justify-between">
                <Label className="text-blue-200">Use Fixed Discount Amount</Label>
                <Switch
                  checked={formValues.useFixedDiscount}
                  onCheckedChange={(checked) => handleFieldChange("useFixedDiscount", checked)}
                />
              </div>

              {formValues.useFixedDiscount ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-discountAmount" className="text-blue-200">
                    Discount Amount (MAD)
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-discountAmount"
                      type="number"
                      value={formValues.discountAmount || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFieldChange("discountAmount", value === "" ? undefined : Number(value));
                      }}
                      placeholder="0.00"
                      min="0"
                      step="any"
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400 pl-12"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-blue-900/30 border-r border-blue-400/20 text-blue-300 font-medium rounded-l-md">
                      MAD
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-discountPercentage" className="text-blue-200">
                    Discount Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-discountPercentage"
                      type="number"
                      value={Math.round(formValues.discountPercentage * 100 * 100) / 100}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          handleFieldChange("discountPercentage", 0);
                        } else {
                          const percentageValue = Number(value);
                          if (!isNaN(percentageValue)) {
                            handleFieldChange("discountPercentage", percentageValue / 100);
                          }
                        }
                      }}
                      placeholder="0.0"
                      min="0"
                      max="100"
                      step="any"
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400 pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none bg-blue-900/30 border-l border-blue-400/20 text-blue-300 font-medium rounded-r-md">
                      %
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vatPercentage" className="text-blue-200">
                VAT Percentage<span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="edit-vatPercentage"
                  type="number"
                  value={Math.round(formValues.vatPercentage * 100 * 100) / 100}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleFieldChange("vatPercentage", 0);
                    } else {
                      const percentageValue = Number(value);
                      if (!isNaN(percentageValue)) {
                        handleFieldChange("vatPercentage", percentageValue / 100);
                      }
                    }
                  }}
                  placeholder="20.0"
                  min="0"
                  max="100"
                  step="any"
                  className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400 pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none bg-blue-900/30 border-l border-blue-400/20 text-blue-300 font-medium rounded-r-md">
                  %
                </div>
              </div>
            </div>

            {/* Live calculation preview */}
            <div className="p-4 bg-green-950/30 rounded-lg border border-green-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-green-400" />
                <h4 className="text-green-200 font-medium">Calculation Preview</h4>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-orange-400">Amount Discount:</span>
                  <div className="text-white font-medium">{formatPrice(discountAmount)}</div>
                </div>
                <div>
                  <span className="text-blue-400">Amount HT:</span>
                  <div className="text-white font-medium">{formatPrice(amountHT)}</div>
                </div>
                <div>
                  <span className="text-purple-400">VAT:</span>
                  <div className="text-white font-medium">{formatPrice(amountVAT)}</div>
                </div>
                <div>
                  <span className="text-green-400">TTC:</span>
                  <div className="text-white font-medium">{formatPrice(amountTTC)}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          >
            <Ban className="h-4 w-4 mr-2" /> {ligne?.erpLineCode ? "Close" : "Cancel"}
          </Button>
          {!ligne?.erpLineCode && (
            <Button
              onClick={handleUpdateLigne}
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${
                isSubmitting ? "opacity-70" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLigneDialog;
