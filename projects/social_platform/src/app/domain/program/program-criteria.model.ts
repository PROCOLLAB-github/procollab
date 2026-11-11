/** @format */

export type CriterionType = "int" | "bool" | "str" | "float";
export type EvaluationScoringMode = "legacy" | "weighted_percent";
export interface ManagementCriterion {
  id: number;
  name: string;
  description: string | null;
  type: CriterionType;
  minValue: number | null;
  maxValue: number | null;
  weightPercent?: number | null;
}
export interface ManagementCriteria {
  updatedAt: string;
  revision: string;
  locked: boolean;
  supportedTypes: CriterionType[];
  criteria: ManagementCriterion[];
  scoringMode?: EvaluationScoringMode;
}
export interface ManagementCriteriaWrite {
  expectedUpdatedAt: string;
  expectedRevision: string;
  scoringMode?: EvaluationScoringMode;
  criteria: (Omit<ManagementCriterion, "id"> & { id: number | null })[];
}
