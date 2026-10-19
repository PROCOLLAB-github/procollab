/** @format */

import { ProgramImageFraming } from "./program-image-framing.model";

export type ManagementSection =
  | "participants"
  | "projects"
  | "experts"
  | "results"
  | "analytics"
  | "settings"
  | "evaluation";
export type SettingsSection =
  | "basic"
  | "dates"
  | "materials"
  | "project-form"
  | "criteria"
  | "organizers";
export interface ManagementMaterial {
  id: number;
  title: string;
  url: string;
  file: { link: string; name: string; extension: string; size: number } | null;
  updatedAt: string;
}
export interface ManagementBasic {
  name: string;
  city: string;
  tag: string;
  description: string | null;
  imageAddress: string | null;
  coverImageAddress: string | null;
  mobileCoverImageAddress?: string | null;
  imageFraming?: ProgramImageFraming;
  advertisementImageAddress: string | null;
  registrationLink: string | null;
  presentationAddress: string | null;
}
export interface ManagementDates {
  datetimeStarted: string;
  datetimeRegistrationEnds: string;
  datetimeProjectSubmissionEnds: string | null;
  datetimeEvaluationEnds: string | null;
  datetimeFinished: string;
}
export interface ProgramManagement extends ManagementBasic, ManagementDates {
  id: number;
  updatedAt: string;
  isCompetitive: boolean;
  isDistributedEvaluation: boolean;
  materials: ManagementMaterial[];
}
export interface ManagementParticipant {
  id: number;
  userId: number;
  name: string;
  email: string | null;
  city: string | null;
  registeredAt: string;
  lastActivity?: string | null;
}
export type ManagementEvaluationStatus =
  | "not_submitted"
  | "awaiting_evaluation"
  | "partially_evaluated"
  | "evaluated"
  | "not_applicable";
export interface ManagementProject {
  id: number;
  projectId: number;
  name: string;
  leader: { id: number; name: string };
  submitted: boolean;
  evaluationStatus: ManagementEvaluationStatus;
  assignmentsTotal: number | null;
  assignmentsCompleted: number | null;
  caseName: string | null;
  presentationUrl: string | null;
}
export interface ManagementPage<T> {
  count: number;
  results: T[];
  next: string | null;
  previous: string | null;
}
export interface ManagementProjectsPage extends ManagementPage<ManagementProject> {
  caseOptions: string[];
  isCompetitive: boolean;
}
export interface ManagementTeam {
  projectId: number;
  programLinkId: number;
  name: string;
  members: {
    id: number;
    name: string;
    role: string;
    email?: string | null;
    avatar?: string | null;
  }[];
}
export interface ManagementEvaluation {
  projectId: number;
  programLinkId: number;
  name: string;
  submitted: boolean;
  canRate: boolean;
  experts: {
    id: number;
    name: string;
    status: string;
    criteria: { id: number; name: string; type: string; value: string | null; isScored: boolean }[];
  }[];
}
export interface ManagementQuery {
  search: string;
  offset: number;
  limit: number;
  submission: "all" | "submitted" | "not_submitted";
  caseScope: "all" | "selected" | "without_case";
  caseName?: string;
}
export interface ManagementSettingsWrite {
  expectedUpdatedAt: string;
  confirmReopen?: boolean;
  [field: string]: string | boolean | null | undefined | ProgramImageFraming;
}
export interface ManagementMaterialWrite {
  title: string;
  url: string | null;
  file: string | null;
  expectedUpdatedAt?: string;
}
