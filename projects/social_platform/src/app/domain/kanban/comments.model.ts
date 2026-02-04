/** @format */

import { FileModel } from "projects/social_platform/src/app/domain/file/file.model";
import { TaskDetail } from "./task.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";

export interface Comment {
  id: number;
  taskId: TaskDetail["id"];
  text: string;
  file: FileModel;
  user: {
    id: User["id"];
    firstName: User["firstName"];
    lastName: User["lastName"];
    avatar: User["avatar"];
    role: User["speciality"];
    dateTimeCreated: string;
  };
}
