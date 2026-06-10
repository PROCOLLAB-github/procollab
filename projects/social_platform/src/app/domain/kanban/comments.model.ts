/** @format */

import { FileModel } from "@domain/file/file.model";
import { TaskDetail } from "./task.model";
import { User, UserRaw } from "@domain/auth/user.model";

export interface Comment {
  id: number;
  taskId: TaskDetail["id"];
  text: string;
  file: FileModel;
  user: {
    id: User["id"];
    firstName: User["firstName"];
    lastName: User["lastName"];
    avatar: UserRaw["avatar"];
    role: UserRaw["speciality"];
    dateTimeCreated: string;
  };
}
