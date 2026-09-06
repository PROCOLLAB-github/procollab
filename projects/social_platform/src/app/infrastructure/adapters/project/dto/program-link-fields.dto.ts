/** @format */

import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

/** Keys are already transformed by the global CamelcaseInterceptor. */
export interface ProgramLinkFieldsDto {
  programLinkId: number;
  programId: number;
  projectId: number;
  submitted: boolean;
  fields: (Omit<PartnerProgramFields, "helpText"> & {
    helpText: string | null;
    value: string | null;
  })[];
}
