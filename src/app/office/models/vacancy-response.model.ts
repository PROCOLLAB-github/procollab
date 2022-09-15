/** @format */

import { User } from "../../auth/models/user.model";

export class VacancyResponse {
  id!: number;
  text!: string;
  profile!: User;
}
