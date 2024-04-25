/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { SkillService } from "../services/skill.service";

export const skillsListResolver: ResolveFn<any> = () => {
  const skillService = inject(SkillService);
  return skillService.getAll();
};
