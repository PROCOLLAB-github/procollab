/** @format */

export interface Resource {
  id: number;
  projectId: number;
  type: "infrastructure" | "staff" | "financial" | "information";
  description: string;
  partnerCompany: number;
}

export interface ResourcePostForm {
  projectId: number;
  type: string;
  description: string;
  partnerCompany: number;
}
