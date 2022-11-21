/** @format */

import { User } from "../../auth/models/user.model";

export class VacancyResponse {
  id!: number;
  whyMe!: string;
  isApproved?: boolean;
  user!: User;
  vacancy!: number;
}
