/** @format */

import { EvaluationScoringMode } from "./program-criteria.model";

export type OverallResultStatus =
  | "configuration_required"
  | "pending_both"
  | "pending_case"
  | "pending_quiz"
  | "complete";

export interface OverallResultProject {
  /** ID участия проекта в программе; не ID проекта. */
  id: number;
  projectId: number;
  name: string;
  caseName: string | null;
  submitted: boolean;
  caseScore: number | null;
  caseComplete: boolean;
  caseStatus: "not_configured" | "not_submitted" | "pending" | "complete";
  caseEvaluatorsCompleted: number;
  caseEvaluatorsRequired: number;
  quizScore: number | null;
  quizComplete: boolean;
  score: number | null;
  ready: boolean;
  status: OverallResultStatus;
  place: number | null;
}

export interface ProgramOverallResults {
  programId: number;
  programName: string;
  generatedAt: string;
  formula: "case_plus_quiz";
  caseMaximum: 100;
  quizMaximum: 100;
  maximum: 200;
  caseScoringMode: EvaluationScoringMode;
  caseScoringConfigured: boolean;
  caseOptions: string[];
  totalCount: number;
  totalReadyCount: number;
  matchingCount: number;
  readyCount: number;
  projects: OverallResultProject[];
}
