/** @format */

import { User } from "../../auth/models/user.model";

export class VacancyResponse {
  text!: string;
  profile!: User;
}
