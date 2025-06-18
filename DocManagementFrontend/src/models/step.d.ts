
interface Step {
  id: number;
  stepKey: string;
  circuitId: number;
  title: string;
  descriptif: string;
  orderIndex: number;
  responsibleRoleId?: number;
  isFinalStep: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateStepDto {
  title: string;
  descriptif: string;
  orderIndex: number;
  responsibleRoleId?: number;
  circuitId: number;
}

interface UpdateStepDto {
  title?: string;
  descriptif?: string;
  orderIndex?: number;
  responsibleRoleId?: number;
  isFinalStep?: boolean;
}

interface StepFilterOptions {
  circuit?: number;
  responsibleRole?: number;
  isFinalStep?: boolean;
}
