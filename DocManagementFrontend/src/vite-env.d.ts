
/// <reference types="vite/client" />

// Circuit types
interface Circuit {
  id: number;
  circuitKey: string;
  title: string;
  descriptif: string;
  isActive: boolean;
  crdCounter: number;
  hasOrderedFlow: boolean;
  circuitDetails?: CircuitDetail[];
}

interface CircuitDetail {
  id: number;
  circuitDetailKey: string;
  circuitId: number;
  circuit?: Circuit;
  title: string;
  descriptif: string;
  orderIndex: number;
  responsibleRoleId?: number;
  responsibleRole?: Role;
}

interface DocumentCircuitHistory {
  id: number;
  documentId: number;
  circuitDetailId: number;
  circuitDetail?: CircuitDetail;
  processedByUserId: number;
  processedBy?: User;
  processedAt: string;
  comments: string;
  isApproved: boolean;
}

interface AssignCircuitRequest {
  documentId: number;
  circuitId: number;
}

interface ProcessCircuitRequest {
  documentId: number;
  isApproved: boolean;
  comments: string;
}

interface DocumentCircuitHistoryDto {
  id: number;
  circuitDetailTitle: string;
  processedBy: string;
  processedAt: string;
  comments: string;
  isApproved: boolean;
}

