/** @format */

export interface Resource {
  id: number;
  projectId: number;
  type: string;
  description: string;
  partnerCompany: number;
}

export interface ResourcePostForm {
  projectId: number;
  type: string;
  description: string;
  partnerCompany: number;
}
