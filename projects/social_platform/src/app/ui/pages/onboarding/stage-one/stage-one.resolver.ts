/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { GetSpecializationsNestedUseCase } from "@api/specializations/use-cases/get-specializations-nested.use-case";
import { SpecializationsGroup } from "@domain/specializations/specializations-group.model";
import { EMPTY, map } from "rxjs";

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
 * - Доступ к getSpecializationsNestedUseCase через dependency injection
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
  const getSpecializationsNestedUseCase = inject(GetSpecializationsNestedUseCase);

  return getSpecializationsNestedUseCase
    .execute()
    .pipe(map(result => (result.ok ? result.value : [])));
};
