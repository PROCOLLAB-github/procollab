/** @format */
export interface ExpertRow {
  id: number | string;
  userId?: number;
  invitationId?: number;
  name: string | null;
  email: string;
  avatar?: string | null;
  status: "joined" | "pending" | "expired" | "revoked";
  deliveryStatus?: "queued" | "sent" | "failed";
  assigned: number | null;
  completed: number | null;
  remaining: number | null;
}
export interface ExpertWorkspace {
  revision: string;
  requiredEvaluators: number;
  managedEvaluation: boolean;
  submittedProjects: number;
  missingAssignments: number;
  readyProjects: number;
  experts: ExpertRow[];
}
export interface AssignmentProject {
  id: number;
  name: string;
  caseName: string | null;
  submitted: boolean;
  assigned: boolean;
  protected: boolean;
  completed: boolean;
  ownTeam: boolean;
}
export interface AssignmentOptions {
  revision: string;
  projects: AssignmentProject[];
}
export interface AllocationQuery {
  expertIds: number[];
  projectIds?: number[];
}
export interface AllocationPlan {
  revision: string;
  planToken: string;
  assignments: { projectId: number; projectName: string; expertId: number; expertName: string }[];
  shortages: { projectId: number; projectName: string; missing: number }[];
  load: { expertId: number; name: string; before: number; after: number }[];
}
export interface QuotaPreview {
  revision: string;
  requiredEvaluators: number;
  readyBefore: number;
  readyAfter: number;
  missingAssignments: number;
  surplusAssignments: number;
}
export interface EvaluationProgram {
  id: number;
  name: string;
  imageAddress: string | null;
  imageFraming?: import("./program-image-framing.model").ProgramImageFraming;
  datetimeEvaluationEnds: string | null;
  status: "joined" | "pending";
  email?: string;
  invitationId?: number;
  assigned?: number;
  completed?: number;
  remaining?: number;
}
export interface EvaluationPrograms {
  results: EvaluationProgram[];
  hasAccess: boolean;
}
export interface ExpertInvitation {
  id: number;
  email: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  program: EvaluationProgram;
  accountExists: boolean;
  loginEmail?: string;
  matchesAccount: boolean;
}
export interface ExpertRegistration {
  firstName: string;
  lastName: string;
  password: string;
  repeatPassword: string;
  acceptPolicy: boolean;
  acceptAge: boolean;
}
export interface InvitationAccepted {
  programId: number;
  accepted: boolean;
}
export interface ExpertRegistered {
  access: string;
  refresh: string;
  programId: number;
}
