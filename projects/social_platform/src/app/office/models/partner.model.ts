/** @format */

interface Company {
  id: number;
  name: string;
  inn: string;
}

export interface Partner {
  id: number;
  projecId: number;
  company: Company;
  contribution: string;
  decisionMaker: number;
}

export interface PartnerPostForm {
  name: string;
  inn: string;
  contribution: string;
  decisionMaker: number;
}
