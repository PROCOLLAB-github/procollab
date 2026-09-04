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
