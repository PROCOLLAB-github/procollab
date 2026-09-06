/** @format */

import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

/** Keys are already transformed by the global CamelcaseInterceptor. */
export interface ProgramLinkFieldsDto {
  programLinkId: number;
  programId: number;
  projectId: number;
  submitted: boolean;
  isCompetitive: boolean;
  submissionOpen: boolean;
  submissionDeadline: string | null;
  canSubmit: boolean;
  fields: (Omit<PartnerProgramFields, "helpText"> & {
    helpText: string | null;
    value: string | null;
  })[];
}
