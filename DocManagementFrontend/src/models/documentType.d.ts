
import { TierType } from './document';

export interface DocumentTypeUpdateRequest {
  typeKey?: string;
  typeName?: string;
  typeAttr?: string;
  tierType?: TierType;
  documentCounter?: number; // Adding this field to match the usage in DocumentTypeForm
}
