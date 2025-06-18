import { useState, useEffect } from "react";
import { Edit, CheckCircle2, Ban, Calculator, Package } from "lucide-react";
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
} from "@/models/lineElements";
import { LocationSimpleDto } from "@/models/location";
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
  locationCode?: string;
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
  const [generalAccounts, setGeneralAccountsSimple] = useState<GeneralAccountsSimple[]>([]);
  const [locations, setLocations] = useState<LocationSimpleDto[]>([]);

  const queryClient = useQueryClient();

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [typesData, itemsData, accountsData, locationsData] = await Promise.all([
          lineElementsService.elementTypes.getSimple(),
          lineElementsService.items.getSimple(),
          lineElementsService.generalAccounts.getSimple(),
          locationService.getSimple(),
        ]);
        
        setElementTypes(typesData);
        setItems(itemsData);
        setGeneralAccountsSimple(accountsData);
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

  // Populate form when ligne changes
  useEffect(() => {
    if (ligne) {
      setFormValues({
        ligneKey: ligne.ligneKey,
        title: ligne.title,
        article: ligne.article,
        lignesElementTypeId: ligne.lignesElementTypeId,
        locationCode: ligne.locationCode,
        quantity: ligne.quantity,
        priceHT: ligne.priceHT,
        discountPercentage: ligne.discountPercentage,
        discountAmount: ligne.discountAmount,
        vatPercentage: ligne.vatPercentage,
        useFixedDiscount: !!ligne.discountAmount,
      });
    }
  }, [ligne]);

  // Calculate amounts
  const calculateAmounts = () => {
    const { quantity, priceHT, discountPercentage, discountAmount, vatPercentage, useFixedDiscount } = formValues;
    
    // Calculate discount amount based on the formula: Amount Discount = % Discount * (Price HT * Quantity)
    let calculatedDiscountAmount: number;
    if (useFixedDiscount && discountAmount) {
      calculatedDiscountAmount = discountAmount;
    } else {
      calculatedDiscountAmount = discountPercentage * (priceHT * quantity);
    }
    
    let amountHT: number;
    if (useFixedDiscount && discountAmount) {
      amountHT = priceHT * quantity - discountAmount;
    } else {
      amountHT = priceHT * quantity * (1 - discountPercentage);
    }
    
    const amountVAT = amountHT * vatPercentage;
    const amountTTC = amountHT + amountVAT;
    
    return { amountHT, amountVAT, amountTTC, discountAmount: calculatedDiscountAmount };
  };

  const handleFieldChange = (key: keyof FormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateLigne = async () => {
    if (!ligne) return;

    try {
      setIsSubmitting(true);
      
      const updateRequest: UpdateLigneRequest = {
        ligneKey: formValues.ligneKey,
        title: formValues.title,
        article: formValues.article,
        lignesElementTypeId: formValues.lignesElementTypeId,
        selectedElementCode: undefined,
        locationCode: formValues.locationCode,
        quantity: formValues.quantity,
        priceHT: formValues.priceHT,
        discountPercentage: formValues.discountPercentage,
        discountAmount: formValues.useFixedDiscount ? formValues.discountAmount : undefined,
        vatPercentage: formValues.vatPercentage,
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

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-950/40">
            <TabsTrigger value="basic" className="text-blue-200">Basic Info</TabsTrigger>
            <TabsTrigger value="elements" className="text-blue-200">Elements</TabsTrigger>
            <TabsTrigger value="pricing" className="text-blue-200">Pricing</TabsTrigger>
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
              <div className="space-y-3">
                <Label htmlFor="typeId" className="text-blue-200 text-base font-medium">
                  Element Type
                </Label>
                <Select
                  value={formValues.lignesElementTypeId?.toString()}
                  onValueChange={(value) => {
                    const typeId = value ? parseInt(value) : undefined;
                    handleFieldChange("lignesElementTypeId", typeId);
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
                            type.typeElement === 'Unite code' ? 'bg-yellow-400' :
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

              {/* Information card about the selected element type */}
              {formValues.lignesElementTypeId && (
                <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-blue-200 font-medium mb-1">
                        {elementTypes.find(t => t.id === formValues.lignesElementTypeId)?.code} - {elementTypes.find(t => t.id === formValues.lignesElementTypeId)?.typeElement}
                      </h4>
                      <p className="text-blue-300/70 text-sm">
                        {elementTypes.find(t => t.id === formValues.lignesElementTypeId)?.description}
                      </p>
                      <p className="text-blue-400/60 text-xs mt-2">
                        This element type is automatically linked to its associated {elementTypes.find(t => t.id === formValues.lignesElementTypeId)?.typeElement.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Selection - Only for Item types */}
              {formValues.lignesElementTypeId && 
                elementTypes.find(t => t.id === formValues.lignesElementTypeId)?.typeElement === 'Item' && (
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

              {/* Help text when no element type is selected */}
              {!formValues.lignesElementTypeId && (
                <div className="p-6 bg-gray-950/30 rounded-lg border border-gray-500/20 text-center">
                  <div className="bg-gray-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-300 font-medium mb-2">Choose an Element Type</h4>
                  <p className="text-gray-400 text-sm">
                    Select an element type above. The element type is automatically linked to its associated items or general accounts.
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
                  value={formValues.quantity}
                  onChange={(e) => handleFieldChange("quantity", Number(e.target.value))}
                  placeholder="1"
                  min="0"
                  step="0.01"
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
                    value={formValues.priceHT}
                    onChange={(e) => handleFieldChange("priceHT", Number(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
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
                      value={formValues.discountAmount || 0}
                      onChange={(e) => handleFieldChange("discountAmount", Number(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
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
                      value={(formValues.discountPercentage * 100).toFixed(1)}
                      onChange={(e) => handleFieldChange("discountPercentage", Number(e.target.value) / 100)}
                      placeholder="0.0"
                      min="0"
                      max="100"
                      step="0.1"
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
                VAT Percentage
              </Label>
              <div className="relative">
                <Input
                  id="edit-vatPercentage"
                  type="number"
                  value={(formValues.vatPercentage * 100).toFixed(1)}
                  onChange={(e) => handleFieldChange("vatPercentage", Number(e.target.value) / 100)}
                  placeholder="20.0"
                  min="0"
                  max="100"
                  step="0.1"
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
            <Ban className="h-4 w-4 mr-2" /> Cancel
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLigneDialog;
