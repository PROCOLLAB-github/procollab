/** @format */

import { User } from "@domain/auth/user.model";
import { FileModel } from "../file/file.model";

/** Модель отклика на вакансию */
export class VacancyResponse {
  id!: number;
  whyMe!: string;
  isApproved?: boolean;
  user!: User;
  vacancy!: number;
  accompanyingFile!: FileModel;
}
