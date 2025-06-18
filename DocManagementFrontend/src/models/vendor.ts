export interface Vendor {
  vendorCode: string;
  name: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  documentsCount: number;
}

export interface VendorSimple {
  vendorCode: string;
  name: string;
}

export interface CreateVendorRequest {
  vendorCode: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateVendorRequest {
  vendorCode?: string;
  name?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ValidateVendorCodeRequest {
  vendorCode: string;
  excludeVendorCode?: string;
} 