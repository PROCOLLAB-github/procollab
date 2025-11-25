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
  whoVerified: {
    id: User["id"];
    firstName: User["firstName"];
    lastName: User["lastName"];
  };
}

export interface TaskPreview {
  id: number;
  columnId: Column["id"];
  title: string;
  priority: number;
  description: string;
  deadlineDate: string;
  tags: Tag[];
  goal: Goal;
  type: string;
  files: FileModel;
  responsible: {
    id: User["id"];
    avatar: User["avatar"];
  };
  performers: {
    id: User["id"];
    avatar: User["avatar"];
  }[];
}

export interface TaskDetail extends TaskPreview {
  score: number;
  creator: {
    id: User["id"];
    firstName: User["firstName"];
    lastName: User["lastName"];
    avatar: User["avatar"];
  };
  datetimeCreated: string;
  dateTaskStart: string;
  requiredSkills: Skill[];
  projectGoal: {
    id: Goal["id"];
    title: Goal["title"];
  };
  result: TaskResult;
}
