export interface Location {
  locationCode: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LocationDto {
  locationCode: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LocationSimpleDto {
  locationCode: string;
  description: string;
}

export interface CreateLocationRequest {
  locationCode: string;
  description: string;
}

export interface UpdateLocationRequest {
  description?: string;
} 