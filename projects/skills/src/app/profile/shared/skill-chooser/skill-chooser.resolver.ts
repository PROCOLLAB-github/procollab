/** @format */

import { inject } from "@angular/core";
import { SkillService } from "../../../skills/services/skill.service";

/**
 * Резолвер для предзагрузки данных навыков
 *
 * Загружает все навыки пользователя перед отображением компонента выбора.
 * Используется в маршрутизации для обеспечения доступности данных.
 *
 * @returns {Observable} Поток данных с информацией о навыках пользователя
 */
export const skillChooserResolver = () => {
  const skillsService = inject(SkillService);
  return skillsService.getAll();
};
