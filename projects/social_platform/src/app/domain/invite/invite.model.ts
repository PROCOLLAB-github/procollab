/** @format */

import { User } from "@domain/auth/user.model";
import { Project } from "../project/project.model";

/** Модель приглашения в проект */
export class Invite {
  id!: number;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  isAccepted?: boolean;
  motivationalLetter?: string;
  project!: Project;
  role!: string;
  specialization?: string;

  user!: User;

  sender!: User;
}
