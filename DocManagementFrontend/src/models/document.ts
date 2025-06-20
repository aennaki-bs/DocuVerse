import { ResponsibilityCentreSimple } from './responsibilityCentre';
import { 
  LignesElementType, 
  Item, 
  UniteCode, 
  GeneralAccounts 
} from './lineElements';
import { SubType } from './subtype';
import { LocationDto } from './location';
import './circuit.d.ts';

export enum TierType {
  None = 0,
  Customer = 1,
  Vendor = 2
}

export interface Document {
  id: number;
  title: string;
  documentKey: string;
  content: string;
  status: number;
  documentAlias: string;
  documentExterne?: string;
  createdAt: string;
  updatedAt: string;
  typeId: number;
  subTypeId?: number;
  docDate: string;
  comptableDate: string;
  documentType: DocumentType;
  subType?: SubType;
  circuitId?: number;
  circuit?: Circuit;
  currentCircuitDetailId?: number;
  currentCircuitDetail?: CircuitDetail;
  createdByUserId: number;
  createdBy: DocumentUser;
  updatedByUserId?: number;
  updatedBy?: DocumentUser;
  lignesCount?: number;
  sousLignesCount?: number;
  lignes?: Ligne[];
  responsibilityCentreId?: number;
  responsibilityCentre?: ResponsibilityCentreSimple;
  
  // Customer/Vendor snapshot data
  customerVendorCode?: string;
  customerVendorName?: string;
  customerVendorAddress?: string;
  customerVendorCity?: string;
  customerVendorCountry?: string;
  
  // ERP Archive status
  erpDocumentCode?: string;
  isArchived?: boolean;
}

export interface DocumentType {
  id?: number;
  typeNumber?: number;
  typeName: string;
  typeKey?: string;
  typeAttr?: string;
  tierType?: TierType;
  documentCounter?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  documentAlias?: string;
  documentExterne?: string;
  typeId: number;
  subTypeId?: number | null;
  docDate?: string;
  circuitId?: number;
  responsibilityCentreId?: number;
  
  // Customer/Vendor information
  customerVendorCode?: string;
  customerVendorName?: string;
  customerVendorAddress?: string;
  customerVendorCity?: string;
  customerVendorCountry?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  documentAlias?: string;
  documentExterne?: string;
  typeId?: number;
  docDate?: string;
  comptableDate?: string;
  circuitId?: number;
  
  // Customer/Vendor information
  customerVendorCode?: string;
  customerVendorName?: string;
  customerVendorAddress?: string;
  customerVendorCity?: string;
  customerVendorCountry?: string;
}

export interface Ligne {
  id: number;
  documentId: number;
  ligneKey: string;
  title: string;
  article: string;
  
  // Legacy field
  prix: number;
  
  sousLignesCount: number;
  
  // Type information - FIXED field names to match backend
  lignesElementTypeId?: number;
  lignesElementType?: LignesElementType;
  
  // Element references
  itemCode?: string;
  item?: Item;
  generalAccountsCode?: string;
  generalAccounts?: GeneralAccounts;
  
  // Location reference (only for Item types)
  locationCode?: string;
  location?: LocationDto;
  
  // Unit of measure reference (only for Item types)
  unitCode?: string;
  unit?: UniteCode;
  
  // Pricing fields
  quantity: number;
  priceHT: number;
  discountPercentage: number;
  discountAmount?: number;
  vatPercentage: number;
  
  // Calculated fields
  amountHT: number;
  amountVAT: number;
  amountTTC: number;
  
  // ERP Integration field
  erpLineCode?: string;
  
  createdAt: string;
  updatedAt: string;
  document?: Document;
  sousLignes?: SousLigne[];
}

export interface CreateLigneRequest {
  documentId: number;
  ligneKey?: string;
  title: string;
  article: string;
  
  // Type reference - backend determines item/account automatically based on this
  lignesElementTypeId?: number;
  
  // Selected element code (Item.Code or GeneralAccounts.Code)
  selectedElementCode?: string;
  
  // Location code (only for Item types)
  locationCode?: string;
  
  // Unit of measure code (only for Item types)
  unitCode?: string;
  
  // Pricing fields (calculated by frontend)
  quantity: number;
  priceHT: number; // Unit price after conversion (adjusted price)
  discountPercentage: number;
  discountAmount: number; // Calculated discount amount
  vatPercentage: number;
  
  // Original unit price (before conversion) - for reference
  originalPriceHT: number;
}

export interface UpdateLigneRequest {
  ligneKey?: string;
  title?: string;
  article?: string;
  
  // Type reference - backend determines item/account automatically based on this
  lignesElementTypeId?: number;
  
  // Selected element code (Item.Code or GeneralAccounts.Code)
  selectedElementCode?: string;
  
  // Location code (only for Item types)
  locationCode?: string;
  
  // Unit of measure code (only for Item types)
  unitCode?: string;
  
  // Pricing fields (calculated by frontend)
  quantity?: number;
  priceHT?: number; // Unit price after conversion (adjusted price)
  discountPercentage?: number;
  discountAmount?: number; // Calculated discount amount
  vatPercentage?: number;
  
  // Original unit price (before conversion) - for reference
  originalPriceHT?: number;
}

export interface SousLigne {
  id: number;
  ligneId: number;
  sousLigneKey?: string;
  title: string;
  attribute: string;
  createdAt?: string;
  updatedAt?: string;
  ligne?: Ligne;
}

export interface CreateSousLigneRequest {
  ligneId: number;
  title: string;
  attribute: string;
}

export interface UpdateSousLigneRequest {
  title?: string;
  attribute?: string;
}
