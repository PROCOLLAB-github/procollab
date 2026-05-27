/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { SkillsGroup } from "@domain/skills/skills-group.model";
import { SearchesService } from "@api/searches/searches.service";

/** Предзагружает иерархическую структуру навыков для этапа онбординга. */
export const StageTwoResolver: ResolveFn<SkillsGroup[]> = () => {
  const searchesService = inject(SearchesService);

  return searchesService.getSkillsNested();
};
