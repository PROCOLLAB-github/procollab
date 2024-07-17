/** @format */

import { User } from "@auth/models/user.model";
import { FileModel } from "./file.model";

export class VacancyResponse {
  id!: number;
  whyMe!: string;
  isApproved?: boolean;
  user!: User;
  vacancy!: number;
  accompanyingFile!: FileModel;
}
