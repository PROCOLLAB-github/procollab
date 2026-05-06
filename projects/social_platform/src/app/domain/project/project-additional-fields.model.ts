/** @format */

import { PartnerProgramFields } from "../program/partner-program-fields.model";

export class ProjectAdditionalFields {
  programId!: number;
  canSubmit!: boolean;
  submissionDeadline!: string;
  programFields!: PartnerProgramFields[];
}
