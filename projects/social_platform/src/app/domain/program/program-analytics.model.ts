/** @format */

export type ProgramEvaluationMode = "open" | "distributed";

export interface ProgramAnalyticsOverview {
  summary: {
    participants: ProgramAnalyticsTotal;
    projects: ProgramAnalyticsTotal;
    experts: ProgramAnalyticsTotal;
    regions: ProgramAnalyticsRegions;
    participantRegions: ProgramAnalyticsRegions;
  };
  participantFunnel: {
    registrations: number;
    uniqueParticipants: number;
    withTeam: number;
    projectCreators: number;
    submittedProjectCreators: number;
  };
  solutionFunnel: {
    created: number;
    notSubmitted: number;
    submitted: number;
    evaluated: number;
  };
  evaluationStatus: {
    mode: ProgramEvaluationMode;
    maxEvaluationsPerProject: number | null;
    assignments: {
      total: number;
      pending: number;
      evaluated: number;
    };
    projects: {
      submitted: number;
      awaitingEvaluation: number;
      partiallyEvaluated: number;
      evaluated: number;
    };
  };
  attention: {
    participantsWithoutTeam: number;
    projectsAwaitingEvaluation: number;
    delayedExperts: ProgramAnalyticsDelayedExperts;
  };
  activity: ProgramAnalyticsActivityPoint[];
}

export interface ProgramAnalyticsTotal {
  total: number;
}

export interface ProgramAnalyticsRegion {
  name: string;
  count: number;
}

export interface ProgramAnalyticsRegions extends ProgramAnalyticsTotal {
  items: ProgramAnalyticsRegion[];
}

export interface ProgramAnalyticsActivityPoint {
  date: string;
  registrations: number;
  submittedSolutions: number;
}

export interface ProgramAnalyticsError {
  kind: "forbidden" | "not_found" | "unauthorized" | "network";
}

/** not_ready — проект не сдан; completed — эксперт заполнил все критерии.
 * pending/in_progress различаются наличием оценённых критериев, не длительностью ожидания.
 */
export type ProgramAnalyticsAssignmentStatus =
  | "not_ready"
  | "pending"
  | "in_progress"
  | "completed";

/** pending включает все незавершённые назначения, в том числе not_ready. */
export type ProgramAnalyticsAssignmentScope = "all" | "completed" | "pending";

/** Безопасная идентичность эксперта из manager API, без контактных/auth-полей. */
export interface ProgramAnalyticsAssignmentExpert {
  expertId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
}

export interface ProgramAnalyticsAssignmentProject {
  id: number;
  name: string;
}

/** Ожидание вычисляет backend на момент запроса. null не означает нулевое ожидание. */
export interface ProgramAnalyticsAssignment {
  assignmentId: number;
  expert: ProgramAnalyticsAssignmentExpert;
  project: ProgramAnalyticsAssignmentProject;
  status: ProgramAnalyticsAssignmentStatus;
  criteriaTotal: number;
  criteriaScored: number;
  assignedAt: string;
  projectSubmitted: boolean;
  projectSubmittedAt: string | null;
  waitingSince: string | null;
  waitingSeconds: number | null;
}

/** isScored означает наличие записи оценки, включая запись с пустым value. */
export interface ProgramAnalyticsAssignmentCriterion {
  criterionId: number;
  name: string;
  description: string | null;
  type: string;
  minValue: number | null;
  maxValue: number | null;
  value: string | null;
  isScored: boolean;
}

/** Все критерии программы без frontend-агрегации баллов. */
export interface ProgramAnalyticsAssignmentScoreDetail extends ProgramAnalyticsAssignment {
  scores: ProgramAnalyticsAssignmentCriterion[];
}

/** Severity и порядок authoritative: warning — >=2 ожиданий 24ч, critical — >=1 48ч.
 * Заглавная H соответствует преобразованию overdue_24h/overdue_48h interceptor-ом.
 */
export interface ProgramAnalyticsDelayedExpert extends ProgramAnalyticsAssignmentExpert {
  assignmentsTotal: number;
  completed: number;
  pending: number;
  overdue24H: number;
  overdue48H: number;
  oldestWaitingSince: string;
  oldestWaitingSeconds: number;
  severity: "warning" | "critical";
}

/** В open-режиме backend возвращает пустую группу; UI не синтезирует задержки. */
export interface ProgramAnalyticsDelayedExperts extends ProgramAnalyticsTotal {
  items: ProgramAnalyticsDelayedExpert[];
}
