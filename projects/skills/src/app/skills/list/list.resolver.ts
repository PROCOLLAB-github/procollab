/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { SkillService } from "../services/skill.service";

/**
 * Резолвер для списка навыков
 *
 * Загружает список всех доступных навыков перед отображением компонента
 *
 * @returns {Observable<any>} Данные со списком навыков
 */
export const skillsListResolver: ResolveFn<any> = () => {
  const skillService = inject(SkillService);
  return skillService.getAll();
};
