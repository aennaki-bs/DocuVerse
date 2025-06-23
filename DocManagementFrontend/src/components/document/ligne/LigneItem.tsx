import { useState } from "react";
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Tag,
  Package,
  Calculator,
  Percent,
} from "lucide-react";
import { Ligne, Document } from "@/models/document";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SousLignesList from "../SousLignesList";
import AddLineToErpButton from "../AddLineToErpButton";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface LigneItemProps {
  ligne: Ligne;
  expandedLigneId: number | null;
  toggleLigneExpansion: (ligneId: number) => void;
  document: Document;
  canManageDocuments: boolean;
  onEdit: (ligne: Ligne) => void;
  onDelete: (ligne: Ligne) => void;
}

// Format price with MAD currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Format percentage
const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const LigneItem = ({
  ligne,
  expandedLigneId,
  toggleLigneExpansion,
  document,
  canManageDocuments,
  onEdit,
  onDelete,
}: LigneItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = expandedLigneId === ligne.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
        relative overflow-hidden rounded-lg border transition-all duration-200
        ${
          isExpanded
            ? "bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30"
            : "bg-gradient-to-br from-gray-900/40 to-blue-900/20 border-white/5 hover:border-blue-500/20"
        }
      `}
      >
        <div
          onClick={() => toggleLigneExpansion(ligne.id)}
          className="cursor-pointer p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {ligne.ligneKey || ligne.title}
                </h3>
                {ligne.lignesElementType && (
                  <Badge
                    variant="outline"
                    className="bg-purple-900/30 border-purple-500/30 text-purple-300 font-mono text-xs"
                  >
                    {ligne.lignesElementType.code}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-blue-200/80 line-clamp-2 mb-3">
                {ligne.article}
              </p>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center text-blue-300/60">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {format(new Date(ligne.createdAt), "MMM d, yyyy")}
                </div>
                
                <div className="flex items-center text-orange-300/60">
                  <Calculator className="h-3.5 w-3.5 mr-1.5" />
                  Qty: {ligne.quantity}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Amount Display */}
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-300/60">Amount HT:</span>
                  <span className="text-green-300 font-medium">{formatPrice(ligne.amountHT)}</span>
                </div>
                {/* <div className="flex items-center gap-2 text-xs">
                  <span className="text-purple-300/60">Amount VAT:</span>
                  <span className="text-purple-300 font-medium">{formatPrice(ligne.amountVAT)}</span>
                </div> */}
                <div className="px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-300/60">Amount TTC:</span>
                    <span className="text-blue-300 font-bold">{formatPrice(ligne.amountTTC)}</span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered || isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1"
              >
                {/* Add to ERP Button - Always visible for admins and users */}
                <div onClick={(e) => e.stopPropagation()}>
                  <AddLineToErpButton
                    ligneId={ligne.id}
                    ligneTitle={ligne.title}
                    documentErpCode={document.erpDocumentCode}
                    lineErpCode={ligne.erpLineCode}
                    onSuccess={(erpLineCode) => {
                      // Update the ligne object to reflect the change
                      ligne.erpLineCode = erpLineCode;
                    }}
                    className="h-8"
                  />
                </div>

                {canManageDocuments && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!!ligne.erpLineCode}
                      className={`h-8 w-8 ${
                        ligne.erpLineCode 
                          ? "opacity-50 cursor-not-allowed text-gray-500"
                          : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!ligne.erpLineCode) {
                          onEdit(ligne);
                        }
                      }}
                      title={
                        ligne.erpLineCode 
                          ? "Cannot edit: Line is archived to ERP"
                          : "Edit line"
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!!ligne.erpLineCode}
                      className={`h-8 w-8 ${
                        ligne.erpLineCode 
                          ? "opacity-50 cursor-not-allowed text-gray-500"
                          : "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!ligne.erpLineCode) {
                          onDelete(ligne);
                        }
                      }}
                      title={
                        ligne.erpLineCode 
                          ? "Cannot delete: Line is archived to ERP"
                          : "Delete line"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <div
                  className={`
                  flex items-center justify-center h-8 w-8 rounded-md transition-colors duration-200
                  ${
                    isExpanded
                      ? "bg-blue-900/40 text-blue-300"
                      : "text-blue-400"
                  }
                `}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Separator className="bg-blue-500/20" />
              <div className="p-4 bg-gradient-to-br from-blue-950/50 to-indigo-950/40">
                {/* Pricing Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-900/40 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Unit Price (HT)</div>
                    <div className="text-sm font-medium text-white">
                      {formatPrice(ligne.priceHT)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/40 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Quantity</div>
                    <div className="text-sm font-medium text-white">
                      {ligne.quantity}
                    </div>
                  </div>
                  
                  {(ligne.discountPercentage > 0 || ligne.discountAmount) && (
                    <div className="bg-orange-900/20 rounded-lg p-3">
                      <div className="text-xs text-orange-400 mb-1">Discount</div>
                      <div className="text-sm font-medium text-orange-300">
                        {ligne.discountAmount 
                          ? formatPrice(ligne.discountAmount)
                          : formatPercentage(ligne.discountPercentage)
                        }
                      </div>
                    </div>
                  )}
                  
                  {ligne.vatPercentage > 0 && (
                    <div className="bg-purple-900/20 rounded-lg p-3">
                      <div className="text-xs text-purple-400 mb-1">VAT</div>
                      <div className="text-sm font-medium text-purple-300">
                        {formatPercentage(ligne.vatPercentage)}
                      </div>
                      <div className="text-xs text-purple-300/60">
                        {formatPrice(ligne.amountVAT)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Element Type Details */}
                {ligne.lignesElementType && (
                  <div className="mb-4">
                    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                      <h4 className="text-purple-200 font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Element Type Details
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="text-xs text-purple-400 mb-1">Type</div>
                          <div className="text-sm font-medium text-purple-300">
                            {ligne.lignesElementType.typeElement}
                          </div>
                        </div>
                      </div>

                      {/* Associated Item or General Account Details */}
                      {(ligne.item || ligne.generalAccounts) && (
                        <div className="mt-4 pt-4 border-t border-purple-500/20">
                          <h5 className="text-purple-200 font-medium mb-3 flex items-center gap-2">
                            {ligne.item ? (
                              <>
                                {/* <Package className="h-4 w-4 text-emerald-400" /> */}
                                {/* Associated Item */}
                              </>
                            ) : (
                              <>
                                {/* <Calculator className="h-4 w-4 text-violet-400" /> */}
                                {/* Associated General Account */}
                              </>
                            )}
                          </h5>
                          
                          {ligne.item && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-emerald-400 mb-1">Item Code</div>
                                <div className="text-sm font-medium text-emerald-300">
                                  {ligne.item.code}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-emerald-400 mb-1">Description</div>
                                <div className="text-sm font-medium text-emerald-300">
                                  {ligne.item.description}
                                </div>
                              </div>
                              {ligne.unit && (
                                <div>
                                  <div className="text-xs text-emerald-400 mb-1">Unit</div>
                                  <div className="text-sm font-medium text-emerald-300">
                                    {ligne.unit.code}
                                  </div>
                                </div>
                              )}
                              {ligne.unit && (
                                <div>
                                  <div className="text-xs text-emerald-400 mb-1">Unit Description</div>
                                  <div className="text-sm font-medium text-emerald-300">
                                    {ligne.unit.description}
                                  </div>
                                </div>
                              )}
                              {ligne.location && (
                                <div>
                                  <div className="text-xs text-emerald-400 mb-1">Location</div>
                                  <div className="text-sm font-medium text-emerald-300">
                                    {ligne.location.locationCode} - {ligne.location.description}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {ligne.generalAccounts && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-violet-400 mb-1">Account Code</div>
                                <div className="text-sm font-medium text-violet-300">
                                  {ligne.generalAccounts.code}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-violet-400 mb-1">Description</div>
                                <div className="text-sm font-medium text-violet-300">
                                  {ligne.generalAccounts.description}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <SousLignesList
                  document={document}
                  ligne={ligne}
                  canManageDocuments={canManageDocuments}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LigneItem;

