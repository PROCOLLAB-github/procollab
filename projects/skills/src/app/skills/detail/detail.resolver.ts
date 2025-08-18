/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { SkillService } from "../services/skill.service";
import { forkJoin } from "rxjs";
import { TasksResponse, Skill } from "projects/skills/src/models/skill.model";

/**
 * Резолвер для детальной страницы навыка
 *
 * Загружает данные перед отображением компонента:
 * - Задачи и статистику пользователя по навыку
 * - Детальную информацию о навыке
 *
 * @param route - Активный маршрут с параметром skillId
 * @returns {Observable<SkillDetailResolve>} Массив с данными задач и информацией о навыке
 */
export type SkillDetailResolve = [TasksResponse, Skill];
export const skillDetailResolver: ResolveFn<SkillDetailResolve> = route => {
  const skillService = inject(SkillService);

  const skillId = route.params["skillId"];
  return forkJoin([skillService.getTasks(skillId), skillService.getDetail(skillId)]);
};
