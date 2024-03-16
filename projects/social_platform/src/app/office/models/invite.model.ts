/** @format */
import { User } from "@auth/models/user.model";
import { Project } from "./project.model";

export class Invite {
  id!: number;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  isAccepted?: boolean;
  motivationalLetter?: string;
  project!: Project;

  user!: User;
}
