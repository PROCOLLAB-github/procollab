/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { SkillsService } from "@office/services/skills.service";
import { SkillsGroup } from "@office/models/skills-group";

/**
 * РЕЗОЛВЕР ВТОРОГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Предзагрузка данных навыков перед отображением компонента stage-two
 *
 * Что делает:
 * - Выполняется автоматически перед активацией маршрута stage-2
 * - Загружает иерархическую структуру навыков из API
 * - Группирует навыки по категориям для удобного отображения
 * - Обеспечивает доступность данных в компоненте через ActivatedRoute
 *
 * Что принимает:
 * - Контекст маршрута (автоматически от Angular Router)
 * - Доступ к SkillsService через dependency injection
 *
 * Что возвращает:
 * - Observable<SkillsGroup[]> - массив групп навыков
 * - Данные становятся доступны в компоненте через route.data['data']
 *
 * Структура данных:
 * - SkillsGroup: группа навыков с названием категории
 * - Каждая группа содержит массив связанных навыков
 * - Используется для организации навыков в UI по категориям
 *
 * Преимущества:
 * - Быстрое отображение интерфейса с готовыми данными
 * - Предотвращение состояния загрузки в компоненте
 * - Централизованная обработка ошибок загрузки данных
 */
export const StageTwoResolver: ResolveFn<SkillsGroup[]> = () => {
  const skillsService = inject(SkillsService);

  return skillsService.getSkillsNested();
};
