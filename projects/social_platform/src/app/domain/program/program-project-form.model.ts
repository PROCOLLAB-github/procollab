/** @format */

import { PartnerProgramFields } from "./partner-program-fields.model";

export type ProjectSections = {
  partners: boolean;
  achievements: boolean;
  vacancies: boolean;
  programData: boolean;
};

export interface ManagementCase {
  name: string;
  projectsCount: number;
}
export interface ManagementFormField extends PartnerProgramFields {
  answersCount: number;
  editableType: boolean;
  isVisible?: boolean;
  standard?: boolean;
}
export interface ManagementProjectForm {
  updatedAt: string;
  revision: string;
  hasProjects: boolean;
  cases: ManagementCase[];
  fields: ManagementFormField[];
  supportedTypes: PartnerProgramFields["fieldType"][];
  sections?: ProjectSections;
  teamMinSize?: number | null;
  teamMaxSize?: number | null;
  caseRequired?: boolean;
  caseLabel?: string;
}
export interface ManagementProjectFormWrite {
  expectedUpdatedAt: string;
  expectedRevision: string;
  cases: string[];
  sections?: ProjectSections;
  teamMinSize?: number | null;
  teamMaxSize?: number | null;
  fields: {
    id?: number | null;
    label: string;
    fieldType: PartnerProgramFields["fieldType"];
    isRequired: boolean;
    isVisible?: boolean;
    helpText: string;
    options: string[];
  }[];
}
