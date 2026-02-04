/** @format */

import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { FileModel } from "projects/social_platform/src/app/domain/file/file.model";
import { Column } from "./column.model";
import { Goal } from "../project/goals.model";
import { Tag } from "./tag.model";
import { Skill } from "../skills/skill";

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
  startDate: string | null;
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
