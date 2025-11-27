/** @format */

import { User } from "@auth/models/user.model";
import { FileModel } from "@office/models/file.model";
import { Goal } from "@office/models/goals.model";
import { Skill } from "@office/models/skill";
import { Tag } from "@office/models/tag.model";
import { Column } from "./column.model";

export interface TaskResult {
  description: string;
  accompanyingFile: FileModel;
  isVerified: boolean;
  whoVerified: Pick<User, "id" | "firstName" | "lastName">;
}

export interface TaskPreview {
  id: number;
  columnId: Column["id"];
  title: string;
  priority: number;
  action: number;
  description: string;
  deadlineDate: string;
  tags: Tag[];
  goal: Goal;
  type: string;
  files: FileModel;
  responsible: Pick<User, "id" | "avatar">;
  performers: Pick<User, "id" | "avatar">[];
}

export interface TaskDetail extends TaskPreview {
  score: number;
  creator: Pick<User, "id" | "avatar" | "firstName" | "lastName">;
  datetimeCreated: string;
  dateTaskStart: string;
  requiredSkills: Skill[];
  projectGoal: Pick<Goal, "id" | "title">;
  result: TaskResult;
}
