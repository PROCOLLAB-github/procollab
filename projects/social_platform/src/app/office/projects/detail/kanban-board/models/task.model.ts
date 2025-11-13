/** @format */

import { User } from "@auth/models/user.model";
import { FileModel } from "@office/models/file.model";
import { Goal } from "@office/models/goals.model";
import { Skill } from "@office/models/skill";
import { Tag } from "@office/models/tag.model";
import { Column } from "./column.model";

export interface TaskPreview {
  id: number;
  columnId: Column["id"];
  name: string;
  priority: number;
  description: string;
  deadlineDate: string;
  tag: Tag;
  Goal: Goal;
  type: string;
  file: FileModel;
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
  projectGoal: Goal["title"];
}

export interface TaskResult {
  id: number;
  description: string;
  file: FileModel;
}
