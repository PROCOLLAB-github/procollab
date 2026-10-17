/** @format */

export type CriterionType = "int" | "bool" | "str" | "float";
export interface ManagementCriterion {
  id: number;
  name: string;
  description: string | null;
  type: CriterionType;
  minValue: number | null;
  maxValue: number | null;
}
export interface ManagementCriteria {
  updatedAt: string;
  revision: string;
  locked: boolean;
  supportedTypes: CriterionType[];
  criteria: ManagementCriterion[];
}
export interface ManagementCriteriaWrite {
  expectedUpdatedAt: string;
  expectedRevision: string;
  criteria: (Omit<ManagementCriterion, "id"> & { id: number | null })[];
}
