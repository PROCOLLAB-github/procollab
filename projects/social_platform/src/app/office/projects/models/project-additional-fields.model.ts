/** @format */

import { PartnerProgramFields } from "@office/models/partner-program-fields.model";

export class ProjectAdditionalFields {
  programId!: number;
  canSubmit!: boolean;
  submissionDeadline!: string;
  programFields!: PartnerProgramFields[];
}
