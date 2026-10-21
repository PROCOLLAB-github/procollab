/** @format */
import { ManagementCriterion } from "./program-criteria.model";
import { ResultProject } from "./program-results.model";

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
  | "organizers"
  | "registration";
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
  region?: string | null;
  registeredAt: string;
  lastActivity?: string | null;
  registrationAnswers?: { label: string; value: string | string[] | number | null }[];
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
  draft?: boolean;
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
  totalCount?: number;
  caseOptions: string[];
  isCompetitive: boolean;
}
export interface ManagementParticipantsPage extends ManagementPage<ManagementParticipant> {
  totalCount?: number;
  regionOptions?: string[];
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
  criteria?: ManagementCriterion[];
  result?: ResultProject | null;
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
  evaluation?: "all" | "evaluated" | "not_evaluated";
  caseScope: "all" | "selected" | "without_case";
  caseName?: string;
  regionScope?: "all" | "selected" | "without_region";
  region?: string;
  activity?: "all" | "period" | "active" | "inactive" | "never";
  order?: "registration" | "activity_asc" | "activity_desc";
  activityFrom?: string;
  activityTo?: string;
}
export interface ManagementSelectionProject {
  id: number;
  projectId: number;
  submitted: boolean;
  caseName: string | null;
  draft: boolean;
}
export interface ManagementSelection {
  ids: number[];
  projects?: ManagementSelectionProject[];
}
export interface ParticipantRemovalPreview {
  confirmationVersion: 2;
  previewToken: string;
  participantCount: number;
  applications: { id: number; projectId: number; name: string; submitted: boolean }[];
  assignmentsCount: number;
  teamChanges: {
    id: number;
    projectId: number;
    name: string;
    submitted: boolean;
    members: { id: number; name: string }[];
    invitationsCount: number;
  }[];
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
