/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { SpecializationsGroup } from "projects/social_platform/src/app/domain/project/specializations-group.model";
import { SpecializationsInfoService } from "@api/specializations/facades/specializations-info.service";

/**
 * РЕЗОЛВЕР ПЕРВОГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Предзагрузка данных специализаций перед отображением компонента stage-one
 *
 * Что делает:
 * - Выполняется автоматически перед активацией маршрута stage-1
 * - Загружает иерархическую структуру специализаций из API
 * - Обеспечивает доступность данных в компоненте через ActivatedRoute
 *
 * Что принимает:
 * - Контекст маршрута (автоматически от Angular Router)
 * - Доступ к SpecializationsService через dependency injection
 *
 * Что возвращает:
 * - Observable<SpecializationsGroup[]> - массив групп специализаций
 * - Данные становятся доступны в компоненте через route.data['data']
 *
 * Преимущества использования резолвера:
 * - Данные загружаются до отображения компонента
 * - Предотвращает показ пустого состояния
 * - Централизованная обработка ошибок загрузки
 */
export const StageOneResolver: ResolveFn<SpecializationsGroup[]> = () => {
  const specializationsService = inject(SpecializationsInfoService);

  return specializationsService.getSpecializationsNested();
};
