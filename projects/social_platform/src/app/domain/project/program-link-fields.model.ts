/** @format */

import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

export class ProgramLinkField extends PartnerProgramFields {
  value!: string | null;
}

/** Authoritative definitions and saved values for one Project × Program relation. */
export class ProgramLinkFields {
  programLinkId!: number;
  programId!: number;
  projectId!: number;
  submitted!: boolean;
  /** Submission metadata belongs to this exact link and is computed by the backend. */
  isCompetitive!: boolean;
  submissionOpen!: boolean;
  submissionDeadline!: string | null;
  canSubmit!: boolean;

  fields!: ProgramLinkField[];
}

/** Controlled failures of link-scoped fields/save/submit operations. */
export interface ProgramLinkFieldsError {
  kind:
    | "case_required"
    | "case_unavailable"
    | "submission_closed"
    | "already_submitted"
    | "not_competitive"
    | "network"
    | "server"
    | "unknown"
    | "context";
  cause?: unknown;
}
