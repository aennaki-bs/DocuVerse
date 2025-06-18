export interface Customer {
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  documentsCount: number;
}

export interface CustomerSimple {
  code: string;
  name: string;
}

export interface CreateCustomerRequest {
  code: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateCustomerRequest {
  code?: string;
  name?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ValidateCustomerCodeRequest {
  code: string;
  excludeCode?: string;
} 