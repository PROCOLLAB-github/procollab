/** @format */

export interface ProgramAnalyticsOverview {
  program: {
    id: number;
    name: string;
  };
  registrations: ProgramAnalyticsTotal;
  participants: ProgramAnalyticsTotal;
  applications: ProgramAnalyticsTotal & {
    byStatus: {
      draft: number;
      submitted: number;
      approved: number;
      rejected: number;
      withdrawn: number;
      cancelled: number;
    };
    byParticipationMode: {
      undecided: number;
      individual: number;
      team: number;
    };
  };
  teams: ProgramAnalyticsTotal & {
    acceptedMembers: number;
  };
  submissions: ProgramAnalyticsTotal & {
    byStatus: {
      draft: number;
      submitted: number;
      returned: number;
      final: number;
      cancelled: number;
    };
    applicationsWithSubmittedSolution: number;
  };
  expertAssignments: ProgramAnalyticsTotal & {
    byStatus: {
      assigned: number;
      completed: number;
      revoked: number;
    };
  };
  evaluations: ProgramAnalyticsTotal & {
    byStatus: {
      draft: number;
      submitted: number;
    };
  };
}

export interface ProgramAnalyticsTotal {
  total: number;
}

export interface ProgramAnalyticsData {
  overview: ProgramAnalyticsOverview;
  projectCount: number | null;
}

export interface ProgramAnalyticsError {
  kind: "forbidden" | "not_found" | "unauthorized" | "network";
}
