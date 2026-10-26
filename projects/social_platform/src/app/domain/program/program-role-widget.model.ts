/**
 * Read-only ролевой контракт: проект и решение различаются по storageMode.
 *
 * @format
 */

import {
  SolutionRoleWidget,
  SolutionWidgetStage,
  SolutionWidgetLegacyParticipant,
  SolutionWidgetLegacyOrganizer,
  SolutionWidgetExpert,
} from "@domain/solution/solution-contract.model";

export type ProgramRoleWidget = SolutionRoleWidget;
export type ProgramWidgetRole = ProgramRoleWidget["role"];
export type ParticipantStage = SolutionWidgetStage;
export type ParticipantWidget = SolutionWidgetLegacyParticipant;
export type OrganizerWidget = SolutionWidgetLegacyOrganizer;
export type ExpertWidget = SolutionWidgetExpert;
export type ProgramWidgetError =
  | "network"
  | "forbidden"
  | "unauthorized"
  | "not_found"
  | "integrity";
