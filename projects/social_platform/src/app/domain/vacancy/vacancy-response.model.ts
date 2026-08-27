/** @format */

import { FileModel } from "../file/file.model";
import { Vacancy } from "./vacancy.model";

export interface VacancyResponseCandidate {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  specialization: {
    id: number;
    name: string;
    category?: { id: number; name: string } | null;
  } | null;
  skills: Array<{ id: number; name: string }>;
  aboutMe: string;
}

export type VacancyResponseFile = Pick<
  FileModel,
  "link" | "name" | "extension" | "mimeType" | "size"
>;

/** Модель отклика на вакансию */
export class VacancyResponse {
  id!: number;
  whyMe!: string;
  isApproved: boolean | null = null;
  user?: VacancyResponseCandidate;
  vacancy!: number | Vacancy;
  accompanyingFile: VacancyResponseFile | null = null;
  datetimeCreated!: string;
  datetimeUpdated!: string;
}
