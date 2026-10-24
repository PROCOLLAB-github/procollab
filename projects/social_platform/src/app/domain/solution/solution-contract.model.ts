/** @format */

// Сгенерировано tools/generate-solution-contract.py из C00 1.2.0.
// camelCase соответствует CamelcaseInterceptor; значения ID и revision не преобразуются.

export type SolutionUser = {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type SolutionProgramRef = {
  id: number;
  name: string;
};

export type SolutionRef = {
  kind: "solution";
  programId: number;
  solutionId: number;
  name: string;
};

export type SolutionLegacyRef = {
  kind: "legacy_project";
  programId: number;
  projectId: number;
  programLinkId: number;
  name: string;
};

export type SolutionApplicationRef = SolutionRef | SolutionLegacyRef;

export type SolutionIssue = {
  path: string;
  code: string;
  fieldId: number | null;
  detail: string;
};

export type SolutionApiError = {
  code: string;
  detail: string;
  errors: Array<SolutionIssue>;
  meta: Record<string, unknown>;
};

export type SolutionContext = {
  programId: number;
  storageMode: "legacy_project" | "solution";
  isRegistered: boolean;
  isCompetitive: boolean;
  submissionOpen: boolean;
  submissionDeadline: string | null;
  canCreate: boolean;
  blockedReason: string | null;
  currentApplication: SolutionApplicationRef | null;
};

export type SolutionValidation = {
  minLength: number | null;
  maxLength: number | null;
  minimum: number | null;
  maximum: number | null;
  allowedExtensions: Array<string>;
  maxFileSizeBytes: number | null;
};

export type SolutionFieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "select"
  | "checkbox"
  | "file"
  | "radio";

export type SolutionPurpose =
  | "other"
  | "case"
  | "presentation"
  | "repository"
  | "demo"
  | "video"
  | "run_instructions";

export type SolutionTemplateName = "case_championship" | "hackathon";

export type SolutionField = {
  id: number;
  type: SolutionFieldType;
  purpose: SolutionPurpose;
  label: string;
  helpText: string;
  required: boolean;
  position: number;
  options: Array<string>;
  validation: SolutionValidation;
};

export type SolutionFieldWrite = {
  id: number | null;
  type: SolutionFieldType;
  purpose: SolutionPurpose;
  label: string;
  helpText: string;
  required: boolean;
  position: number;
  options: Array<string>;
  validation: SolutionValidation;
};

export type SolutionForm = {
  programId: number;
  revision: string;
  template: SolutionTemplateName | null;
  isConfigured: boolean;
  isSnapshot: boolean;
  fields: Array<SolutionField>;
};

export type SolutionFormWrite = {
  expectedRevision: string;
  template: SolutionTemplateName;
  fields: Array<SolutionFieldWrite>;
};

export type SolutionFormManagement = {
  form: SolutionForm;
  hasSolutions: boolean;
  hasAnswers: boolean;
  affectedDraftCount: number;
  fieldsUsage: Array<{
    fieldId: number;
    answersCount: number;
    canDelete: boolean;
    canChangeType: boolean;
  }>;
};

export type SolutionTemplate = {
  key: SolutionTemplateName;
  label: string;
  fields: Array<SolutionFieldWrite>;
};

export type SolutionTemplates = {
  results: Array<SolutionTemplate>;
  maxFileSizeBytes: 104857600;
  filesPerField: 1;
};

export type SolutionFileRef = {
  url: string;
};

export type SolutionAnswerValue = string | number | boolean | SolutionFileRef;

export type SolutionAnswer = {
  fieldId: number;
  value: SolutionAnswerValue;
};

export type SolutionAnswerPatch = {
  fieldId: number;
  value: SolutionAnswerValue | null;
};

export type SolutionMember = {
  user: SolutionUser;
  role: string | null;
  specialization: string | null;
  joinedAt: string;
  isCaptain: boolean;
};

export type SolutionTeam = {
  members: Array<SolutionMember>;
  acceptedCount: number;
  pendingCount: number;
  reservedCount: number;
  minSize: number | null;
  maxSize: number | null;
  isFrozen: boolean;
};

export type SolutionPermissions = {
  canEdit: boolean;
  canManageTeam: boolean;
  canInvite: boolean;
  canSubmit: boolean;
  canLeave?: boolean;
};

export type SolutionSubmission = {
  required: boolean;
  status: "draft" | "submitted";
  submissionOpen: boolean;
  deadline: string | null;
  submittedAt: string | null;
};

export type SolutionReadiness = {
  isReady: boolean;
  issues: Array<SolutionIssue>;
};

export type ProgramSolution = {
  id: number;
  programId: number;
  version: number;
  name: string;
  captainId: number;
  createdAt: string;
  updatedAt: string;
  team: SolutionTeam;
  form: SolutionForm;
  answers: Array<SolutionAnswer>;
  submission: SolutionSubmission;
  permissions: SolutionPermissions;
  readiness: SolutionReadiness | null;
};

export type SolutionSummary = {
  id: number;
  programId: number;
  name: string;
  captain: SolutionUser;
  acceptedCount: number;
  caseValue: string | null;
  status: "draft" | "submitted";
  submittedAt: string | null;
};

export type CreateSolutionCommand = {
  name?: string;
};

export type UpdateSolutionCommand =
  | {
      expectedVersion: number;
      expectedFormRevision: string;
      name: string;
      answers?: Array<SolutionAnswerPatch>;
    }
  | {
      expectedVersion: number;
      expectedFormRevision: string;
      name?: string;
      answers: Array<SolutionAnswerPatch>;
    };

export type SubmitSolutionCommand = {
  expectedVersion: number;
  expectedFormRevision: string;
};

export type SolutionCaptainCommand = {
  expectedSolutionVersion: number;
  newCaptainUserId: number;
};

export type SolutionTeamCommand = {
  expectedSolutionVersion: number;
};

export type SolutionInvitationPermissions = {
  canEdit: boolean;
  canRevoke: boolean;
  canAccept: boolean;
  canDecline: boolean;
};

export type SolutionInvitation = {
  id: number;
  version: number;
  program: SolutionProgramRef;
  solution: SolutionRef;
  captain: SolutionUser;
  recipient: SolutionUser;
  role: string | null;
  specialization: string | null;
  motivationalLetter: string | null;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
  permissions: SolutionInvitationPermissions;
};

export type SolutionCreateInvitation = {
  expectedSolutionVersion: number;
  recipientUserId: number;
  role?: string | null;
  specialization?: string | null;
  motivationalLetter?: string | null;
};

export type SolutionUpdateInvitation =
  | {
      expectedVersion: number;
      expectedSolutionVersion: number;
      role: string | null;
      specialization?: string | null;
      motivationalLetter?: string | null;
    }
  | {
      expectedVersion: number;
      expectedSolutionVersion: number;
      role?: string | null;
      specialization: string | null;
      motivationalLetter?: string | null;
    }
  | {
      expectedVersion: number;
      expectedSolutionVersion: number;
      role?: string | null;
      specialization?: string | null;
      motivationalLetter: string | null;
    };

export type SolutionInvitationAction = {
  expectedVersion: number;
};

export type SolutionInvitationCreated = {
  invitation: SolutionInvitation;
  solutionVersion: number;
};

export type SolutionInvitationActionResult = {
  invitation: SolutionInvitation;
  application: SolutionRef | null;
  solutionVersion: number | null;
};

export type SolutionMutationReceipt = {
  solutionId: number;
  solutionVersion: number;
  updatedAt: string;
};

export type SolutionPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<SolutionSummary>;
};

export type SolutionInvitationPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<SolutionInvitation>;
};

export type SolutionUploadResponse = {
  url: string;
};

export type SolutionSubmissionSnapshot = {
  name: string;
  captainId: number;
  members: Array<SolutionMember>;
  form: SolutionForm;
  answers: Array<SolutionAnswer>;
  submittedAt: string;
};
