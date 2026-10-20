/** @format */
export type RegistrationValue = string | string[] | number | null;
export interface RegistrationField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "multiselect";
  helpText: string;
  required: boolean;
  source: "own" | "universities" | "regions";
  options: string[];
  allowOther: boolean;
}
export interface RegistrationSchema {
  mode: "native" | "external";
  fields: RegistrationField[];
}
export interface RegistrationSettings {
  draft: RegistrationSchema;
  published: RegistrationSchema | null;
  revision: number;
  publishedVersion: number;
  publishedAt: string | null;
  link: string | null;
  externalStatus: "not_connected" | "requested" | "connected";
  externalUrl: string;
  connectionComment: string;
  answeredFieldIds: string[];
}
export interface RegistrationPublic {
  id: number;
  name: string;
  version: number;
  fields: RegistrationField[];
  closed: boolean;
  authenticated: boolean;
  enrolled: boolean;
  programUrl: string;
  registrationEnds: string;
}
export interface RegistrationImport {
  options: string[];
  duplicates: number;
  blanks: number;
}
export interface RegistrationResult {
  reviewRequired?: boolean;
  answers?: Record<string, RegistrationValue>;
  enrolled?: boolean;
  programId?: number;
  receipt?: string;
  email?: string;
  access?: string;
  refresh?: string;
}
