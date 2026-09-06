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

  fields!: ProgramLinkField[];
}

/** Controlled failures of link-scoped fields/save/submit operations. */
export interface ProgramLinkFieldsError {
  kind: "case_required" | "case_unavailable" | "network" | "server" | "unknown" | "context";
  cause?: unknown;
}
