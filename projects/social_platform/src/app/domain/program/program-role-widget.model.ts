/**
 * Read-only данные Angular-проектов; legacy currentApplication не используется.
 *
 * @format
 */

export type ProgramWidgetRole = "organizer" | "expert" | "participant";
export type ParticipantStage =
  | "none"
  | "not_submitted"
  | "submitted"
  | "review"
  | "evaluated"
  | "not_applicable";
export interface ParticipantWidget {
  participantProject: { id: number; name: string; programLinkId: number } | null;
  caseProvided: boolean;
  caseName: string | null;
  stage: ParticipantStage;
  submissionOpen: boolean;
}
export interface OrganizerWidget {
  participants: number;
  projects: number;
  submittedSolutions: number | null;
  participantsWithoutProject: number;
}
export interface ExpertWidget {
  mode: "open" | "distributed";
  assigned: number | null;
  remaining: number | null;
  evaluationEnds: string | null;
}
interface WidgetContext {
  programId: number;
  isCompetitive: boolean;
}
export type ProgramRoleWidget = WidgetContext &
  (
    | { role: "participant"; participant: ParticipantWidget }
    | { role: "organizer"; organizer: OrganizerWidget }
    | { role: "expert"; expert: ExpertWidget }
  );
export type ProgramWidgetError =
  | "network"
  | "forbidden"
  | "unauthorized"
  | "not_found"
  | "integrity";
