// Line Element Type models
export interface LignesElementType {
  id: number;
  code: string;
  typeElement: string;
  description: string;
  tableName: string;
  itemCode?: string;
  accountCode?: string;
  item?: Item;
  generalAccount?: GeneralAccounts;
  createdAt: string;
  updatedAt: string;
}

export interface LignesElementTypeSimple {
  id: number;
  code: string;
  typeElement: string;
  description: string;
}

export interface CreateLignesElementTypeRequest {
  code: string;
  typeElement: string;
  description: string;
  tableName: string;
  itemCode?: string;
  accountCode?: string;
}

export interface UpdateLignesElementTypeRequest {
  code?: string;
  typeElement?: string;
  description?: string;
  tableName?: string;
  itemCode?: string;
  accountCode?: string;
}

// Item models
export interface Item {
  code: string;
  description: string;
  unite?: string;
  uniteCodeNavigation?: UniteCode;
  createdAt: string;
  updatedAt: string;
  elementTypesCount: number; // Count of lignes using this item (through element types)
}

export interface ItemSimple {
  code: string;
  description: string;
  unite?: string;
}

export interface CreateItemRequest {
  code: string;
  description: string;
  unite?: string;
}

export interface UpdateItemRequest {
  description?: string;
  unite?: string;
}

// UniteCode models
export interface UniteCode {
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export interface UniteCodeSimple {
  code: string;
  description: string;
}

export interface CreateUniteCodeRequest {
  code: string;
  description: string;
}

export interface UpdateUniteCodeRequest {
  code?: string;
  description?: string;
}

// GeneralAccounts models
export interface GeneralAccounts {
  code: string;
  description: string;
  accountType?: string; // Stores IncomeBalance from BC API
  createdAt: string;
  updatedAt: string;
  lignesCount: number; // Count of lignes using this account (through element types)
}

export interface GeneralAccountsSimple {
  code: string;
  description: string;
}

export interface CreateGeneralAccountsRequest {
  code: string;
  description: string;
}

export interface UpdateGeneralAccountsRequest {
  code?: string;
  description?: string;
} 