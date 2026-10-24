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
  allCases?: boolean;
  caseNames?: (string | null)[];
}
export interface ExpertWorkspace {
  revision: string;
  requiredEvaluators: number;
  managedEvaluation: boolean;
  submittedProjects: number;
  projectsMissingExperts?: number;
  unavailableProjects?: UnavailableEvaluationProject[];
  missingAssignments: number;
  readyProjects: number;
  experts: ExpertRow[];
  cases?: string[];
  projects?: DistributionProject[];
}
export interface DistributionProject {
  id: number;
  name: string;
  caseName: string | null;
  leaderId: number;
  teamUserIds: number[];
  experts: {
    expertId: number;
    name: string;
    email: string;
    completed: boolean;
    protected: boolean;
  }[];
}
export interface ExpertCaseScopeWrite {
  revision: string;
  allCases: boolean;
  caseNames: (string | null)[];
}
export interface ExpertsBulkWrite extends ExpertCaseScopeWrite {
  action: "cases" | "resend" | "revoke";
  expertIds: number[];
  invitationIds: number[];
}
export interface ProjectExpertsWrite {
  revision: string;
  projectIds: number[];
  expertIds: number[];
  mode: "add" | "replace";
}
export interface CaseExpertPool {
  caseName: string | null;
  expertIds: number[];
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
  eligible?: boolean;
}
export interface AssignmentOptions {
  revision: string;
  projects: AssignmentProject[];
}
export interface AllocationQuery {
  expertIds: number[];
  projectIds?: number[];
  casePools?: CaseExpertPool[];
  revision?: string;
  seed?: number;
  previousPlanToken?: string;
  assignmentOverrides?: { projectId: number; expertIds: number[] }[];
}
export interface AllocationPlan {
  canReroll?: boolean;
  revision: string;
  planToken: string;
  assignments: {
    projectId: number;
    projectName: string;
    expertId: number;
    expertName: string;
    caseName?: string | null;
  }[];
  shortages: {
    projectId: number;
    projectName: string;
    missing: number;
    caseName?: string | null;
  }[];
  unavailableProjects?: UnavailableEvaluationProject[];
  load: {
    expertId: number;
    name: string;
    before: number;
    after: number;
    assignedBefore?: number;
    assignedAfter?: number;
  }[];
}
export interface UnavailableEvaluationProject {
  projectId: number;
  projectName: string;
  reason: "draft";
}
export interface QuotaPreview {
  revision: string;
  requiredEvaluators: number;
  submittedProjects?: number;
  projectsMissingExperts?: number;
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
export interface ExpertCabinetQuery {
  status: "pending" | "completed";
  q?: string;
  programId?: number;
  limit: number;
  offset: number;
}
export interface ExpertCabinetProject {
  assignmentId: number;
  projectId: number;
  programId: number;
  name: string;
  caseName: string | null;
  isCompleted: boolean;
  canRate: boolean;
  blockedReason: string | null;
}
export interface ExpertCabinet extends EvaluationPrograms {
  projects: {
    count: number;
    limit: number;
    offset: number;
    pending: number;
    completed: number;
    unavailable: number;
    results: ExpertCabinetProject[];
  };
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
