/** @format */
import { ManagementCriterion } from "./program-criteria.model";
import { SolutionRef } from "@domain/solution/solution-contract.model";

export interface ResultExpert {
  userId: number;
  name: string;
  email: string;
  avatar: string | null;
  complete: boolean;
  total: number | null;
  values: { criterionId: number; value: string | null }[];
}
export interface ResultProject {
  id: number;
  projectId: number;
  name: string;
  caseName: string | null;
  completed: number;
  required: number;
  ready: boolean;
  evaluationComplete?: boolean;
  score: number | null;
  place: number | null;
  averages: Record<string, number>;
  experts: ResultExpert[];
}
export interface ResultsGroup {
  caseName: string | null;
  projects: ResultEntry[];
}
/** Shared results presentation. Solution entries never contain a Project foreign key. */
export type ResultSolution = Omit<ResultProject, "projectId"> & { application: SolutionRef };
export type ResultEntry = ResultProject | ResultSolution;
export interface ProgramResults {
  programId: number;
  programName: string;
  generatedAt: string;
  requiredEvaluators: number;
  maximum: number | null;
  hasNumericCriteria: boolean;
  caseOptions: string[];
  criteria: ManagementCriterion[];
  groups: ResultsGroup[];
}
export interface ResultsQuery {
  search: string;
  caseScope: "all" | "selected" | "without_case";
  caseName?: string;
  order: "asc" | "desc";
  scope: "current" | "all";
  status?: "all" | "complete" | "pending";
}
