/** @format */

// Сгенерировано tools/generate-solution-contract.py из C00 1.9.0.
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
  criterionId?: number | null;
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

export type SolutionRatingCriterion = {
  id: number;
  name: string;
  description: string | null;
  type: "int" | "float" | "bool" | "str";
  minValue: number | null;
  maxValue: number | null;
  value: string | null;
};

export type SolutionRatingValue = {
  criterionId: number;
  value: string | null;
};

export type RateSolutionCommand = {
  expectedCriteriaRevision: string;
  scores: Array<SolutionRatingValue>;
};

export type SolutionRatingSummary = {
  application: SolutionRef;
  caseName: string | null;
  assigned: boolean;
  isCompleted: boolean;
  canRate: boolean;
  blockedReason: string | null;
};

export type SolutionRatingPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<SolutionRatingSummary>;
  evaluationCounts?: {
    pending: number;
    completed: number;
  };
  caseOptions?: Array<string>;
};

export type SolutionRatingFrame = {
  program: SolutionProgramRef;
  solution: ProgramSolution;
  criteriaRevision: string;
  criteria: Array<SolutionRatingCriterion>;
  managedEvaluation: boolean;
  canRate: boolean;
  blockedReason: string | null;
  isCompleted: boolean;
  ratedCount: number;
  maxRates: number | null;
  requiredEvaluators: number;
  deadline: string | null;
};

export type SolutionAssignmentOption = {
  solutionId: number;
  name: string;
  caseName: string | null;
  submitted: boolean;
  assigned: boolean;
  protected: boolean;
  isCompleted: boolean;
  ownTeam: boolean;
  eligible: boolean;
};

export type SolutionAssignmentOptions = {
  programId: number;
  expertId: number;
  revision: string;
  solutions: Array<SolutionAssignmentOption>;
};

export type SolutionAssignmentsWrite = {
  revision: string;
  solutionIds: Array<number>;
};

export type SolutionCasePool = {
  caseName: string | null;
  expertIds: Array<number>;
};

export type SolutionAssignmentOverride = {
  solutionId: number;
  expertIds: Array<number>;
};

export type SolutionAllocationWrite = {
  revision: string;
  expertIds: Array<number>;
  solutionIds?: Array<number>;
  casePools?: Array<SolutionCasePool>;
  seed?: number;
  previousPlanToken?: string;
  assignmentOverrides?: Array<SolutionAssignmentOverride>;
};

export type SolutionPlannedAssignment = {
  solutionId: number;
  solutionName: string;
  expertId: number;
  expertName: string;
  caseName: string | null;
};

export type SolutionAssignmentShortage = {
  solutionId: number;
  solutionName: string;
  missing: number;
  caseName: string | null;
};

export type SolutionExpertLoad = {
  expertId: number;
  name: string;
  before: number;
  after: number;
  assignedBefore: number;
  assignedAfter: number;
};

export type SolutionAllocationPlan = {
  revision: string;
  planToken: string;
  assignments: Array<SolutionPlannedAssignment>;
  shortages: Array<SolutionAssignmentShortage>;
  canReroll: boolean;
  load: Array<SolutionExpertLoad>;
};

export type SolutionAllocationApply = {
  planToken: string;
};

export type SolutionAssignmentReceipt = {
  programId: number;
  revision: string;
  created: number;
};

export type SolutionQuotaWrite = {
  revision: string;
  requiredEvaluators: number;
};

export type SolutionQuota = {
  revision: string;
  requiredEvaluators: number;
  submittedSolutions: number;
  solutionsMissingExperts: number;
  readyBefore: number;
  readyAfter: number;
  missingAssignments: number;
  surplusAssignments: number;
};

export type SolutionResultCriterion = {
  id: number;
  name: string;
  description: string | null;
  type: "int" | "float" | "bool" | "str";
  minValue: number | null;
  maxValue: number | null;
};

export type SolutionResultExpert = {
  userId: number;
  name: string;
  email: string;
  avatar: string | null;
  complete: boolean;
  total: number | null;
  values: Array<SolutionRatingValue>;
};

export type SolutionResult = {
  application: SolutionRef;
  solutionId: number;
  name: string;
  caseName: string | null;
  completed: number;
  required: number;
  evaluationComplete: boolean;
  ready: boolean;
  score: number | null;
  place: number | null;
  averages: Record<string, number>;
  experts: Array<SolutionResultExpert>;
};

export type SolutionResultGroup = {
  caseName: string | null;
  solutions: Array<SolutionResult>;
};

export type SolutionResults = {
  programId: number;
  programName: string;
  generatedAt: string;
  requiredEvaluators: number;
  maximum: number | null;
  hasNumericCriteria: boolean;
  caseOptions: Array<string>;
  groups: Array<SolutionResultGroup>;
  criteria: Array<SolutionResultCriterion>;
};

export type SolutionCabinetApplication = {
  application: SolutionApplicationRef;
  assignmentId: number;
  program: SolutionProgramRef;
  deadline: string | null;
  caseName: string | null;
  isCompleted: boolean;
  canRate: boolean;
  blockedReason: string | null;
};

export type SolutionCabinetApplications = {
  count: number;
  limit: number;
  offset: number;
  pending: number;
  completed: number;
  unavailable: number;
  results: Array<SolutionCabinetApplication>;
};

export type SolutionWidgetProjectRef = {
  id: number;
  name: string;
  programLinkId: number;
};

export type SolutionWidgetStage =
  | "none"
  | "not_submitted"
  | "submitted"
  | "review"
  | "evaluated"
  | "not_applicable";

export type SolutionWidgetLegacyParticipant = {
  participantProject: SolutionWidgetProjectRef | null;
  caseProvided: boolean;
  caseName: string | null;
  stage: SolutionWidgetStage;
  submissionOpen: boolean;
};

export type SolutionWidgetParticipant = {
  application: SolutionRef | null;
  caseProvided: boolean;
  caseName: string | null;
  stage: SolutionWidgetStage;
  submissionOpen: boolean;
};

export type SolutionWidgetLegacyOrganizer = {
  participants: number;
  projects: number;
  submittedSolutions: number | null;
  participantsWithoutProject: number;
};

export type SolutionWidgetOrganizer = {
  participants: number;
  solutions: number;
  submittedSolutions: number | null;
  participantsWithoutSolution: number;
};

export type SolutionWidgetExpert = {
  mode: "open" | "distributed";
  assigned: number | null;
  remaining: number | null;
  evaluationEnds: string | null;
};

export type SolutionWidget =
  | {
      programId: number;
      role: "participant";
      isCompetitive: boolean;
      storageMode: "solution";
      participant: SolutionWidgetParticipant;
    }
  | {
      programId: number;
      role: "organizer";
      isCompetitive: boolean;
      storageMode: "solution";
      organizer: SolutionWidgetOrganizer;
    }
  | {
      programId: number;
      role: "expert";
      isCompetitive: boolean;
      storageMode: "solution";
      expert: SolutionWidgetExpert;
    };

export type SolutionLegacyWidget =
  | {
      programId: number;
      role: "participant";
      isCompetitive: boolean;
      storageMode?: "legacy_project";
      participant: SolutionWidgetLegacyParticipant;
    }
  | {
      programId: number;
      role: "organizer";
      isCompetitive: boolean;
      storageMode?: "legacy_project";
      organizer: SolutionWidgetLegacyOrganizer;
    }
  | {
      programId: number;
      role: "expert";
      isCompetitive: boolean;
      storageMode?: "legacy_project";
      expert: SolutionWidgetExpert;
    };

export type SolutionRoleWidget = SolutionWidget | SolutionLegacyWidget;

export type SolutionWidgetError = {
  detail: string;
};

export type SolutionCaseSolutionMetrics = {
  participantsTotal: number;
  solutionsTotal: number;
  notSubmitted: number | null;
  submitted: number | null;
};

export type SolutionCaseSolutionItem = {
  name: string;
  participantsTotal: number;
  solutionsTotal: number;
  notSubmitted: number | null;
  submitted: number | null;
};

export type SolutionCaseSolutionAnalytics = {
  programId: number;
  configured: boolean;
  submissionApplicable: boolean;
  items: Array<SolutionCaseSolutionItem>;
  withoutCase: SolutionCaseSolutionMetrics;
};

export type SolutionManagerTotal = {
  total: number;
};

export type SolutionManagerRegion = {
  name: string;
  count: number;
};

export type SolutionManagerRegions = {
  total: number;
  items: Array<SolutionManagerRegion>;
};

export type SolutionManagerSummary = {
  participants: SolutionManagerTotal;
  solutions: SolutionManagerTotal;
  experts: SolutionManagerTotal;
  participantRegions: SolutionManagerRegions;
};

export type SolutionManagerParticipantFunnel = {
  registrations: number;
  uniqueParticipants: number;
  visitedParticipants: number;
  onboardedParticipants: number;
  withTeam: number;
  captains: number;
  submittedCaptains: number | null;
};

export type SolutionManagerSolutionFunnel = {
  created: number;
  submissionApplicable: boolean;
  notSubmitted: number | null;
  submitted: number | null;
  evaluated: number | null;
};

export type SolutionManagerEvaluationCounters = {
  total: number;
  pending: number;
  evaluated: number;
};

export type SolutionManagerEvaluationSolutions = {
  submitted: number;
  awaitingEvaluation: number;
  partiallyEvaluated: number;
  evaluated: number;
};

export type SolutionManagerEvaluationStatus = {
  applicable: boolean;
  mode: "open" | "distributed";
  requiredEvaluators: number | null;
  maxEvaluationsPerSolution: number | null;
  assignments: SolutionManagerEvaluationCounters | null;
  solutions: SolutionManagerEvaluationSolutions | null;
};

export type SolutionManagerExpert = {
  expertId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
};

export type SolutionManagerAssignment = {
  assignmentId: number;
  expert: SolutionManagerExpert;
  application: SolutionRef;
  status: "not_ready" | "pending" | "in_progress" | "completed";
  assignedAt: string;
  submitted: boolean;
  submittedAt: string | null;
  waitingSince: string | null;
  waitingSeconds: number | null;
};

export type SolutionManagerAssignmentCriterion = {
  name: string;
  description: string | null;
  type: "int" | "float" | "bool" | "str";
  minValue: number | null;
  maxValue: number | null;
  value: string | null;
  criterionId: number;
  isScored: boolean;
};

export type SolutionManagerAssignmentDetail = {
  assignmentId: number;
  expert: SolutionManagerExpert;
  application: SolutionRef;
  status: "not_ready" | "pending" | "in_progress" | "completed";
  assignedAt: string;
  submitted: boolean;
  submittedAt: string | null;
  waitingSince: string | null;
  waitingSeconds: number | null;
  scores: Array<SolutionManagerAssignmentCriterion>;
};

export type SolutionManagerAssignments = {
  applicable: boolean;
  mode: "open" | "distributed";
  results: Array<SolutionManagerAssignment>;
};

export type SolutionManagerDelayedExpert = {
  expertId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  assignmentsTotal: number;
  completed: number;
  pending: number;
  overdue_24h: number;
  overdue_48h: number;
  oldestWaitingSince: string | null;
  oldestWaitingSeconds: number | null;
  severity: "critical" | "warning";
};

export type SolutionManagerDelayedExperts = {
  total: number;
  items: Array<SolutionManagerDelayedExpert>;
};

export type SolutionManagerAttention = {
  participantsWithoutVisit: number;
  participantsWithoutOnboarding: number;
  participantsWithoutTeam: number;
  solutionsAwaitingEvaluation: number | null;
  solutionsNotSubmitted: number | null;
  delayedExperts: SolutionManagerDelayedExperts;
};

export type SolutionManagerActivity = {
  date: string;
  registrations: number;
  submittedSolutions: number | null;
};

export type SolutionManagerFieldCoverage = {
  fieldId: number;
  label: string;
  type: SolutionFieldType;
  purpose: SolutionPurpose;
  applicable: number;
  answered: number;
  requiredApplicable: number;
  requiredUnanswered: number;
};

export type SolutionManagerAnalytics = {
  programId: number;
  summary: SolutionManagerSummary;
  participantFunnel: SolutionManagerParticipantFunnel;
  solutionFunnel: SolutionManagerSolutionFunnel;
  evaluationStatus: SolutionManagerEvaluationStatus;
  attention: SolutionManagerAttention;
  activity: Array<SolutionManagerActivity>;
  cases: SolutionCaseSolutionAnalytics;
  fieldCoverage: Array<SolutionManagerFieldCoverage>;
};

export type SolutionManagerSolutionRow = {
  application: SolutionRef;
  captain: {
    userId: number;
    fullName: string;
    avatar: string | null;
  };
  caseName: string | null;
  submissionStatus: "draft" | "submitted";
  evaluationStatus:
    | "not_applicable"
    | "not_submitted"
    | "awaiting_evaluation"
    | "partially_evaluated"
    | "evaluated";
  createdAt: string;
  submittedAt: string | null;
  assignmentsTotal: number | null;
  assignmentsCompleted: number | null;
  waitingReason:
    | null
    | "no_assignments"
    | "no_completed_evaluations"
    | "partially_evaluated"
    | "awaiting_first_evaluation";
};

export type SolutionManagerSolutions = {
  count: number;
  next: string | null;
  previous: string | null;
  submissionApplicable: boolean;
  mode: "open" | "distributed";
  results: Array<SolutionManagerSolutionRow>;
};
