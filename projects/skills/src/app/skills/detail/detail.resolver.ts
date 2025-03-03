/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { SkillService } from "../services/skill.service";
import { forkJoin } from "rxjs";
import { TasksResponse, Skill } from "projects/skills/src/models/skill.model";

export type SkillDetailResolve = [TasksResponse, Skill];
export const skillDetailResolver: ResolveFn<SkillDetailResolve> = (route, state) => {
  const skillService = inject(SkillService);

  const skillId = route.params["skillId"];
  return forkJoin([skillService.getTasks(skillId), skillService.getDetail(skillId)]);
};
