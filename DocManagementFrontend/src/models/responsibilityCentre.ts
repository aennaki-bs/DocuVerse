/**
 * Interface for Responsibility Centre
 */
export interface ResponsibilityCentre {
  id: number;
  code: string;
  descr: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usersCount?: number;
  documentsCount?: number;
  users?: User[];
}

/**
 * Interface for creating a new Responsibility Centre
 */
export interface CreateResponsibilityCentreRequest {
  code: string;
  descr: string;
}

/**
 * Interface for updating a Responsibility Centre
 */
export interface UpdateResponsibilityCentreRequest {
  code: string;
  descr: string;
  isActive?: boolean;
}

/**
 * Interface for validating a Responsibility Centre code
 */
export interface ValidateResponsibilityCentreCodeRequest {
  code: string;
  id?: number; // Optional for excluding current record in validation
}

/**
 * Simple Responsibility Centre reference model
 */
export interface ResponsibilityCentreSimple {
  id: number;
  code: string;
  descr: string;
  isActive: boolean;
}

export interface User {
  id: number;
  username?: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: {
    roleId: number;
    roleName: string;
  };
  userType?: string;
  isActive?: boolean;
  isOnline?: boolean;
  createdAt?: string;
  profilePicture?: string;
  responsibilityCentre?: ResponsibilityCentreSimple | null;
} 