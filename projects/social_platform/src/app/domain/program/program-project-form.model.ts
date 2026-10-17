/** @format */

import { PartnerProgramFields } from "./partner-program-fields.model";

export interface ManagementCase {
  name: string;
  projectsCount: number;
}
export interface ManagementFormField extends PartnerProgramFields {
  answersCount: number;
  editableType: boolean;
}
export interface ManagementProjectForm {
  updatedAt: string;
  revision: string;
  hasProjects: boolean;
  cases: ManagementCase[];
  fields: ManagementFormField[];
  supportedTypes: PartnerProgramFields["fieldType"][];
}
export interface ManagementProjectFormWrite {
  expectedUpdatedAt: string;
  expectedRevision: string;
  cases: string[];
  fields: {
    id?: number | null;
    label: string;
    fieldType: PartnerProgramFields["fieldType"];
    isRequired: boolean;
    helpText: string;
    options: string[];
  }[];
}
