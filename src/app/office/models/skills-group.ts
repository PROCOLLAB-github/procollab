/** @format */

import { Skill } from "./skill";

export interface SkillsGroup {
  id: number;
  name: string;
  skills: Skill[];
}
