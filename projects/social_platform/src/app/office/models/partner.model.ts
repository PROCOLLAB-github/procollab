/** @format */

interface Company {
  id: number;
  name: string;
  inn: string;
}

export class Partner {
  id!: number;
  projecId!: number;
  company!: Company;
  contribution!: string;
  decisionMaker!: number;
}

export interface PartnerDto {
  name: string;
  inn: string;
  contribution: string;
  decisionMaker: number;
}
