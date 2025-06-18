export type ActionCategory = 'approval' | 'review' | 'processing' | 'notification' | 'system';
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Action {
  actionId: number;
  actionKey: string;
  title: string;
  description: string;
}

export interface CreateActionDto {
  title: string;
  description: string;
}

export interface UpdateActionDto {
  title: string;
  description: string;
}

export interface StatusEffectDto {
  statusId: number;
  setsComplete: boolean;
}

export interface AssignActionToStepDto {
  stepId: number;
  actionId: number;
  statusEffects?: StatusEffectDto[];
}

export interface ActionForm extends UpdateActionDto {
  actionKey?: string;
  category?: ActionCategory;
  priority?: ActionPriority;
  requiresComment?: boolean;
}

export const ACTION_CATEGORIES = [
  { value: 'approval', label: 'Approval', color: 'bg-green-500' },
  { value: 'review', label: 'Review', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500' },
  { value: 'notification', label: 'Notification', color: 'bg-yellow-500' },
  { value: 'system', label: 'System', color: 'bg-gray-500' }
];

export const ACTION_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];
