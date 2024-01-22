/** @format */

import { inject } from "@angular/core";
import type { ResolveFn } from "@angular/router";
import { SkillsService } from "@office/services/skills.service";
import { SkillsGroup } from "@office/models/skills-group";

export const StageTwoResolver: ResolveFn<SkillsGroup[]> = () => {
  const skillsService = inject(SkillsService);

  return skillsService.getSkillsNested();
};
