/** @format */

import { User } from "@auth/models/user.model";
import { FileModel } from "@office/models/file.model";
import { Goal } from "@office/models/goals.model";
import { Skill } from "@office/models/skill";
import { Tag } from "@office/models/tag.model";
import { Column } from "./column.model";

export interface TaskResult {
  description: string;
  accompanyingFile: FileModel | null;
  isVerified: boolean;
  whoVerified: Pick<User, "id" | "firstName" | "lastName">;
}

export interface TaskPreview {
  id: number;
  columnId: Column["id"];
  title: string;
  type: number;
  priority: number;
  description: string | null;
  deadlineDate: string | null;
  tags: Tag[];
  goal: Pick<Goal, "id" | "title"> | null;
  files: FileModel[];
  responsible: Pick<User, "id" | "avatar"> | null;
  performers: Pick<User, "id" | "avatar">[] | null;
}

export interface TaskDetail extends TaskPreview {
  score: number;
  creator: Pick<User, "id" | "avatar" | "firstName" | "lastName">;
  datetimeCreated: string;
  datetimeTaskStart: string;
  requiredSkills: Skill[];
  isLeaderLeaveComment: boolean;
  projectGoal: Pick<Goal, "id" | "title"> | null;
  result: TaskResult | null;
}
